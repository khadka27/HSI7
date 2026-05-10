import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const subcategoryId = searchParams.get('subcategoryId');
    const slug = searchParams.get('slug');

    // Single product by slug
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          subcategory: {
            include: { category: true },
          },
        },
      });
      if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(product);
    }
    
    let products;
    if (subcategoryId) {
      products = await prisma.product.findMany({
        where: { subcategoryId },
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (type) {
      products = await prisma.product.findMany({
        where: { categoryType: type.toUpperCase() as any },
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      products = await prisma.product.findMany({
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Products GET error:', error);
    // Return empty array during build time or when database is not available
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productData = {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      price: parseFloat(body.price),
      categoryType: body.categoryType.toUpperCase(),
      subcategoryId: body.subcategoryId,
      shortDescription: body.shortDescription || '',
      detailedDescription: body.detailedDescription || '',
      keyFeatures: body.keyFeatures || '',
      metaTitle: body.metaTitle || body.name,
      metaDescription: body.metaDescription || body.shortDescription || '',
      image: body.image || '',
      featuredImage: body.featuredImage || '',
      readMoreLink: body.readMoreLink || '',
    };
    
    const created = await prisma.product.create({
      data: productData,
    });
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
