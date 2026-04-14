import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('SocketGateway');

  afterInit(server: Server) {
    this.logger.log('SocketGateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitPaymentReceived(data: any) {
    this.server.emit('payment.received', data);
  }

  emitNotificationReceived(data: any) {
    this.server.emit('notification.received', data);
  }

  emitWebhookLogUpdated(data: any) {
    this.server.emit('webhook.log.updated', data);
  }

  emitCustomerCreated(data: any) {
    console.log(`[SocketGateway] Emitting customer.created for customer: ${data.name} (${data.id})`);
    this.server.emit('customer.created', data);
  }
}
