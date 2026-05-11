import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const author = await prisma.author.findUnique({ where: { id } });
    if (!author) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(author);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch author' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const author = await prisma.author.update({
      where: { id },
      data: {
        name: body.name,
        title: body.title || null,
        bio: body.bio || null,
        expertise: body.expertise || null,
        avatar: body.avatar || null,
        avatarAlt: body.avatarAlt || null,
        website: body.website || null,
        twitter: body.twitter || null,
        linkedin: body.linkedin || null,
        reviewCount: body.reviewCount ? parseInt(body.reviewCount) : null,
        rating: body.rating ? parseFloat(body.rating) : null,
      },
    });
    return NextResponse.json(author);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.author.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 });
  }
}
