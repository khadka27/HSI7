import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data';
import type { Product } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const subcategoryId = searchParams.get('subcategoryId');
    let products = db.products.getAll();
    if (type) products = products.filter(p => p.categoryType === type);
    if (subcategoryId) products = products.filter(p => p.subcategoryId === subcategoryId);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product: Product = {
      id: `prod-${Date.now()}`,
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
      createdAt: new Date().toISOString(),
    };
    const created = db.products.create(product);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
