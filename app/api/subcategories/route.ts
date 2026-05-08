import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    const subcategories = await prisma.subcategory.findMany({
      where: type ? { categoryType: type.toUpperCase() as any } : undefined,
      include: {
        category: true,
        products: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(subcategories);
  } catch (error) {
    console.error('Subcategories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subcategoryData = {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      categoryType: body.categoryType.toUpperCase(),
      description: body.description || '',
      image: body.image || '',
      categoryId: body.categoryId || null,
    };
    
    const created = await prisma.subcategory.create({
      data: subcategoryData,
    });
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Subcategories POST error:', error);
    return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 });
  }
}
