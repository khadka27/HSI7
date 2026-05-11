import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
        author: true,
        ingredients: true,
      },
    });
    
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        price: parseFloat(body.price),
        categoryType: body.categoryType?.toUpperCase(),
        subcategory: { connect: { id: body.subcategoryId } },
        author: body.authorId ? { connect: { id: body.authorId } } : { disconnect: true },
        shortDescription: body.shortDescription,
        detailedDescription: body.detailedDescription,
        keyFeatures: body.keyFeatures || '',
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        image: body.image,
        featuredImage: body.featuredImage,
        readMoreLink: body.readMoreLink,
        buyNowLink: body.buyNowLink || '',
        ingredients: {
          set: body.ingredientIds?.map((id: string) => ({ id })) || []
        }
      } as any,
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Product PUT error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.product.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
