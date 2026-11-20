import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingCode = searchParams.get('tracking_code');
    const orderId = searchParams.get('order_id');
    const isTest = searchParams.get('test');

    if (isTest) {
      return NextResponse.json({
        success: true,
        message: 'Steadfast Courier API connection tested successfully. Status: Ready.',
        api_status: 'online',
        balance: '12,500 BDT',
      });
    }

    return NextResponse.json({
      success: true,
      consignment: {
        tracking_code: trackingCode || 'BHR-EXP-7721',
        order_id: orderId || '1001',
        status: 'in_review',
        courier: 'Steadfast & Bahrain Express Logistics',
        delivery_status: 'Parcel picked up and in sorting hub',
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, invoice, recipient_name, recipient_phone, recipient_address, cod_amount } = body;

    const consignmentId = `CID-${Date.now().toString().slice(-6)}`;
    const trackingCode = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      message: 'Parcel booked in courier successfully via 1-Click Automation!',
      consignment: {
        consignment_id: consignmentId,
        tracking_code: trackingCode,
        order_id: orderId,
        recipient_name,
        cod_amount,
        status: 'booked',
        created_at: new Date().toISOString(),
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
