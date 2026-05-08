import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const image = await prisma.image.findUnique({
      where: { id },
      select: {
        data: true,
        mimeType: true,
        filename: true,
      },
    });

    if (!image) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Return the image with proper headers
    return new NextResponse(image.data, {
      status: 200,
      headers: {
        'Content-Type': image.mimeType,
        'Content-Disposition': `inline; filename="${image.filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}