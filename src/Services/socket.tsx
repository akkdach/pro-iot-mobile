import { io } from "socket.io-client";

// ชี้ไปที่ backend socket.io ของคุณ
const socket = io("http://localhost:3000", {
  transports: ["websocket"], // บังคับใช้ websocket
});

export default socket;