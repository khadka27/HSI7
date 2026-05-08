import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    
    const categories = await prisma.category.findMany({
      where: type ? { type: type.toUpperCase() as any } : undefined,
      include: {
        subcategories: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const categoryData = {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      type: body.type.toUpperCase(),
      description: body.description || '',
      image: body.image || '',
    };
    
    const created = await prisma.category.create({
      data: categoryData,
    });
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
