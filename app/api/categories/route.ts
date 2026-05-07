import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data';
import type { Category } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const categories = db.categories.getAll();
    const filtered = type ? categories.filter(c => c.type === type) : categories;
    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category: Category = {
      id: `cat-${Date.now()}`,
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      type: body.type,
      description: body.description || '',
      image: body.image || '',
      createdAt: new Date().toISOString(),
    };
    const created = db.categories.create(category);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
