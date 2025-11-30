import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const publicTempDir = path.join(process.cwd(), 'public', 'temp-uploads')

    await fs.mkdir(publicTempDir, { recursive: true })

    const ext = file.name && file.name.includes('.') ? file.name.split('.').pop() : file.type?.split('/')[1] ?? 'png'
    const filename = `${randomUUID()}-${Date.now()}.${ext}`
    const filePath = path.join(publicTempDir, filename)

    const bytes = Buffer.from(await file.arrayBuffer())

    await fs.writeFile(filePath, bytes)

    return NextResponse.json({ url: `/temp-uploads/${filename}` }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
