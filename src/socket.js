import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001";

let socket = null;

export function getSocket(token) {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}