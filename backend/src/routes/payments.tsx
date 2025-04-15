import { Hono } from 'hono';
import { getPrisma } from '../db';

const paymentRoute = new Hono();

paymentRoute.get('/razorpay-key', (c) => {
  const env = c.env as { RAZORPAY_KEY_ID: string };
  return c.json({
    key: env.RAZORPAY_KEY_ID,
  });
});

paymentRoute.post('/create-razorpay-order', async (c) => {
  const { amount } = await c.req.json();

  const env = c.env as { RAZORPAY_KEY_ID: string; RAZORPAY_KEY_SECRET: string };
  const key_id = env.RAZORPAY_KEY_ID;
  const key_secret = env.RAZORPAY_KEY_SECRET;

  const authHeader = 'Basic ' + btoa(`${key_id}:${key_secret}`);

  try {
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        amount: amount * 100, // paise
        currency: 'INR',
        receipt: `receipt_${Math.random().toString(36).substring(2)}`,
      }),
    });

    const data: { id: string; amount: number } = await res.json();

    if (!res.ok) {
      console.error(data);
      return c.json({ error: 'Failed to create order', details: data }, 500);
    }

    return c.json({ orderId: data.id, amount: data.amount });
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Order creation failed', message: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});

paymentRoute.post('/razorpay/verify', async (c) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, items, total } = await c.req.json();

  const env = c.env as { RAZORPAY_KEY_SECRET: string; DATABASE_URL: string };
  const secret = env.RAZORPAY_KEY_SECRET;

  // Step 1: Generate the Razorpay signature using Web Crypto API
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(`${razorpayOrderId}|${razorpayPaymentId}`);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
  const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');

  // Step 2: Validate the signature
  if (generatedSignature !== razorpaySignature) {
    return c.json({ success: false, message: 'Invalid signature' }, 400);
  }

  // Step 3: Create the Order in your database
  try {
    const prisma = getPrisma(env.DATABASE_URL);
    // Create the order in the database
    const order = await prisma.order.create({
      data: {
        total: total,
        status: 'PROCESSING',
        paymentId: razorpayPaymentId, 
        user: {
          connect: { id: items[0].userId },
        },
        items: {
          create: items.map((item: any) => ({
            product: {
              connect: { id: item.productId },
            },
            quantity: item.quantity,
            price: item.productPrice,
          })),
        },
      },
    });
    

    // Return success
    return c.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Error creating order in DB:', error);
    return c.json({ success: false, message: 'Failed to create order in DB' }, 500);
  }
});

export default paymentRoute;
