import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: true,
        products: true,
      },
    });
    
    if (!subcategory) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(subcategory);
  } catch (error) {
    console.error('Subcategory GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch subcategory' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updated = await prisma.subcategory.update({
      where: { id },
      data: {
        name: body.name,
        categoryType: body.categoryType?.toUpperCase(),
        description: body.description,
        image: body.image,
        categoryId: body.categoryId,
      },
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Subcategory PUT error:', error);
    return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.subcategory.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subcategory DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 });
  }
}
