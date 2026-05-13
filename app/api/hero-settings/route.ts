import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

type ClientBackgroundType = 'gradient' | 'image';

function toPrismaBackgroundType(v: unknown): 'GRADIENT' | 'IMAGE' {
  const s = typeof v === 'string' ? v : '';
  return s.toUpperCase() === 'IMAGE' ? 'IMAGE' : 'GRADIENT';
}

function toClientBackgroundType(v: string): ClientBackgroundType {
  return v === 'IMAGE' ? 'image' : 'gradient';
}

function serializeHero<T extends { backgroundType: string }>(row: T) {
  return {
    ...row,
    backgroundType: toClientBackgroundType(row.backgroundType),
  };
}

/** Build Prisma update/create data from JSON body; drop immutable / unknown fields */
function bodyToHeroData(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  if (typeof body.title === 'string') data.title = body.title;
  if (body.subtitle === null || body.subtitle === undefined) data.subtitle = null;
  else if (typeof body.subtitle === 'string') data.subtitle = body.subtitle;

  if (typeof body.description === 'string') data.description = body.description;
  if (typeof body.backgroundImage === 'string') data.backgroundImage = body.backgroundImage;
  if (body.backgroundType !== undefined) data.backgroundType = toPrismaBackgroundType(body.backgroundType);

  if (typeof body.gradientFrom === 'string') data.gradientFrom = body.gradientFrom;
  if (typeof body.gradientVia === 'string') data.gradientVia = body.gradientVia;
  if (typeof body.gradientTo === 'string') data.gradientTo = body.gradientTo;
  if (typeof body.textColor === 'string') data.textColor = body.textColor;

  if (body.overlayOpacity !== undefined) {
    const n = typeof body.overlayOpacity === 'number'
      ? body.overlayOpacity
      : Number.parseInt(String(body.overlayOpacity), 10);
    if (!Number.isNaN(n)) data.overlayOpacity = n;
  }

  if (typeof body.backgroundPosition === 'string') data.backgroundPosition = body.backgroundPosition;
  if (typeof body.backgroundSize === 'string') data.backgroundSize = body.backgroundSize;

  if (body.buyNowLink === null || body.buyNowLink === '') data.buyNowLink = null;
  else if (typeof body.buyNowLink === 'string') data.buyNowLink = body.buyNowLink;

  return data;
}

export async function GET() {
  try {
    let settings = await prisma.heroSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!settings) {
      settings = await prisma.heroSettings.create({
        data: {
          title: 'Your Wellness Journey Starts Here',
          subtitle: 'Premium Health Products',
          description: 'Discover science-backed supplements, premium fitness gear, and organic wellness products curated for your health goals.',
          backgroundImage: '',
          backgroundType: 'GRADIENT',
          gradientFrom: '#16A34A',
          gradientVia: '#15803D',
          gradientTo: '#14532D',
          textColor: '#FFFFFF',
          overlayOpacity: 30,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        },
      });
    }

    return NextResponse.json(serializeHero(settings));
  } catch (error) {
    console.error('Hero settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch hero settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const raw = await req.json();
    const body = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
    const data = bodyToHeroData(body);

    const existing = await prisma.heroSettings.findFirst();

    let updated;
    if (existing) {
      updated = await prisma.heroSettings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      updated = await prisma.heroSettings.create({
        data: {
          title: 'Your Wellness Journey Starts Here',
          subtitle: 'Premium Health Products',
          description: 'Discover science-backed supplements, premium fitness gear, and organic wellness products curated for your health goals.',
          backgroundImage: '',
          backgroundType: 'GRADIENT',
          gradientFrom: '#16A34A',
          gradientVia: '#15803D',
          gradientTo: '#14532D',
          textColor: '#FFFFFF',
          overlayOpacity: 30,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          ...data,
        },
      });
    }

    return NextResponse.json(serializeHero(updated));
  } catch (error) {
    console.error('Hero settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update hero settings' }, { status: 500 });
  }
}
