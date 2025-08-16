import { api, WS_BASE_URL } from './api';
import { io, Socket } from 'socket.io-client';

export type CreateMeetingResponse = { id: string; createdAt: string };

export const createMeeting = async (): Promise<CreateMeetingResponse> => {
  return api.post<CreateMeetingResponse>('/meetings', {});
};

export type JoinResponse = {
  joined?: string;
  clientId?: string;
  peers?: string[];
  error?: string;
};

export const connectSocket = (): Socket => {
  return io(`${WS_BASE_URL}/meet`, { transports: ['websocket'] });
};

