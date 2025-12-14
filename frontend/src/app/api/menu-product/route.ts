import { NextResponse } from 'next/server'

import { moveTempToUploads } from '@/lib/moveTempToUploads'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.product.findMany({
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const body = await req.json()

  const finalImageUrl = await moveTempToUploads(body.imageUrl)

  const item = await prisma.product.create({
    data: {
      sectionId: body.sectionId,
      name: body.name,
      description: body.description || '',
      imageUrl: finalImageUrl,
      data: body.data || {},
      order: body.order ?? 999,
    },
  })

  return NextResponse.json(item)
}
