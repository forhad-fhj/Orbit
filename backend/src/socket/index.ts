import { Server } from 'socket.io';
import { handleConnection } from './handlers';

export function initializeSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    handleConnection(socket, io);
  });
}

