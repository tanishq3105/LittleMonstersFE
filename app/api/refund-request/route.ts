import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId, reason, email } = body;

        if (!orderId) {
            return new NextResponse(
                JSON.stringify({ error: 'Order ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!reason || !reason.trim()) {
            return new NextResponse(
                JSON.stringify({ error: 'Reason is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!email || !email.trim()) {
            return new NextResponse(
                JSON.stringify({ error: 'Email is required for verification' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Forward the request to the admin API
        const response = await fetch(`${API_URL}/refunds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderId,
                reason,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new NextResponse(
                JSON.stringify({ error: errorText || 'Failed to submit refund request' }),
                { status: response.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[REFUND_REQUEST_ERROR]', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to submit refund request' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const orderId = req.nextUrl.searchParams.get('orderId');

        if (!orderId) {
            return new NextResponse(
                JSON.stringify({ error: 'Order ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Forward the request to the admin API
        const response = await fetch(`${API_URL}/refunds?orderId=${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new NextResponse(
                JSON.stringify({ error: errorText || 'Failed to fetch refund status' }),
                { status: response.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[REFUND_STATUS_ERROR]', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to fetch refund status' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
