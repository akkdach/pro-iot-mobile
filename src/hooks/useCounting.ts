/**
 * useCounting Hook
 * React hook สำหรับจัดการ state ระบบตรวจนับอะไหล่
 * รองรับ Offline Mode และ Optimistic Updates
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Vehicle,
    InventoryItem,
    CountSheetDetail,
    CountLine,
    SyncEvent,
    MismatchReason,
    CountProgress,
} from '../types/counting.types';
import {
    getVehicleInventory,
    getVehicles,
    createCountSheet,
    getCountSheet,
    updateCountLine,
    saveCountSheet,
    submitCountSheet,
    syncQueue,
    saveQueueToStorage,
    loadQueueFromStorage,
    generateUUID,
} from '../Services/countingApi';

interface UseCountingOptions {
    token?: string;
    autoSyncInterval?: number; // ms, default 30000
}

interface UseCountingReturn {
    // State
    vehicles: Vehicle[];
    vehicle: Vehicle | null;
    sheet: CountSheetDetail | null;
    items: InventoryItem[];
    progress: CountProgress;
    online: boolean;
    queue: SyncEvent[];
    loading: boolean;
    error: string | null;

    // Actions
    loadVehicles: () => Promise<void>;
    selectVehicle: (vehicle: Vehicle) => void;
    startCounting: () => Promise<void>;
    setCount: (line: CountLine, countedQty: number, reason?: MismatchReason) => Promise<void>;
    incrementCount: (line: CountLine) => Promise<void>;
    decrementCount: (line: CountLine) => Promise<void>;
    save: () => Promise<void>;
    submit: () => Promise<string>;
    flushQueue: () => Promise<void>;
    findItemByBarcode: (barcode: string) => CountLine | undefined;
    reset: () => void;
}

export function useCounting(options: UseCountingOptions = {}): UseCountingReturn {
    const { token, autoSyncInterval = 30000 } = options;

    // State
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [sheet, setSheet] = useState<CountSheetDetail | null>(null);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [queue, setQueue] = useState<SyncEvent[]>(() => loadQueueFromStorage());
    const [online, setOnline] = useState<boolean>(navigator.onLine);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Online/offline listener
    useEffect(() => {
        const handleOnline = () => setOnline(true);
        const handleOffline = () => setOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Persist queue to localStorage
    useEffect(() => {
        saveQueueToStorage(queue);
    }, [queue]);

    // Auto sync when online
    useEffect(() => {
        if (!online || queue.length === 0) return;

        const timer = setTimeout(() => {
            flushQueue();
        }, 2000); // Wait 2s after coming online

        return () => clearTimeout(timer);
    }, [online, queue.length]);

    // Auto sync interval
    useEffect(() => {
        if (!autoSyncInterval || autoSyncInterval <= 0) return;

        const interval = setInterval(() => {
            if (online && queue.length > 0) {
                flushQueue();
            }
        }, autoSyncInterval);

        return () => clearInterval(interval);
    }, [autoSyncInterval, online, queue.length]);

    // Calculate progress
    const progress = useMemo<CountProgress>(() => {
        if (!sheet || !sheet.lines.length) {
            return { counted: 0, total: 0, percentage: 0 };
        }
        const counted = sheet.lines.filter(l => l.countedQty !== null).length;
        const total = sheet.lines.length;
        const percentage = Math.round((counted / total) * 100);
        return { counted, total, percentage };
    }, [sheet]);

    // Load vehicles
    const loadVehicles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getVehicles(token);
            setVehicles(res.vehicles);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Select vehicle
    const selectVehicle = useCallback((v: Vehicle) => {
        setVehicle(v);
    }, []);

    // Start counting session
    // Backend ดึง vehicleId/teamId จาก JWT token โดยอัตโนมัติ
    const startCounting = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Create new count sheet (backend จะดึง vehicle/team จาก JWT)
            const sheetRes = await createCountSheet(token);

            // Get full sheet details
            const detailRes = await getCountSheet(sheetRes.sheet.id, token);
            setSheet(detailRes.sheet);

            // Load inventory from sheet's vehicleId
            if (detailRes.sheet.vehicleId) {
                const invRes = await getVehicleInventory(detailRes.sheet.vehicleId, token);
                setItems(invRes.items);

                // Set vehicle if found
                const v = vehicles.find(v => v.id === detailRes.sheet.vehicleId);
                if (v) setVehicle(v);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start counting');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [token, vehicles]);

    // Determine line status based on quantities
    const determineStatus = (systemQty: number, countedQty: number): CountLine['status'] => {
        if (countedQty === systemQty) return 'matched';
        if (countedQty > systemQty) return 'over';
        return 'mismatch';
    };

    // Set count with optimistic update
    const setCount = useCallback(async (
        line: CountLine,
        countedQty: number,
        reason?: MismatchReason
    ) => {
        const event: SyncEvent = {
            id: generateUUID(),
            type: 'COUNT_LINE_UPDATE',
            payload: {
                sheetId: line.sheetId,
                lineId: line.id,
                countedQty,
                reason,
            },
            timestamp: Date.now(),
            idempotencyKey: generateUUID(),
        };

        // Optimistic update
        setSheet(prev => {
            if (!prev) return prev;

            const lines = prev.lines.map(l =>
                l.id === line.id
                    ? {
                        ...l,
                        countedQty,
                        reason,
                        status: determineStatus(l.systemQty, countedQty),
                        updatedAt: new Date().toISOString(),
                    }
                    : l
            );

            return {
                ...prev,
                lines: lines as CountLine[],
                progress: {
                    counted: lines.filter(l => l.countedQty !== null).length,
                    total: lines.length,
                },
            };
        });

        // Try to sync immediately if online
        if (online) {
            try {
                await updateCountLine(
                    line.sheetId,
                    line.id,
                    { countedQty, reason },
                    token,
                    event.idempotencyKey
                );
                // Trigger haptic feedback on success
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
            } catch {
                // Queue for later if sync fails
                setQueue(q => [...q, event]);
            }
        } else {
            // Queue when offline
            setQueue(q => [...q, event]);
        }
    }, [online, token]);

    // Increment count
    const incrementCount = useCallback(async (line: CountLine) => {
        const currentQty = line.countedQty ?? line.systemQty;
        await setCount(line, currentQty + 1);
    }, [setCount]);

    // Decrement count
    const decrementCount = useCallback(async (line: CountLine) => {
        const currentQty = line.countedQty ?? line.systemQty;
        if (currentQty > 0) {
            await setCount(line, currentQty - 1);
        }
    }, [setCount]);

    // Save draft
    const save = useCallback(async () => {
        if (!sheet) return;

        setLoading(true);
        setError(null);
        try {
            // Flush queue first
            if (queue.length > 0 && online) {
                await flushQueue();
            }

            const res = await saveCountSheet(sheet.id, token);
            setSheet(res.sheet);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [sheet, queue, online, token]);

    // Submit
    const submit = useCallback(async (): Promise<string> => {
        if (!sheet) throw new Error('No sheet to submit');

        setLoading(true);
        setError(null);
        try {
            // Flush queue first
            if (queue.length > 0 && online) {
                await flushQueue();
            }

            const res = await submitCountSheet(sheet.id, token);
            setSheet(prev => prev ? { ...prev, status: 'submitted' } : prev);
            return res.status;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [sheet, queue, online, token]);

    // Flush offline queue
    const flushQueue = useCallback(async () => {
        if (!queue.length || !online) return;

        try {
            const res = await syncQueue(queue, token);
            // Remove successful events from queue
            setQueue(prev => prev.filter(e => !res.result.successIds.includes(e.id)));
        } catch (err) {
            console.error('Failed to flush queue:', err);
        }
    }, [queue, online, token]);

    // Find item by barcode/SKU
    const findItemByBarcode = useCallback((barcode: string): CountLine | undefined => {
        if (!sheet) return undefined;

        return sheet.lines.find(line => {
            const item = items.find(i => i.id === line.itemId);
            return item?.sku === barcode || item?.id === barcode;
        });
    }, [sheet, items]);

    // Reset state
    const reset = useCallback(() => {
        setVehicle(null);
        setSheet(null);
        setItems([]);
        setError(null);
    }, []);

    return {
        vehicles,
        vehicle,
        sheet,
        items,
        progress,
        online,
        queue,
        loading,
        error,
        loadVehicles,
        selectVehicle,
        startCounting,
        setCount,
        incrementCount,
        decrementCount,
        save,
        submit,
        flushQueue,
        findItemByBarcode,
        reset,
    };
}

export default useCounting;
