import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await login(username, password);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 401 }
    );
  }
}
