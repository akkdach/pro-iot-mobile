import React from 'react';
import './TopBar.css';
import { Link } from 'react-router-dom';

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="logo">Bevpro asia</div>
      <div className="menu">
        {/* <Link onClick={()=>}>Back</Link> */}
      </div>
    </div>
  );
};

export default TopBar;
