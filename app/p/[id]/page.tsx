import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'

async function getPaste(id: string) {
  const prisma = new PrismaClient()

  try {
    console.log('🔍 Fetching paste:', id)

    const paste = await prisma.paste.findUnique({
      where: { id }
    })

    if (!paste) {
      console.log('❌ Paste not found')
      notFound()
    }

    console.log('📄 Found paste:', {
      id: paste.id,
      viewCount: paste.viewCount,
      maxViews: paste.maxViews,
      expiresAt: paste.expiresAt
    })

    // Check expiry
    const now = new Date()
    if (paste.expiresAt && now > paste.expiresAt) {
      console.log('⏰ Paste expired')
      await prisma.paste.delete({ where: { id } })
      notFound()
    }

    // Check view limit
    if (paste.maxViews && paste.viewCount >= paste.maxViews) {
      console.log('👁️ View limit reached')
      await prisma.paste.delete({ where: { id } })
      notFound()
    }

    // Increment view count
    console.log('📈 Incrementing view count')
    await prisma.paste.update({
      where: { id },
      data: { viewCount: paste.viewCount + 1 }
    })

    return paste

  } catch (error) {
    console.error('🔥 Error:', error)
    notFound()
  } finally {
    await prisma.$disconnect()
  }
}

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const paste = await getPaste(id)

  const remainingViews = paste.maxViews
    ? paste.maxViews - paste.viewCount  // Already incremented in getPaste
    : null

  const expiresAt = paste.expiresAt
    ? new Date(paste.expiresAt).toLocaleString()
    : null

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Paste</h1>

      <div style={{
        background: '#f5f5f5',
        padding: '1rem',
        borderRadius: '4px',
        whiteSpace: 'pre-wrap',
        fontFamily: 'monospace',
        minHeight: '200px',
        marginBottom: '1rem'
      }}>
        {paste.content}
      </div>

      {/* Info panel */}
      <div style={{
        background: '#e6f7ff',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        <h3 style={{ marginTop: 0 }}>Paste Info</h3>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <div>
            <p><strong>Views:</strong> {paste.viewCount}</p>
            <p><strong>Remaining:</strong>
              {remainingViews !== null ? ` ${remainingViews}` : ' Unlimited'}
            </p>
          </div>

          <div>
            <p><strong>Created:</strong> {new Date(paste.createdAt).toLocaleString()}</p>
            <p><strong>Expires:</strong>
              {expiresAt ? ` ${expiresAt}` : ' Never'}
            </p>
          </div>
        </div>
      </div>

      <p>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>
          ← Create another paste
        </a>
      </p>
    </div>
  )
}