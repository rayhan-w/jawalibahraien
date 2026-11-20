import { NextResponse } from 'next/server';

export async function GET(req) {
  return NextResponse.json({
    success: true,
    user: {
      username: 'admin',
      name: 'Jawali Telecom Super Admin',
      role: 'superadmin',
    }
  });
}
