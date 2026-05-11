import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Ingredients GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ingredientData = {
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      description: body.description || '',
      image: body.image || '',
      imageAlt: body.imageAlt || '',
    };
    
    const created = await prisma.ingredient.create({
      data: ingredientData,
    });
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Ingredients POST error:', error);
    return NextResponse.json({ error: 'Failed to create ingredient' }, { status: 500 });
  }
}
