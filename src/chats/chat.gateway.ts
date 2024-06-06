import { Logger, UnauthorizedException } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatRepository } from './chatRepository';
import axios from 'axios';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{

  constructor(private readonly chatRepository : ChatRepository){}

  @WebSocketServer()
  server: Server;

  private usuariosLogueados = new Set()
  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket server inicializado');
  }

  handleDisconnect(client: Socket) {
    // this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  async handleConnection(client: Socket, ...args: any[]) {

    // this.logger.log(`Cliente conectado: ${client}`);
    
  }


  @SubscribeMessage('authenticate')
  async handleAuthenticate(client: Socket, token: string): Promise<void> {
    try {
      const response = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
        headers: {
          authorization: `Bearer ${token}`,
        }
      })
      const userEmail = response.data.email;
      const user = {id: client.id, email: userEmail}
      this.usuariosLogueados.add(user);
      this.logger.log(`Usuario autenticado: ${userEmail}`);
      this.server.emit('users', Array.from(this.usuariosLogueados.values()));
      
    } catch (error) {

      this.logger.log(`Autenticación fallida para cliente: ${client.id}`);
      client.disconnect();
      throw new UnauthorizedException('Invalid token');

    }
  }

  @SubscribeMessage('msgToCommunity')
  handleMessageCommunity(@ConnectedSocket() client: Socket, @MessageBody() data: string): void {
    if (this.usuariosLogueados.has(client.id)) {
      this.usuariosLogueados.forEach((email, clientId : string) => {
        this.server.to(clientId).emit('msgToCommunity', data);
      });
    } else {
      this.logger.log(`Usuario no autenticado intentó enviar un mensaje: ${client.id}`);
      client.disconnect();
    }
  }



}
 