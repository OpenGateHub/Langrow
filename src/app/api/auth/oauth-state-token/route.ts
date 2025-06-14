import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  console.log(searchParams.toString());

  if (!userId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const secret = process.env.OAUTH_STATE_SECRET;

  if (!secret) {
    return NextResponse.json({ message: 'Missing JWT secret' }, { status: 500 });
  }

  const token = jwt.sign({ userId }, secret, { expiresIn: '10m' });

  return NextResponse.json({ state: token });
}
