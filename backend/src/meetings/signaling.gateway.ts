import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MeetingsService } from './meetings.service';

type SignalPayload = {
  meetingId: string;
  from: string; // client id
  to?: string; // target client id
  sdp?: unknown;
  candidate?: unknown;
};

@WebSocketGateway({ namespace: 'meet', cors: { origin: '*' } })
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly meetingsService: MeetingsService) {}

  handleConnection(client: Socket) {
    // no auth for MVP
  }

  handleDisconnect(client: Socket) {
    const meetingId = (client.data.meetingId ?? '') as string;
    if (meetingId) {
      this.server.to(meetingId).emit('peer-left', { clientId: client.id });
    }
  }

  @SubscribeMessage('join')
  async onJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { meetingId: string; name?: string },
  ) {
    const { meetingId } = data;
    if (!this.meetingsService.hasMeeting(meetingId)) {
      client.emit('meeting-not-found');
      return;
    }
    client.data.meetingId = meetingId;
    await client.join(meetingId);
    const peers = Array.from((await this.server.in(meetingId).fetchSockets()).map((s) => s.id)).filter(
      (id) => id !== client.id,
    );
    client.emit('joined', { joined: meetingId, clientId: client.id, peers });
    this.server.to(meetingId).emit('peer-joined', { clientId: client.id });
  }

  @SubscribeMessage('offer')
  onOffer(@ConnectedSocket() client: Socket, @MessageBody() payload: SignalPayload) {
    const { meetingId, to, sdp } = payload;
    if (!meetingId || !to) return;
    this.server.to(to).emit('offer', { from: client.id, sdp });
  }

  @SubscribeMessage('answer')
  onAnswer(@ConnectedSocket() client: Socket, @MessageBody() payload: SignalPayload) {
    const { meetingId, to, sdp } = payload;
    if (!meetingId || !to) return;
    this.server.to(to).emit('answer', { from: client.id, sdp });
  }

  @SubscribeMessage('ice-candidate')
  onIceCandidate(@ConnectedSocket() client: Socket, @MessageBody() payload: SignalPayload) {
    const { meetingId, to, candidate } = payload;
    if (!meetingId || !to) return;
    this.server.to(to).emit('ice-candidate', { from: client.id, candidate });
  }
}

