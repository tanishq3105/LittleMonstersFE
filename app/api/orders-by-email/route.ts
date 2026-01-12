import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');

    if (!email || !email.trim()) {
      return new NextResponse(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch orders by email
    const orders = await prismadb.order.findMany({
      where: {
        email: email.toLowerCase().trim(),
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate totals
    const ordersCount = orders.length;
    let productsCount = 0;

    orders.forEach((order) => {
      productsCount += order.orderItems.length;
    });

    return NextResponse.json({
      ordersCount,
      productsCount,
      email,
      orders,
      products: [],
    });
  } catch (error) {
    console.error('[ORDERS_BY_EMAIL_ERROR]', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch orders' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
