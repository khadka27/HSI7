import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data';
import type { Subcategory } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const subcategories = type ? db.subcategories.getByType(type) : db.subcategories.getAll();
    return NextResponse.json(subcategories);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subcategory: Subcategory = {
      id: `sub-${Date.now()}`,
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      categoryType: body.categoryType,
      description: body.description || '',
      image: body.image || '',
      createdAt: new Date().toISOString(),
    };
    const created = db.subcategories.create(subcategory);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 });
  }
}
