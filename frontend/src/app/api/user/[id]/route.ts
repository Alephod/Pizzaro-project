import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import type { OrderData } from '@/types/order'

import type { NextRequest } from 'next/server'

type UserProfileResponse = {
    id: number;
    email: string;
    data: {
        name: string;
        phone: string | null;
        dob: string | null;
        addresses: string[];
        orders: OrderData[]; 
    };
};

function isValidPhone(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true
  if (typeof value !== 'string') return false

  return /^[+\d][\d\s\-()]{4,}$/.test(value)
}

function isIsoDate(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return true
  if (typeof value !== 'string') return false
  const d = new Date(value)

  return !Number.isNaN(d.getTime())
}

function ensureAddresses(value: unknown): string[] | null {
  if (value === null || value === undefined) return []
  if (!Array.isArray(value)) return null
  const ok = value.every((v) => typeof v === 'string')

  return ok ? (value as string[]) : null
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const userData = (user.data && typeof user.data === 'object' ? user.data : {}) as Record<string, unknown>

  const response: UserProfileResponse = {
    id: user.id,
    email: user.email,
    data: {
      name: typeof userData.name === 'string' ? userData.name : '',
      phone: typeof userData.phone === 'string' ? userData.phone : null,
      dob: typeof userData.dob === 'string' ? userData.dob : null,
      addresses: Array.isArray(userData.addresses) ? (userData.addresses as string[]) : [],
      orders: Array.isArray(userData.orders) ? (userData.orders as OrderData[]) : [], // <- важно
    },
  }

  return NextResponse.json(response)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const incoming = body as {
        name?: unknown;
        phone?: unknown;
        dob?: unknown;
        addresses?: unknown;
    }

  const errors: Record<string, string> = {}

  if (incoming.name !== undefined) {
    if (typeof incoming.name !== 'string' || incoming.name.trim() === '') {
      errors.name = 'Name is required and must be a non-empty string'
    }
  }

  if (incoming.phone !== undefined) {
    if (!isValidPhone(incoming.phone)) {
      errors.phone = 'Invalid phone format'
    }
  }

  if (incoming.dob !== undefined) {
    if (!isIsoDate(incoming.dob)) {
      errors.dob = 'Invalid date format'
    }
  }

  let addressesNormalized: string[] | null = null

  if (incoming.addresses !== undefined) {
    addressesNormalized = ensureAddresses(incoming.addresses)

    if (addressesNormalized === null) {
      errors.addresses = 'Addresses must be an array of strings'
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
  }

  const toUpdate: Record<string, unknown> = {}

  if (incoming.name !== undefined) toUpdate.name = (incoming.name as string).trim()
  if (incoming.phone !== undefined) toUpdate.phone = incoming.phone === '' ? null : (incoming.phone as string)
  if (incoming.dob !== undefined) toUpdate.dob = incoming.dob === '' ? null : (incoming.dob as string)
  if (addressesNormalized !== null) toUpdate.addresses = addressesNormalized

  try {
    const user = await prisma.user.findUnique({ where: { id } })
    const existingData = (user?.data && typeof user.data === 'object') ? (user.data as Record<string, unknown>) : {}

    const newData = { ...existingData, ...toUpdate }

    if (Array.isArray(newData.addresses)) {
      newData.addresses = (newData.addresses as unknown[]).map(String)
    }

    const prismaData = JSON.parse(JSON.stringify(newData))

    const updated = await prisma.user.update({
      where: { id },
      data: {
        data: prismaData,
      },
    })

    const resp: UserProfileResponse = {
      id: updated.id,
      email: updated.email,
      data: {
        name: typeof newData.name === 'string' ? newData.name : '',
        phone: typeof newData.phone === 'string' ? newData.phone : null,
        dob: typeof newData.dob === 'string' ? newData.dob : null,
        addresses: Array.isArray(newData.addresses) ? (newData.addresses as string[]) : [],
        orders: Array.isArray(newData.orders) ? (newData.orders as OrderData[]) : [],
      },
    }

    return NextResponse.json(resp)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.user.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
