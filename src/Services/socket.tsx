import { io } from "socket.io-client";

// ชี้ไปที่ backend socket.io ของคุณ
const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:3000", {
  transports: ["websocket"], // บังคับใช้ websocket
});

export default socket;