import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { createApiLogger } from '@/utils/logger';

export async function POST(request: NextRequest, { params }: { params: Promise<{ tag: string }> }) {
  const resolvedParams = await params;
  const { tag } = resolvedParams;
  const logger = createApiLogger(`/api/revalidate/${tag}`, request);

  const allowedTags = ['youtube', 'instagram', 'github'];

  logger.info('Cache revalidation requested', { tag });

  if (!allowedTags.includes(tag)) {
    logger.warn('Invalid revalidation tag requested', { 
      tag, 
      allowedTags 
    });
    return NextResponse.json({ error: 'Invalid tag' }, { status: 400 });
  }

  try {
    revalidateTag(tag);
    logger.info('Cache tag revalidated successfully', { tag });
    return NextResponse.json({ message: `Cache tag '${tag}' revalidated successfully` });
  } catch (error) {
    const err = error as Error;
    logger.error('Cache revalidation failed', { tag }, err);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}