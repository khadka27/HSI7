import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data';

export async function GET() {
  try {
    const settings = db.heroSettings.get();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch hero settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = db.heroSettings.update(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update hero settings' }, { status: 500 });
  }
}