import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)

    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const section = await prisma.menuSection.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!section) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(section)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch section' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)

    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const body = await req.json()

    if (!body?.name || !body?.slug) {
      return NextResponse.json({ error: 'Missing name or slug' }, { status: 400 })
    }

    const updated = await prisma.menuSection.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        schema: body.schema || { options: [] },
        order: body.order ?? undefined,
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)

    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    await prisma.menuSection.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
  }
}
