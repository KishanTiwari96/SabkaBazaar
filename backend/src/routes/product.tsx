import { Hono } from 'hono'
import { getPrisma } from '../db';
import { sign, verify } from 'hono/jwt'
import { Prisma } from '@prisma/client'

const products = new Hono<{
    Bindings : {
      DATABASE_URL : string,
      JWT_SECRET : string
    }
}>()

// Function to verify user by token in the Authorization header
const verifyUser = async (c: any) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const authHeader = c.req.header('Authorization'); // ✅ safer than headers.get()
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const decoded = await verify(token, c.env.JWT_SECRET) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    return user;
  } catch (err) {
    console.error('JWT verification failed:', err);
    return null;
  }
};



// Route to get all products with filtering
products.get('/products', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const brandName = c.req.query('brand');
  const category = c.req.query('category');
  const sort = c.req.query('sort');
  const minPrice = c.req.query('minPrice');
  const maxPrice = c.req.query('maxPrice');
  const minRating = c.req.query('minRating');
  const inStock = c.req.query('inStock');
  let search = c.req.query('search');
  console.log("Search Query:", search);

  let whereClause: any = {};

  if (brandName) {
    whereClause.brand = {
      name: {
        equals: brandName,
        mode: 'insensitive',
      },
    };
  }

  if (category && category.toLowerCase() !== 'all') {
    whereClause.category = {
      equals: category,
      mode: 'insensitive',
    };
  }

  if (search) {
    const baseSearch = search
      .toLowerCase()
      .replace(/(es|s)$/, ""); 

    whereClause.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        name: {
          contains: baseSearch,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Add price range filter
  if (minPrice || maxPrice) {
    whereClause.price = {};
    if (minPrice) {
      whereClause.price.gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      whereClause.price.lte = parseFloat(maxPrice);
    }
  }

  // Add stock filter
  if (inStock === 'true') {
    whereClause.stock = {
      gt: 0
    };
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      brand: true,
      Review: true,
    },
    orderBy: sort === 'asc' || sort === 'desc' ? { price: sort } : undefined,
  });

  const productsWithRating = products.map((product) => {
    const totalRating = product.Review.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = product.Review.length ? totalRating / product.Review.length : 0;

    const { Review, ...rest } = product;
    return {
      ...rest,
      avgRating: parseFloat(avgRating.toFixed(1)),
    };
  });

  // Filter by rating after calculating average ratings
  if (minRating) {
    const minRatingValue = parseFloat(minRating);
    return c.json(productsWithRating.filter(product => product.avgRating >= minRatingValue));
  }

  return c.json(productsWithRating);
});


// Route to get all brands with filtering
products.get('/brands', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const category = c.req.query('category');
  const search = c.req.query('search');

  const productFilters: any = {};

  if (category && category !== 'all') {
    productFilters.category = {
      equals: category,
      mode: 'insensitive'
    };
  }

  if (search) {
    productFilters.name = {
      contains: search,
      mode: 'insensitive'
    };
  }

  const brands = await prisma.brand.findMany({
    where: {
      products: {
        some: productFilters
      }
    },
    select: {
      name: true
    },
    distinct: ['name']
  });

  return c.json(brands);
});

// Route to get best-selling products
products.get('/products/best-sellers', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const products = await prisma.product.findMany({
    orderBy: {
      orderItems: {
        _count: 'desc',
      },
    },
    include: {
      brand: true,
      _count: {
        select: { orderItems: true },
      },
      Review: true,
    },
    take: 8,
  });

  const enrichedProducts = products.map((p) => {
    const totalRating = p.Review.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = p.Review.length
      ? parseFloat((totalRating / p.Review.length).toFixed(1))
      : 0;

    const { Review, ...rest } = p;
    return {
      ...rest,
      avgRating,
    };
  });

  return c.json({ products: enrichedProducts });
});

// Route to get details of a specific product by id
products.get('/products/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const id = c.req.param('id');

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      brand: true,
      Review: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
    },
  });

  if (!product) {
    return c.notFound();
  }

  const totalRating = product.Review.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = product.Review.length
    ? parseFloat((totalRating / product.Review.length).toFixed(1))
    : 0;

  // Transform reviews to match the expected format in the frontend
  const reviews = product.Review.map(r => ({
    _id: r.id,
    user: r.user.id,
    name: r.user.name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString()
  }));

  const { Review, ...rest } = product;

  return c.json({
    product: {
      ...rest,
      avgRating,
      reviews,
    },
  });
});

// Route to create a new product (only accessible by admin)
products.post('/products', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user || !user.isAdmin) return c.json({ error: "unauthorized" }, 401);

  const {
    name,
    description,
    price,
    stock,
    category,
    brandName,
    images
  } = await c.req.json();

  const imageUrl = images?.[0] || ""; 

  let brand = null;

  if (brandName) {
    brand = await prisma.brand.findUnique({
      where: { name: brandName },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: brandName },
      });
    }
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      imageUrl,
      category,
      brandId: brand?.id || null,
      images: {
        create: images?.map((url: string) => ({ url })) || [],
      },
    },
    include: {
      brand: true,
      images: true,
    },
  });

  return c.json({ message: "Product created", product });
});

// Route to update an existing product (only accessible by admin)
products.put('/products/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user || !user.isAdmin) return c.json({ error: "unauthorized" }, 401);

  const id = c.req.param('id');
  const { images, ...data } = await c.req.json();

  if (images && images.length > 0) {
    data.imageUrl = images[0]; 
  }

  await prisma.image.deleteMany({
    where: { productId: id }
  });

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      images: {
        create: images?.map((url: string) => ({ url })) || []
      }
    },
    include: {
      images: true,
      brand: true
    }
  });

  return c.json({ message: 'Product updated', product: updated });
});

// Route to get similar products
products.get('/products/:id/similar', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const id = c.req.param('id');

  const product = await prisma.product.findUnique({
    where: { id },
    select: { category: true },
  });

  if (!product) return c.json({ error: 'Product not found' }, 404);

  const similarProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      NOT: { id }, 
    },
    take: 4,
  });

  return c.json({ products: similarProducts });
});

// Route to delete a product (only accessible by admin)
products.delete('/products/:id', async (c) => {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const user = await verifyUser(c)
    if (!user || !user.isAdmin) return c.json({ error: 'Unauthorized' }, 401)
  
    const id = c.req.param('id')
  
    await prisma.product.delete({ where: { id } })
  
    return c.json({ message: 'Product deleted' })
})

export default products;
