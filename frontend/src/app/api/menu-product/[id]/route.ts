import { NextResponse } from 'next/server'

import { moveTempToUploads } from '@/lib/moveTempToUploads'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  const item = await prisma.product.findUnique({ where: { id } })

  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)
  const body = await req.json()

  const finalImageUrl = body.imageUrl ? await moveTempToUploads(body.imageUrl) : body.imageUrl

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description || '',
      imageUrl: finalImageUrl,
      data: body.data || {},
      order: body.order ?? undefined,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10)

  await prisma.product.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
