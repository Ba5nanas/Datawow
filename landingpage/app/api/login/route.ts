import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    console.log(response);
    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const { access_token } = data;

    // Decode JWT payload to get role
    const payload = JSON.parse(Buffer.from(access_token.split('.')[1], 'base64').toString());
    const itemRole = payload.role;

    return NextResponse.json({ token: access_token, role: itemRole });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: error || 'Internal server error' },
      { status: 500 }
    );
  }
}
