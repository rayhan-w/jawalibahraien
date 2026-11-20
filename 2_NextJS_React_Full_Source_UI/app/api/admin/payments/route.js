import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const mock = db.getMockDb();

    // If type=methods, return all configured payment gateways/methods
    if (type === 'methods') {
      return NextResponse.json({ success: true, data: mock.paymentMethods });
    }

    // Default: return verification list & methods
    return NextResponse.json({
      success: true,
      data: mock.paymentMethods,
      orders: [
        {
          id: 1001,
          order_number: 'JAW-1001',
          customer_name: 'Ahmed Al-Khalifa',
          customer_phone: '+973 3988 1234',
          total_price: '495.000',
          currency: 'BHD',
          payment_method: 'benefitpay',
          payment_status: 'verified',
          trx_id: 'BNF-99382103',
          created_at: new Date().toISOString(),
        },
        {
          id: 1002,
          order_number: 'JAW-1002',
          customer_name: 'Salman Rashid',
          customer_phone: '+973 3456 7890',
          total_price: '18.500',
          currency: 'BHD',
          payment_method: 'benefitpay',
          payment_status: 'pending',
          trx_id: 'BNF-77401924',
          created_at: new Date().toISOString(),
        },
        {
          id: 1003,
          order_number: 'JAW-1003',
          customer_name: 'Rashid Khan',
          customer_phone: '01339893391',
          total_price: '5,158',
          currency: 'BDT',
          payment_method: 'bdt_wallet',
          payment_status: 'pending',
          trx_id: 'BK99X8771A',
          created_at: new Date().toISOString(),
        }
      ]
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const mock = db.getMockDb();

    // 1. Add or Update Payment Method
    if (body.action === 'save_method') {
      const method = body.method;
      if (!method || !method.name) {
        return NextResponse.json({ success: false, message: 'Payment method name is required' }, { status: 400 });
      }

      const existingIndex = mock.paymentMethods.findIndex(
        (m) => m.id === method.id || m.code === method.code
      );

      if (existingIndex >= 0) {
        mock.paymentMethods[existingIndex] = {
          ...mock.paymentMethods[existingIndex],
          ...method,
        };
      } else {
        const newId = method.id || `pm_${Date.now()}`;
        mock.paymentMethods.push({
          id: newId,
          code: method.code || newId,
          name: method.name,
          name_ar: method.name_ar || method.name,
          type: method.type || 'gateway',
          icon: method.icon || 'fa-credit-card',
          logo: method.logo || '/online card.jpg',
          is_active: method.is_active !== undefined ? method.is_active : true,
          account_number: method.account_number || '',
          iban: method.iban || '',
          instructions: method.instructions || '',
          instructions_ar: method.instructions_ar || '',
          fee_type: method.fee_type || 'none',
          fee_amount: method.fee_amount || 0,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Payment method updated successfully',
        data: mock.paymentMethods,
      });
    }

    // 2. Toggle Status of a payment method
    if (body.action === 'toggle_status') {
      const { id, is_active } = body;
      const target = mock.paymentMethods.find((m) => m.id === id);
      if (target) {
        target.is_active = is_active;
        return NextResponse.json({ success: true, data: mock.paymentMethods });
      }
      return NextResponse.json({ success: false, message: 'Method not found' }, { status: 404 });
    }

    // 3. Delete a custom payment method
    if (body.action === 'delete_method') {
      const { id } = body;
      mock.paymentMethods = mock.paymentMethods.filter((m) => m.id !== id);
      return NextResponse.json({ success: true, data: mock.paymentMethods });
    }

    // 4. Update order payment status (verified / pending / rejected)
    if (body.orderId && body.paymentStatus) {
      return NextResponse.json({
        success: true,
        message: `Order #${body.orderId} payment status updated to ${body.paymentStatus}`,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
