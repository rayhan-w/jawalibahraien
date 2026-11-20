import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      total_sales: 14850.500,
      currency: 'BHD',
      total_orders: 142,
      pending_orders: 6,
      in_transit_orders: 12,
      delivered_orders: 124,
      total_products: 48,
      stock_out_count: 2,
      total_customers: 310,
    }
  });
}
