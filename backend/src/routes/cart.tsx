import { Hono } from 'hono';
import { getPrisma } from '../db';
import { sign, verify } from 'hono/jwt';

const cart = new Hono<{
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

cart.get('/cart', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user) return c.res; // Response already set in verifyUser

  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });
    return c.json({ cart: items });
  } catch (err) {
    console.error('Error fetching cart:', err);
    return c.json({ error: 'Failed to fetch cart' }, 500);
  }
});

cart.post('/cart', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user) return c.res;

  try {
    const { productId, quantity } = await c.req.json();
    
    // Validate input
    if (!productId || typeof productId !== 'string') {
      return c.json({ error: 'Invalid productId' }, 400);
    }
    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
      return c.json({ error: 'Invalid quantity' }, 400);
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Check stock
    if (product.stock < quantity) {
      return c.json({ error: 'Insufficient stock' }, 400);
    }

    const existing = await prisma.cartItem.findFirst({
      where: { userId: user.id, productId },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
      return c.json({ message: 'Cart item updated', item: updated });
    }

    const item = await prisma.cartItem.create({
      data: { userId: user.id, productId, quantity },
    });

    return c.json({ message: 'Item added to cart', item });
  } catch (err) {
    console.error('Error adding to cart:', err);
    return c.json({ error: 'Failed to add to cart' }, 500);
  }
});

cart.put('/cart/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user) return c.res;

  try {
    const id = c.req.param('id');
    const { quantity } = await c.req.json();

    if (typeof quantity !== 'number' || quantity < 1) {
      return c.json({ error: 'Invalid quantity' }, 400);
    }

    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== user.id) {
      return c.json({ error: 'Cart item not found' }, 404);
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return c.json({ message: 'Quantity updated', item: updated });
  } catch (err) {
    console.error('Error updating cart:', err);
    return c.json({ error: 'Failed to update quantity' }, 500);
  }
});

cart.delete('/cart/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user) return c.res;

  try {
    const id = c.req.param('id');
    const item = await prisma.cartItem.findUnique({ where: { id } });
    if (!item || item.userId !== user.id) {
      return c.json({ error: 'Cart item not found' }, 404);
    }

    await prisma.cartItem.delete({ where: { id } });
    return c.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Error removing from cart:', err);
    return c.json({ error: 'Failed to remove item' }, 500);
  }
});

cart.delete('/cart', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user) return c.res;

  try {
    await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    return c.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    return c.json({ error: 'Failed to clear cart' }, 500);
  }
});

export default cart;