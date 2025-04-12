import { Hono } from 'hono'
import { getPrisma } from '../db';
import { getCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'

const cart = new Hono<{
  Bindings: {  // specifying the type of env variable
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>()

const verifyUser = async (c: any) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const token = getCookie(c, 'token')
  if (!token) return null
  try {
    const decoded = await verify(token, c.env.JWT_SECRET) as { id: string }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    return user
  } catch {
    return null
  }
}

cart.get('/cart', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true }
  })

  return c.json({ cart: items })
})

cart.post('/cart', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const { productId, quantity } = await c.req.json()

  const existing = await prisma.cartItem.findFirst({
    where: { userId: user.id, productId }
  })

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity }
    })
    return c.json({ message: 'Cart item updated', item: updated })
  }

  const item = await prisma.cartItem.create({
    data: { userId: user.id, productId, quantity }
  })

  return c.json({ message: 'Item added to cart', item })
})

cart.put('/cart/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = c.req.param('id')
  const { quantity } = await c.req.json()

  const item = await prisma.cartItem.update({
    where: { id },
    data: { quantity }
  })

  return c.json({ message: 'Quantity updated', item })
})

cart.delete('/cart/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = c.req.param('id')

  await prisma.cartItem.delete({ where: { id } })

  return c.json({ message: 'Item removed from cart' })
})

cart.delete('/cart', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  await prisma.cartItem.deleteMany({ where: { userId: user.id } })

  return c.json({ message: 'Cart cleared' })
})

export default cart