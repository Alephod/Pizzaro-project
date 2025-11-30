import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const sections = await prisma.menuSection.findMany({
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(sections)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body?.name || !body?.slug) {
      return NextResponse.json({ error: 'Missing name or slug' }, { status: 400 })
    }

    const section = await prisma.menuSection.create({
      data: {
        name: body.name,
        slug: body.slug,
        schema: body.schema || { options: [] },
        order: body.order ?? 999,
      },
    })

    return NextResponse.json(section, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}
