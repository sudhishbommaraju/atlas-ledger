import { NextRequest, NextResponse } from 'next/server'
import { parseFile, validateFile } from '@/lib/parsers/index'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ records: [], warnings: [], error: 'No file provided.' })
    }

    const filename = (file as File).name || 'upload'
    const validationError = validateFile(filename, file.size)
    if (validationError) {
      return NextResponse.json({ records: [], warnings: [], error: validationError })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await parseFile(buffer, filename)

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({
      records: [],
      warnings: [],
      error: `Server error: ${(err as Error).message}`,
    })
  }
}
