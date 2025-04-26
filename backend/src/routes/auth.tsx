import { Hono } from 'hono'
import { getPrisma } from '../db';
import bcrypt from 'bcryptjs'
import { sign, verify } from 'hono/jwt'

const auth = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,
    FIREBASE_PROJECT_ID: string,
    FIREBASE_PRIVATE_KEY: string,
    FIREBASE_CLIENT_EMAIL: string
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
        address: true,
        profilePicture: true,
        emailVerified: true
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

// Add endpoint for updating user profile information
auth.put('/user/profile', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { id } = await verify(token, c.env.JWT_SECRET) as { id: string };
    const { name } = await c.req.json();
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return c.json({ error: 'Name is required' }, 400);
    }

    const prisma = getPrisma(c.env.DATABASE_URL);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name: name.trim() }
    });

    return c.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return c.json({ error: 'Failed to update profile' }, 400);
  }
});

// Add endpoint for setting or changing password
auth.put('/user/set-password', async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { id } = await verify(token, c.env.JWT_SECRET) as { id: string };
    const { password } = await c.req.json();
    
    if (!password || typeof password !== 'string' || password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const prisma = getPrisma(c.env.DATABASE_URL);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    return c.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    return c.json({ error: 'Failed to update password' }, 400);
  }
});

// Simplified Google/Firebase login without using Firebase Admin SDK
auth.post('/firebase-login', async (c) => {
  try {
    const prisma = getPrisma(c.env.DATABASE_URL);
    console.log("Database connected successfully");
    
    const { googleUser } = await c.req.json();
    
    if (!googleUser || !googleUser.email) {
      return c.json({ error: 'Invalid Google user data provided' }, 400);
    }
    
    console.log('Received Google user data:', {
      email: googleUser.email,
      name: googleUser.displayName,
      hasPhoto: !!googleUser.photoURL
    });
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email }
    });
    
    if (!user) {
      // Create new user with Google info
      console.log('Creating new user with Google data');
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.displayName || googleUser.email.split('@')[0],
          password: await bcrypt.hash(googleUser.uid + Date.now(), 10), // Generate secure password
          profilePicture: googleUser.photoURL || null,
          emailVerified: googleUser.emailVerified || false
        }
      });
    } else {
      // Update existing user with Google info
      console.log('Updating existing user with Google data');
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          profilePicture: googleUser.photoURL || user.profilePicture,
          emailVerified: googleUser.emailVerified || user.emailVerified
        }
      });
    }
    
    // Generate JWT token
    const token = await sign({
      id: user.id,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
    }, c.env.JWT_SECRET);
    
    return c.json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture
      }
    });
  } catch (err: any) {
    console.error('Google login error:', err);
    return c.json({
      error: 'Authentication failed',
      message: err.message
    }, 401);
  }
});

export default auth;
