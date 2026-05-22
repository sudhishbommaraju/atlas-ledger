import { NextRequest, NextResponse } from 'next/server'
import { parseFile, validateFile } from '@/lib/parsers/index'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ files: [], error: 'No file provided.' })
    }

    const filename = (file as File).name || 'upload'
    const validationError = validateFile(filename, file.size)
    if (validationError) {
      return NextResponse.json({ files: [], error: validationError })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    console.log("UPLOAD HANDLER HIT");
    
    const result = await parseFile(buffer, filename)
    
    console.log("PARSER HIT");
    console.log("FILES EXTRACTED:", result.length);

    return NextResponse.json({ files: result })
  } catch (err) {
    return NextResponse.json({
      files: [],
      error: `Server error: ${(err as Error).message}`,
    })
  }
}
