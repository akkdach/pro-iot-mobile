import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import IotHeader from './HeaderIot';
import DeviceAction from './ActionDevices';
import StatPort1 from './StatPort1';
import StatPort2 from './StatPort2';
import SensorsIcon from '@mui/icons-material/Sensors';
import TuneIcon from '@mui/icons-material/Tune';
import './ActionPages.css';

const tabs = [
  { id: 'control', label: 'Control' },
  { id: 'port1', label: 'Port 1' },
  { id: 'port2', label: 'Port 2' },
];

const ActionPages = () => {
  const [activeTab, setActiveTab] = useState('control');

  return (
    <>
      <IotHeader title="Device Control" />

      <div className="action-page">
        {/* Segmented Tab Control */}
        <div className="tab-strip">
          <div className="tab-group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'control' && <DeviceAction />}
          {activeTab === 'port1' && <StatPort1 />}
          {activeTab === 'port2' && <StatPort2 />}
        </div>
      </div>
    </>
  );
};

export default ActionPages;