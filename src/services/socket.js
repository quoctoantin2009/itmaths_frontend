// src/services/socket.js
const getSocketUrl = () => {
  // Tự động nhận diện: Nếu chạy ở localhost thì dùng ws, chạy trên Render thì dùng wss
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.hostname === 'localhost' 
    ? 'localhost:8000' 
    : 'itmaths-backend.onrender.com'; // Địa chỉ Backend Render của bạn
    
  return `${protocol}://${host}/ws/arena/`;
};

class ArenaSocket {
  constructor() {
    this.socket = null;
  }

  connect(pin, onMessage) {
    if (this.socket) this.socket.close();

    const url = `${getSocketUrl()}${pin}/`;
    console.log("Đang kết nối WebSocket tới:", url);
    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    this.socket.onclose = () => console.log("Hệ thống Đấu trường đã ngắt kết nối.");
    this.socket.onerror = (err) => console.error("Lỗi kết nối Đấu trường:", err);
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.socket) this.socket.close();
  }
}

export const arenaSocket = new ArenaSocket();