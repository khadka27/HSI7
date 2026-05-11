import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(authors);
  } catch (error) {
    console.error('Authors GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const author = await prisma.author.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
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
    return NextResponse.json(author, { status: 201 });
  } catch (error) {
    console.error('Authors POST error:', error);
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 });
  }
}
