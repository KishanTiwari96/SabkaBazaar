import { Hono } from 'hono';
import { getPrisma } from '../db';
import { verify } from 'hono/jwt';

const orders = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

const verifyUser = async (c: any) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    c.status(401);
    return c.json({ error: 'Authorization header missing' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    c.status(401);
    return c.json({ error: 'Token missing' });
  }

  try {
    const decoded = await verify(token, c.env.JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      c.status(401);
      return c.json({ error: 'User not found' });
    }
    return user;
  } catch (err) {
    c.status(401);
    return c.json({ error: 'Invalid token' });
  }
};

orders.post('/orders', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user) return c.res;

  try {
    const { items, total } = await c.req.json();
    if (!items || items.length === 0) {
      return c.json({ error: 'Cart is empty' }, 400);
    }

    const orderItems = await Promise.all(
      items.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { price: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        status: 'PENDING', // Ensure default status
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    return c.json({ message: 'Order placed', order });
  } catch (err) {
    console.error('Error creating order:', err);
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    return c.json({ error: `Failed to create order: ${errorMessage}` }, 500);
  }
});

orders.get('/orders', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user) return c.res;

  try {
    const userOrders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    // Format response to match frontend
    const formattedOrders = userOrders.map(order => ({
      id: order.id,
      status: order.status || 'PENDING',
      total: order.total || 0,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          name: item.product?.name || 'Unknown Product',
          imageUrl: item.product?.imageUrl || '',
        },
      })),
    }));

    return c.json({ orders: formattedOrders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

orders.get('/orders/all', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user || !user.isAdmin) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const allOrders = await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    const formattedOrders = allOrders.map(order => ({
      id: order.id,
      status: order.status || 'PENDING',
      total: order.total || 0,
      user: {
        id: order.user.id,
        name: order.user.name,
      },
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          name: item.product?.name || 'Unknown Product',
          imageUrl: item.product?.imageUrl || '',
        },
      })),
    }));

    return c.json({ orders: formattedOrders });
  } catch (err) {
    console.error('Error fetching all orders:', err);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

orders.get('/orders/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        user: true,
      },
    });

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.userId !== user.id && !user.isAdmin) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formattedOrder = {
      id: order.id,
      status: order.status || 'PENDING',
      total: order.total || 0,
      items: order.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          name: item.product?.name || 'Unknown Product',
          imageUrl: item.product?.imageUrl || '',
        },
      })),
    };

    return c.json({ order: formattedOrder });
  } catch (err) {
    console.error('Error fetching order:', err);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

orders.put('/orders/:id/status', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user || !user.isAdmin) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();

    if (!['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return c.json({ message: 'Order status updated', order: updated });
  } catch (err) {
    console.error('Error updating order status:', err);
    return c.json({ error: 'Failed to update status' }, 500);
  }
});

orders.post('/orders/:orderId/cancel', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user) return c.res;

  try {
    const orderId = c.req.param('orderId');
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.userId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    if (order.status !== 'PENDING') {
      return c.json({ error: 'Only pending orders can be cancelled' }, 400);
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    return c.json({ message: 'Order cancelled', order: updated });
  } catch (err) {
    console.error('Error cancelling order:', err);
    return c.json({ error: 'Failed to cancel order' }, 500);
  }
});

export default orders;