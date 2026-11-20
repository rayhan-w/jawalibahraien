import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    // Default admin credential check
    if (
      (username === 'admin' || username === 'jawali') &&
      (password === 'admin123' || password === 'jawali2026')
    ) {
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: { username: 'admin', role: 'superadmin', name: 'Jawali Telecom Administrator' }
      });
      response.cookies.set('jawali_admin_token', 'session_auth_token_verified', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 86400 * 7,
      });
      return response;
    }
    return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
