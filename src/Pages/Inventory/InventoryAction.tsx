import React from 'react';
import './FloatingButtons.css'; // นำเข้าไฟล์ CSS
interface IInventoryAction {
    handleNew:()=>void
}
export default function InventoryAction({handleNew}:IInventoryAction) {
  return (
    <div className="fab-container">
      {/* ปุ่มย่อย */}
      {/* <button className="fab-button small" title="โทร">
        📞
      </button>
      <button className="fab-button small" title="แชท">
        💬
      </button> */}

      {/* ปุ่มหลัก */}
      <button className="fab-button main" title="เมนูหลัก" >
        ＋
      </button>
    </div>
  );
}
