import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const subcategoryId = searchParams.get('subcategoryId');
    
    let products;
    if (subcategoryId) {
      products = await db.products.getBySubcategory(subcategoryId);
    } else if (type) {
      products = await db.products.getByType(type);
    } else {
      products = await db.products.getAll();
    }
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Products GET error:', error);
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
      categoryType: body.categoryType,
      subcategoryId: body.subcategoryId,
      shortDescription: body.shortDescription || '',
      detailedDescription: body.detailedDescription || '',
      metaTitle: body.metaTitle || body.name,
      metaDescription: body.metaDescription || body.shortDescription || '',
      image: body.image || '',
      featuredImage: body.featuredImage || '',
      readMoreLink: body.readMoreLink || '',
    };
    const created = await db.products.create(productData);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
