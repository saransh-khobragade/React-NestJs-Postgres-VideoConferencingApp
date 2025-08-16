import { Injectable } from '@nestjs/common';

type Meeting = { id: string; createdAt: string };

@Injectable()
export class MeetingsService {
  private readonly meetings = new Map<string, Meeting>();

  createMeeting(): Meeting {
    const id = this.generateMeetingId();
    const meeting: Meeting = { id, createdAt: new Date().toISOString() };
    this.meetings.set(id, meeting);
    return meeting;
  }

  hasMeeting(meetingId: string): boolean {
    return this.meetings.has(meetingId);
  }

  private generateMeetingId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

