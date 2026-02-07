import { NextRequest, NextResponse } from 'next/server';
import { sendOrderCancelledEmail } from '@/lib/email';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, email, reason, customerName, items, totalAmount } = body;

        if (!orderId) {
            return new NextResponse(
                JSON.stringify({ error: 'Order ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!email || !email.trim()) {
            return new NextResponse(
                JSON.stringify({ error: 'Email is required for verification' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Forward the request to the admin API to update order status to CANCELLED
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: 'CANCELLED',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new NextResponse(
                JSON.stringify({ error: errorText || 'Failed to cancel order' }),
                { status: response.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();

        // Send cancellation email
        await sendOrderCancelledEmail({
            orderId,
            name: customerName || data.name || 'Customer',
            email,
            reason,
            items: items?.map((item: any) => ({
                name: item.name || item.product?.name || 'Product',
                price: Number(item.price || item.product?.price || 0),
                quantity: item.quantity || 1
            })),
            totalAmount: totalAmount || undefined
        });

        return NextResponse.json({
            success: true,
            message: 'Order cancelled successfully',
            order: data
        });
    } catch (error) {
        console.error('[CANCEL_ORDER_ERROR]', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to cancel order' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
