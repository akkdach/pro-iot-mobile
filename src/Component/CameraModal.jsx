import React from 'react';
import CameraCapture from './CameraCapture';

// interface CameraCaptureProps  {
//     isOpen: boolean;
//     onClose: () => void;
//     onCapture?: IntrinsicAttributes;
// };

const CameraModal = ({ isOpen, onClose, onCapture }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>✖</button>
                <CameraCapture  onCapture={onCapture} />
            </div>
        </div>
    );
};

export default CameraModal;
