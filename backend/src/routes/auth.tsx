import { Hono } from 'hono'
import { getPrisma } from '../db';
import bcrypt from 'bcryptjs'
import { sign, verify } from 'hono/jwt'

const auth = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>()

auth.post('/signup', async (c) => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const { email, password, name } = await c.req.json();

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return c.json({ error: 'Email already exists' }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });
  const token = await sign({ id: user.id, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, c.env.JWT_SECRET)

    return c.json({ message: 'User registered', token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Signup error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

auth.post('/login', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const { email, password } = await c.req.json();
  const user = await prisma.user.findUnique({ where: { email } })
  
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = await sign({ id: user.id, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, c.env.JWT_SECRET)

  return c.json({
    message: 'Login successful',
    token,  // Send the token as part of the response
    user: { id: user.id, email: user.email, name: user.name }
  })
})

auth.get('/logout', (c) => {
  return c.json({ message: 'Logged out successfully' })  // Handle client-side logout
})

auth.get('/me', async (c) => {
  // Get the token from the 'Authorization' header
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ user: null }, 401)
  }

  const token = authHeader.replace('Bearer ', '');  // Extract the token from "Bearer <token>"

  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const decoded = await verify(token, c.env.JWT_SECRET) as { id: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        address: true
      }
    })

    return c.json({ user })
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

auth.put('/user/address', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { id } = await verify(token, c.env.JWT_SECRET) as { id: string };
    const address = await c.req.json();

    const prisma = getPrisma(c.env.DATABASE_URL);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { address }
    });

    return c.json({ message: 'Address updated', user: updatedUser });
  } catch (err) {
    return c.json({ error: 'Invalid token or failed to update' }, 400);
  }
});


export default auth;
