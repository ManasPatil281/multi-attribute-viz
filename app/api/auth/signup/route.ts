import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, username } = await request.json();

    if (!email || !password || !name || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await signUp(email, password, name, username);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Signup failed' },
      { status: 400 }
    );
  }
}
