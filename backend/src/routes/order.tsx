import { Hono } from 'hono'
import { getPrisma } from '../db';
import { sign, verify } from 'hono/jwt'

const orders = new Hono<{
  Bindings: {  // specifying the type of env variable
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>()

const verifyUser = async (c: any) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const authHeader = c.req.headers.get('Authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')  // Extract the token from "Bearer <token>"
  
  try {
    const decoded = await verify(token, c.env.JWT_SECRET) as { id: string }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    return user
  } catch {
    return null
  }
}

orders.post('/orders', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const { items, total } = await c.req.json()
  if (!items || items.length === 0) return c.json({ error: 'Cart is empty' }, 400)

  const orderItems = await Promise.all(
    items.map(async (item: any) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { price: true }
      });

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      };
    })
  );

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total,
      items: {
        create: orderItems
      }
    },
    include: {
      items: true
    }
  });

  return c.json({ message: 'Order placed', order })
})

orders.get('/orders', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const userOrders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  })

  return c.json({ orders: userOrders })
})

orders.get('/orders/all', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user || !user.isAdmin) return c.json({ error: 'Unauthorized' }, 401)

  const allOrders = await prisma.order.findMany({
    include: {
      user: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })

  return c.json({ orders: allOrders })
})

orders.get('/orders/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = c.req.param('id')
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      user: true
    }
  })

  if (!order) return c.json({ error: 'Order not found' }, 404)

  if (order.userId !== user.id && !user.isAdmin) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  return c.json({ order })
})

orders.put('/orders/:id/status', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user || !user.isAdmin) return c.json({ error: 'Unauthorized' }, 401)

  const id = c.req.param('id')
  const { status } = await c.req.json()

  const updated = await prisma.order.update({
    where: { id },
    data: { status }
  })

  return c.json({ message: 'Order status updated', order: updated })
})

orders.post("/orders/:orderId/cancel", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const orderId = c.req.param("orderId");
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
  return c.json({ message: "Order cancelled", order: updated });
});


export default orders
