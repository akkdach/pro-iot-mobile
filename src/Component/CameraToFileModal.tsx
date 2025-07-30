import React from 'react';
import CameraCaptureToFile from './CameraCaptureToFile';

interface CameraCaptureProps  {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (files: File[]) => void;

};

const CameraModalToFile = ({ isOpen, onClose, onCapture } : CameraCaptureProps) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>✖</button>
                <CameraCaptureToFile  onCapture={onCapture} />
            </div>
        </div>
    );
};

export default CameraModalToFile;
