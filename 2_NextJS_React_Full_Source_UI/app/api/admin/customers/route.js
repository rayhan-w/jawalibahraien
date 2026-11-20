import { NextResponse } from 'next/server';

const mockCustomers = [
  { id: 1, name: 'Ahmed Al-Khalifa', phone: '+973 3988 1234', orders_count: 5, total_spent: 890.500, city: 'Manama', country: 'Bahrain' },
  { id: 2, name: 'Salman Rashid', phone: '+973 3456 7890', orders_count: 2, total_spent: 45.000, city: 'Muharraq', country: 'Bahrain' },
  { id: 3, name: 'Rashid Khan', phone: '01339893391', orders_count: 3, total_spent: 12500, city: 'Ramganj', country: 'Bangladesh' },
  { id: 4, name: 'Maryam Ebrahim', phone: '+973 3912 3344', orders_count: 4, total_spent: 610.000, city: 'Riffa', country: 'Bahrain' },
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    if (phone) {
      const match = mockCustomers.find((c) => c.phone.includes(phone.trim()));
      return NextResponse.json({ success: true, data: match ? [match] : [] });
    }
    return NextResponse.json({ success: true, data: mockCustomers });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
