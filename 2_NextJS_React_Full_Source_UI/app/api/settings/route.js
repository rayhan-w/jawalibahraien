import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT setting_key, setting_value FROM settings');
    const settingsObj = {};
    if (rows && rows.length > 0) {
      rows.forEach((r) => {
        settingsObj[r.setting_key] = r.setting_value;
      });
    } else {
      const mock = db.getMockDb().settings;
      Object.assign(settingsObj, mock);
    }
    return NextResponse.json({ success: true, data: settingsObj });
  } catch (err) {
    return NextResponse.json({ success: true, data: db.getMockDb().settings });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const mock = db.getMockDb().settings;
    for (const [key, val] of Object.entries(body)) {
      mock[key] = val;
    }
    return NextResponse.json({ success: true, message: 'Settings saved successfully', data: mock });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
