import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient()

  try {
    // TEST MODE support (from PDF requirements)
    const testMode = process.env.TEST_MODE === '1'
    const testNowHeader = request.headers.get('x-test-now-ms')
    const now = testMode && testNowHeader
      ? new Date(parseInt(testNowHeader))
      : new Date()

    // Get id from params
    const { id } = await params

    console.log('📅 Current time for expiry check:', now.toISOString())
    console.log('🔧 Test mode:', testMode, 'Test header:', testNowHeader)

    // Find paste
    const paste = await prisma.paste.findUnique({
      where: { id }
    })

    // Check if paste exists
    if (!paste) {
      console.log('❌ Paste not found:', id)
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      )
    }

    console.log('📄 Found paste:', {
      id: paste.id,
      expiresAt: paste.expiresAt?.toISOString(),
      viewCount: paste.viewCount,
      maxViews: paste.maxViews,
      contentPreview: paste.content.substring(0, 50) + '...'
    })

    // Check if expired (using now from test mode if applicable)
    if (paste.expiresAt && now > paste.expiresAt) {
      console.log('⏰ Paste expired!', {
        now: now.toISOString(),
        expiresAt: paste.expiresAt.toISOString()
      })
      await prisma.paste.delete({ where: { id } })
      return NextResponse.json(
        { error: 'Paste expired' },
        { status: 404 }
      )
    }

    // Check view limit
    if (paste.maxViews && paste.viewCount >= paste.maxViews) {
      console.log('👁️ View limit reached!', {
        viewCount: paste.viewCount,
        maxViews: paste.maxViews
      })
      await prisma.paste.delete({ where: { id } })
      return NextResponse.json(
        { error: 'Paste view limit reached' },
        { status: 404 }
      )
    }

    // Increment view count
    console.log('📈 Incrementing view count from', paste.viewCount, 'to', paste.viewCount + 1)
    await prisma.paste.update({
      where: { id },
      data: { viewCount: paste.viewCount + 1 }
    })

    // Prepare response
    const response = {
      content: paste.content,
      remaining_views: paste.maxViews
        ? paste.maxViews - (paste.viewCount + 1)
        : null,
      expires_at: paste.expiresAt?.toISOString() || null,
      // For debugging
      _debug: testMode ? {
        test_mode: true,
        now_used: now.toISOString(),
        real_now: new Date().toISOString()
      } : undefined
    }

    console.log('✅ Returning response:', response)
    return NextResponse.json(response)

  } catch (error: any) {
    console.error('🔥 Get paste error:', error)
    // Use process.env.TEST_MODE directly here
    const isTestMode = process.env.TEST_MODE === '1'
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: isTestMode ? error.message : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}