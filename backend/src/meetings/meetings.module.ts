import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { SignalingGateway } from './signaling.gateway';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService, SignalingGateway],
})
export class MeetingsModule {}

