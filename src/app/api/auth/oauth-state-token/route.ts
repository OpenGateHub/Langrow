import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ message: 'Missing or invalid userId' }, { status: 400 });
    }

    const secret = process.env.OAUTH_STATE_SECRET;
    if (!secret) {
      console.error('Missing OAUTH_STATE_SECRET environment variable');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }

    const token = jwt.sign({ userId }, secret, { expiresIn: '10m' });

    return NextResponse.json({ state: token });
  } catch (error) {
    console.error('Error generating OAuth token:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
