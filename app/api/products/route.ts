import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
// Diagnostic: Force rebuild v3 after successful pnpm prisma generate



export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const subcategoryId = searchParams.get('subcategoryId');
    const slug = searchParams.get('slug');

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Single product by slug
    if (slug) {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          subcategory: {
            include: { category: true },
          },
          author: true,
        },
      });
      if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(product);
    }
    
    // Construct where clause
    const where: any = {};
    if (subcategoryId) {
      where.subcategoryId = subcategoryId;
    } else if (type) {
      where.categoryType = type.toUpperCase();
    }

    // Fetch products and total count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          subcategory: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    
    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
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
      authorId: body.authorId || null,
      shortDescription: body.shortDescription || '',
      detailedDescription: body.detailedDescription || '',
      keyFeatures: body.keyFeatures || '',
      metaTitle: body.metaTitle || body.name,
      metaDescription: body.metaDescription || body.shortDescription || '',
      image: body.image || '',
      featuredImage: body.featuredImage || '',
      readMoreLink: body.readMoreLink || '',
      buyNowLink: body.buyNowLink || '',
    };
    
    const created = await prisma.product.create({
      data: {
        ...productData,
        ingredients: body.ingredientIds?.length ? {
          connect: body.ingredientIds.map((id: string) => ({ id }))
        } : undefined
      },
    });
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
