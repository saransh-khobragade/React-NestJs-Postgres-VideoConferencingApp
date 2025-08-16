import type { ReactElement, FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createMeeting } from '@/services/meetingService';

export function VideoHomePage(): ReactElement {
  const [name, setName] = useState('');
  const [meetingId, setMeetingId] = useState('');

  const onCreate = async (): Promise<void> => {
    const meeting = await createMeeting();
    window.location.href = `/meeting/${meeting.id}?name=${encodeURIComponent(name || 'Guest')}`;
  };

  const onJoin = (e: FormEvent): void => {
    e.preventDefault();
    if (!meetingId) return;
    window.location.href = `/meeting/${meetingId}?name=${encodeURIComponent(name || 'Guest')}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Simple Video Call</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex gap-2">
              <Button className="w-full" onClick={onCreate}>Create Meeting</Button>
            </div>
            <form className="space-y-2" onSubmit={onJoin}>
              <Input placeholder="Enter Meeting ID" value={meetingId} onChange={(e) => setMeetingId(e.target.value.toUpperCase())} />
              <Button className="w-full" type="submit">Join</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

