import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ transports: ['websocket'], cors: { origin: '*' } })
export class SocketsGateway {
  @WebSocketServer()
  private readonly server: Server;
}
