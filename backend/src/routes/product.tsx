import { Hono } from 'hono'
import { getPrisma } from '../db';
import { sign,verify } from 'hono/jwt'
import { getCookie } from 'hono/cookie'
import { Prisma } from '@prisma/client'

const products = new Hono<{
    Bindings : {
      DATABASE_URL : string,
      JWT_SECRET : string
    }
}>()

const verifyUser = async (c:any) => {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const token = getCookie(c,'token')
    if(!token) return null
    try {
        const decoded = await verify(token, c.env.JWT_SECRET) as { id: string }
        const user = await prisma.user.findUnique({ where: { id: decoded.id } })
        return user
    } catch{
        return null
    }
}

products.get('/products', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const brandName = c.req.query('brand');
  const category = c.req.query('category');
  const sort = c.req.query('sort');
  const search = c.req.query('search');
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

  // ✅ Only add category filter if it's NOT 'all'
  if (category && category.toLowerCase() !== 'all') {
    whereClause.category = {
      equals: category,
      mode: 'insensitive',
    };
  }

  if (search) {
    whereClause.name = {
      contains: search,
      mode: 'insensitive',
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

  // Calculate avgRating and attach it to each product
  const productsWithRating = products.map((product) => {
    const totalRating = product.Review.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = product.Review.length ? totalRating / product.Review.length : 0;

    const { Review, ...rest } = product;
    return {
      ...rest,
      avgRating: parseFloat(avgRating.toFixed(1)),
    };
  });

  return c.json(productsWithRating);
});

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
    take: 8, // or however many best sellers you want
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



products.get('/products/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const id = c.req.param('id');

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      brand: true,
      Review: true,
    },
  });

  if (!product) {
    return c.notFound();
  }

  const totalRating = product.Review.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = product.Review.length
    ? parseFloat((totalRating / product.Review.length).toFixed(1))
    : 0;

  const { Review, ...rest } = product;

  return c.json({
    product: {
      ...rest,
      avgRating,
    },
  });
});


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

  const imageUrl = images?.[0] || ""; // use first image as main thumbnail

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


products.put('/products/:id', async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);
  const user = await verifyUser(c);
  if (!user || !user.isAdmin) return c.json({ error: "unauthorized" }, 401);

  const id = c.req.param('id');
  const { images, ...data } = await c.req.json();

  // If there are images, update imageUrl with the first one for primary display
  if (images && images.length > 0) {
    data.imageUrl = images[0]; // for thumbnail or default image
  }

  // Step 1: Delete existing images for this product
  await prisma.image.deleteMany({
    where: { productId: id }
  });

  // Step 2: Update product and insert new images
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
      NOT: { id }, // exclude the current product
    },
    take: 4,
  });

  return c.json({ products: similarProducts });
});


products.delete('/products/:id', async (c) => {
    const prisma = getPrisma(c.env.DATABASE_URL);
    const user = await verifyUser(c)
    if (!user || !user.isAdmin) return c.json({ error: 'Unauthorized' }, 401)
  
    const id = c.req.param('id')
  
    await prisma.product.delete({ where: { id } })
  
    return c.json({ message: 'Product deleted' })
  })
  
export default products