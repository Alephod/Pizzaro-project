import { promises as fs } from 'fs'
import path from 'path'

export async function moveTempToUploads(tempUrl: string) {
  if (!tempUrl || typeof tempUrl !== 'string') return tempUrl

  if (!tempUrl.startsWith('/temp-uploads/')) return tempUrl

  const filename = tempUrl.replace('/temp-uploads/', '')

  const tempPath = path.join(process.cwd(), 'public', 'temp-uploads', filename)
  const finalDir = path.join(process.cwd(), 'public', 'uploads')

  await fs.mkdir(finalDir, { recursive: true })

  const finalPath = path.join(finalDir, filename)

  try {
    await fs.rename(tempPath, finalPath)
  } catch {
    return tempUrl
  }

  return `/uploads/${filename}`
}

export default moveTempToUploads
