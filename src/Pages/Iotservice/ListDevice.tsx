import React, { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';
import SensorsIcon from '@mui/icons-material/Sensors';
import DevicesIcon from '@mui/icons-material/Devices';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SyncIcon from '@mui/icons-material/Sync';
import callDevice from '../../Services/callDevice';
import { Link } from 'react-router-dom';
import WifiIndicator from '../../Component/WifiIndicator';
import BatteryIndicator from '../../Component/BatteryIndicator';
import IotHeader from './HeaderIot';
import './ListDevice.css';

// Helper: check if a device is disconnected (>5 min since last connect)
function isDeviceDisconnected(lastConnect: string | undefined): boolean {
  if (!lastConnect) return true;
  const diff = Date.now() - new Date(lastConnect).getTime();
  return diff > 5 * 60 * 1000;
}

export default function FlatListDevice() {
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [battMap, setBattMap] = useState<Record<string, number>>({});
  const [rssiMap, setRssiMap] = useState<Record<string, number>>({});
  const [startAt, setStartAt] = useState<Record<string, string>>({});
  const [finishAt, setFinishAt] = useState<Record<string, string>>({});
  const [connect_at, setConnectAt] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const deviceRes = await callDevice.get('/List_Devices');

        if (deviceRes.data.dataResult) {
          const list = deviceRes.data.dataResult;
          setDeviceList(list);

          const battValue: Record<string, number> = {};
          const rssiValue: Record<string, number> = {};
          const startTemp: Record<string, string> = {};
          const finishTemp: Record<string, string> = {};
          const connectTemp: Record<string, string> = {};

          await Promise.all(
            list.map(async (item: any) => {
              const sim = item.simEmi?.trim();

              battValue[sim] = item.battValue ? parseFloat(item.battValue) : 0;
              rssiValue[sim] = item.rssiValue ? parseInt(item.rssiValue) : 0;
              connectTemp[sim] = item.connect_at;

              if (!item.id) return;

              try {
                const detailRes = await callDevice.get(`/get_Devices/${item.id}`);
                const deviceData = detailRes.data.dataResult;
                const lastOrder = deviceData?.lastOrder;

                if (lastOrder) {
                  startTemp[sim] = lastOrder.startAt;
                  finishTemp[sim] = lastOrder.finishAt;
                }
              } catch (err) {
                // silent fail for individual device details
              }
            })
          );

          setBattMap(battValue);
          setRssiMap(rssiValue);
          setStartAt(startTemp);
          setFinishAt(finishTemp);
          setConnectAt(connectTemp);
        }
      } catch (error) {
        console.error('❌ Error fetching device list:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDevices();
  }, []);

  // Compute stats
  const onlineCount = deviceList.filter(
    (d) => !isDeviceDisconnected(connect_at[d.simEmi?.trim()])
  ).length;
  const offlineCount = deviceList.length - onlineCount;

  return (
    <>
      <IotHeader title="Device List" />

      <div className="device-list-page">
        {loading ? (
          // ===== Loading State =====
          <div className="loading-container">
            <CircularProgress size={48} sx={{ color: '#1cc4c4' }} />
            <span className="loading-text">Loading devices...</span>
          </div>
        ) : deviceList.length === 0 ? (
          // ===== Empty State =====
          <div className="empty-state">
            <div className="empty-state-icon">
              <SensorsIcon style={{ fontSize: 40, color: '#1cc4c4' }} />
            </div>
            <div className="empty-state-title">No Devices Found</div>
            <div className="empty-state-desc">
              There are no devices connected to the system at the moment.
            </div>
          </div>
        ) : (
          <>
            {/* ===== Summary Stats Bar ===== */}
            <div className="device-stats-bar">
              <div className="stat-card">
                <div className="stat-icon total">
                  <DevicesIcon style={{ fontSize: 22 }} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total</span>
                  <span className="stat-value">{deviceList.length}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon online">
                  <WifiIcon style={{ fontSize: 22 }} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Online</span>
                  <span className="stat-value">{onlineCount}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon offline">
                  <WifiOffIcon style={{ fontSize: 22 }} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Offline</span>
                  <span className="stat-value">{offlineCount}</span>
                </div>
              </div>
            </div>

            {/* ===== Device Cards Grid ===== */}
            <div className="device-grid">
              {deviceList.map((item: any, index: number) => {
                const sim = item.simEmi?.trim();
                const disconnected = isDeviceDisconnected(connect_at[sim]);

                return (
                  <Link
                    to={`/Action/${item.simEmi}`}
                    key={index}
                    className="device-card-link"
                  >
                    <div className="device-card">
                      {/* Card Header */}
                      <div className="device-card-header">
                        <div className="device-card-title">
                          <div className="device-icon-wrapper">
                            <SensorsIcon
                              style={{ fontSize: 24, color: '#1cc4c4' }}
                            />
                          </div>
                          <div>
                            <div className="device-sim-label">Device No.</div>
                            <div className="device-sim-number">{sim}</div>
                          </div>
                        </div>

                        <div
                          className={`status-badge ${disconnected ? 'offline' : 'online'}`}
                        >
                          <span
                            className={`status-dot ${disconnected ? 'offline' : 'online'}`}
                          />
                          {disconnected ? 'Offline' : 'Online'}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="device-card-body">
                        <div className="info-row">
                          <div className="info-icon">
                            <AssignmentIcon
                              style={{ fontSize: 16, color: '#6b7fa3' }}
                            />
                          </div>
                          <span className="info-label">Order ID</span>
                          <span className="info-value">
                            {item.orderId || '—'}
                          </span>
                        </div>

                        <div className="info-row">
                          <div className="info-icon">
                            <AccessTimeIcon
                              style={{ fontSize: 16, color: '#6b7fa3' }}
                            />
                          </div>
                          <span className="info-label">Start</span>
                          <span className="info-value">
                            {startAt[sim]
                              ? new Date(startAt[sim]).toLocaleString('th-TH')
                              : '—'}
                          </span>
                        </div>

                        <div className="info-row">
                          <div className="info-icon">
                            <EventAvailableIcon
                              style={{ fontSize: 16, color: '#6b7fa3' }}
                            />
                          </div>
                          <span className="info-label">Finish</span>
                          <span className="info-value">
                            {finishAt[sim]
                              ? new Date(finishAt[sim]).toLocaleString('th-TH')
                              : '—'}
                          </span>
                        </div>

                        <div className="info-row">
                          <div className="info-icon">
                            <SyncIcon
                              style={{ fontSize: 16, color: '#6b7fa3' }}
                            />
                          </div>
                          <span className="info-label">Connected</span>
                          <span className="info-value">
                            {connect_at[sim]
                              ? new Date(connect_at[sim]).toLocaleString(
                                  'th-TH'
                                )
                              : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="device-card-footer">
                        <BatteryIndicator level={battMap[sim] ?? 0} />
                        {disconnected ? (
                          <WifiIndicator
                            strength={0}
                            isConnected={false}
                          />
                        ) : (
                          <WifiIndicator
                            strength={rssiMap[sim] ?? 0}
                            isConnected={true}
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
