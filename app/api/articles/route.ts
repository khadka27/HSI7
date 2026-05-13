import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const slug = searchParams.get('slug');

    if (slug) {
      const article = await (prisma.article as any).findUnique({
        where: { slug },
        include: { author: true },
      });
      if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(article);
    }

    const articles = await (prisma.article as any).findMany({
      where: status ? { status: status.toUpperCase() } : undefined,
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Articles GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = body.slug || body.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const article = await (prisma.article as any).create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt || null,
        content: body.content || '',
        featuredImage: body.featuredImage || null,
        featuredImageAlt: body.featuredImageAlt || null,
        metaTitle: body.metaTitle || body.title,
        metaDescription: body.metaDescription || body.excerpt || null,
        metaKeywords: body.metaKeywords || null,
        status: body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        publishedAt: body.status === 'PUBLISHED' ? new Date() : null,
        authorId: body.authorId || null,
      },
    });
    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Articles POST error:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
