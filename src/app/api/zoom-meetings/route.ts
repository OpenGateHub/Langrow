import { NextRequest, NextResponse } from 'next/server';
import ZoomIntegration from '@/lib/ZoomIntegration';

export async function POST(req: NextRequest) {
  const { accessToken, meetingData } = await req.json();
  const zoom = new ZoomIntegration();

  try {
    const meeting = await zoom.createMeeting(accessToken, meetingData);
    return NextResponse.json(meeting);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { accessToken, meetingId } = await req.json();
  const zoom = new ZoomIntegration();

  try {
    await zoom.cancelMeeting(accessToken, meetingId);
    return NextResponse.json({ message: 'Reunión cancelada' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
