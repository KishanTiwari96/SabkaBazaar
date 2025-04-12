import { Hono } from 'hono'
import { getPrisma } from '../db';
import bcrypt from 'bcryptjs'
import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'


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

    return c.json({ message: 'User registered', user: { id: user.id, email: user.email, name: user.name } });
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
  setCookie(c, 'token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
    sameSite: 'Lax',
    secure: false,
    domain: 'localhost'
  })
  return c.json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name } })
})

auth.get('/logout', (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  deleteCookie(c, 'token')
  return c.json({ message: 'Logged out successfully' })
})

auth.get('/me', async (c) => {
  const token = getCookie(c, 'token')
  if (!token) {
    return c.json({ user: null }, 401)
  }

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
        createdAt: true
      }
    })

    return c.json({ user })
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

export default auth