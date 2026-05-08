import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    let settings = await prisma.heroSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    
    if (!settings) {
      // Create default hero settings if none exist
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
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Hero settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch hero settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await prisma.heroSettings.findFirst();
    
    let updated;
    if (existing) {
      updated = await prisma.heroSettings.update({
        where: { id: existing.id },
        data: body,
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
          ...body,
        },
      });
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Hero settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update hero settings' }, { status: 500 });
  }
}