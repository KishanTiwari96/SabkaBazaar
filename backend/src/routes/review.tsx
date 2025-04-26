import { Hono } from 'hono'
import { getPrisma } from '../db';
import { sign, verify } from 'hono/jwt'

const reviews = new Hono<{
  Bindings: {  // specifying the type of env variable
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>()

const verifyUser = async (c: any) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  // Get the token from the Authorization header (frontend will send it)
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  try {
    const decoded = await verify(token, c.env.JWT_SECRET) as { id: string }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    return user
  } catch {
    return null
  }
}

reviews.get('/reviews/:productId', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const productId = c.req.param('productId')

  const productReviews = await prisma.review.findMany({
    where: { productId },
    include: { user: true }
  })

  return c.json({ reviews: productReviews })
})

reviews.post('/reviews/:productId', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const productId = c.req.param('productId')
  const { rating, comment } = await c.req.json()

  const review = await prisma.review.create({
    data: {
      userId: user.id,
      productId,
      rating,
      comment
    }
  })

  return c.json({ message: 'Review added', review })
})

reviews.put('/reviews/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = c.req.param('id')
  const { rating, comment } = await c.req.json()

  const review = await prisma.review.findUnique({ where: { id } })
  if (!review || review.userId !== user.id) {
    return c.json({ error: 'Unauthorized or not found' }, 401)
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { rating, comment }
  })

  return c.json({ message: 'Review updated', review: updated })
})

reviews.delete('/reviews/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = c.req.param('id')
  const review = await prisma.review.findUnique({ where: { id } })

  if (!review || review.userId !== user.id) {
    return c.json({ error: 'Unauthorized or not found' }, 401)
  }

  await prisma.review.delete({ where: { id } })
  return c.json({ message: 'Review deleted' })
})

// Add a route that's compatible with the frontend's existing calls
reviews.post('/products/:productId/reviews', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const productId = c.req.param('productId')
  const { rating, comment } = await c.req.json()

  const review = await prisma.review.create({
    data: {
      userId: user.id,
      productId,
      rating,
      comment
    }
  })

  return c.json({ message: 'Review added', review })
})

// Add a route for deleting reviews via product
reviews.delete('/products/:productId/reviews/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const id = c.req.param('id')
  const review = await prisma.review.findUnique({ where: { id } })

  if (!review || review.userId !== user.id) {
    return c.json({ error: 'Unauthorized or not found' }, 401)
  }

  await prisma.review.delete({ where: { id } })
  return c.json({ message: 'Review deleted' })
})

export default reviews
