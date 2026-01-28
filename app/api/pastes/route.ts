import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function POST(request: Request) {
  const prisma = new PrismaClient()

  try {
    const body = await request.json()
    const { content, ttl_seconds, max_views } = body

    // Validation
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (ttl_seconds && (typeof ttl_seconds !== 'number' || ttl_seconds < 1)) {
      return NextResponse.json(
        { error: 'ttl_seconds must be an integer >= 1' },
        { status: 400 }
      )
    }

    if (max_views && (typeof max_views !== 'number' || max_views < 1)) {
      return NextResponse.json(
        { error: 'max_views must be an integer >= 1' },
        { status: 400 }
      )
    }

    // Calculate expiresAt
    const expiresAt = ttl_seconds
      ? new Date(Date.now() + ttl_seconds * 1000)
      : null

    // Create paste
    const paste = await prisma.paste.create({
      data: {
        content: content.trim(),
        expiresAt,
        maxViews: max_views || null,
        viewCount: 0
      }
    })

    // Generate URL
    const url = `http://localhost:3000/p/${paste.id}`

    return NextResponse.json({
      id: paste.id,
      url: url
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create paste error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Optional: Add GET method to show it exists
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to create a paste.' },
    { status: 405 }
  )
}