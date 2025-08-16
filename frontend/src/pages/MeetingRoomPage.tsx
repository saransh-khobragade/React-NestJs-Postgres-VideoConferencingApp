import type { ReactElement } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { connectSocket } from '@/services/meetingService';

type Peer = {
  pc: RTCPeerConnection;
  stream: MediaStream;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
};

const rtcConfig: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

export function MeetingRoomPage(): ReactElement {
  const meetingId = useMemo(() => window.location.pathname.split('/').pop() ?? '', []);
  const name = useMemo(() => new URLSearchParams(window.location.search).get('name') ?? 'Guest', []);

  const [socket, setSocket] = useState<ReturnType<typeof connectSocket> | null>(null);
  const [peers, setPeers] = useState<Record<string, Peer>>({});
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!isMounted) return;
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const s = connectSocket();
      setSocket(s);

      s.on('connect', async () => {
        s.emit('join', { meetingId, name });
      });

      s.on('meeting-not-found', () => {
        alert('Meeting not found');
        window.location.href = '/video';
      });

      s.on('joined', async (res: { joined: string; clientId: string; peers: string[] }) => {
        const existingPeers: string[] = res?.peers ?? [];
        for (const peerId of existingPeers) {
          await createOfferToPeer(s, peerId);
        }
      });

      s.on('peer-joined', async ({ clientId }: { clientId: string }) => {
        await createOfferToPeer(s, clientId);
      });

      s.on('offer', async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
        const peer = await ensurePeer(from);
        await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peer.pc.createAnswer();
        await peer.pc.setLocalDescription(answer);
        s.emit('answer', { meetingId, to: from, sdp: answer });
      });

      s.on('answer', async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
        const peer = peers[from];
        if (peer) {
          await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      });

      s.on('ice-candidate', async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
        const peer = peers[from];
        if (peer && candidate) {
          try { await peer.pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
        }
      });

      s.on('peer-left', ({ clientId }: { clientId: string }) => {
        const peer = peers[clientId];
        if (peer) {
          peer.pc.close();
          delete peers[clientId];
          setPeers({ ...peers });
        }
      });

      async function ensurePeer(peerId: string): Promise<Peer> {
        if (peers[peerId]) return peers[peerId];
        const pc = new RTCPeerConnection(rtcConfig);
        const remoteStream = new MediaStream();
        const videoRef = useRef<HTMLVideoElement>(null);

        if (localStreamRef.current) {
          for (const track of localStreamRef.current.getTracks()) {
            pc.addTrack(track, localStreamRef.current);
          }
        }

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            s.emit('ice-candidate', { meetingId, to: peerId, candidate: e.candidate });
          }
        };

        pc.ontrack = (e) => {
          const first = e.streams?.[0];
          if (first) {
            for (const track of first.getTracks()) {
              remoteStream.addTrack(track);
            }
          } else if (e.track) {
            remoteStream.addTrack(e.track);
          }
          if (videoRef.current) {
            videoRef.current.srcObject = remoteStream;
          }
        };

        const peer: Peer = { pc, stream: remoteStream, videoRef };
        setPeers((prev) => ({ ...prev, [peerId]: peer }));
        return peer;
      }

      async function createOfferToPeer(skt: ReturnType<typeof connectSocket>, peerId: string): Promise<void> {
        const peer = await ensurePeer(peerId);
        const offer = await peer.pc.createOffer();
        await peer.pc.setLocalDescription(offer);
        skt.emit('offer', { meetingId, to: peerId, sdp: offer });
      }
    })();
    return () => {
      isMounted = false;
      for (const peer of Object.values(peers)) {
        peer.pc.close();
      }
      if (socket) socket.disconnect();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleMute = (): void => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const track of stream.getAudioTracks()) track.enabled = !track.enabled;
    setMuted(!muted);
  };

  const toggleCamera = (): void => {
    const stream = localStreamRef.current;
    if (!stream) return;
    for (const track of stream.getVideoTracks()) track.enabled = !track.enabled;
    setCameraOff(!cameraOff);
  };

  const leave = (): void => {
    window.location.href = '/video';
  };

  return (
    <div className="min-h-screen p-4 flex flex-col gap-4">
      <div className="flex gap-2">
        <Button onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</Button>
        <Button onClick={toggleCamera}>{cameraOff ? 'Camera On' : 'Camera Off'}</Button>
        <Button variant="destructive" onClick={leave}>Leave</Button>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full rounded bg-black" />
        {Object.entries(peers).map(([peerId, peer]) => (
          <video key={peerId} ref={peer.videoRef} autoPlay playsInline className="w-full rounded bg-black" />
        ))}
      </div>
    </div>
  );
}

