import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'

async function getPaste(id: string) {
  const prisma = new PrismaClient()

  try {
    // Find the paste
    const paste = await prisma.paste.findUnique({
      where: { id }
    })

    if (!paste) notFound()

    // Check expiry
    const now = new Date()
    if (paste.expiresAt && now > paste.expiresAt) {
      await prisma.paste.delete({ where: { id } })
      notFound()
    }

    // Check view limit
    if (paste.maxViews && paste.viewCount >= paste.maxViews) {
      await prisma.paste.delete({ where: { id } })
      notFound()
    }

    // Increment view count
    await prisma.paste.update({
      where: { id },
      data: { viewCount: paste.viewCount + 1 }
    })

    // Return ALL data including updated viewCount
    return {
      ...paste,
      viewCount: paste.viewCount + 1  // Already incremented
    }

  } catch (error) {
    console.error('Error:', error)
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

  // Calculate remaining views
  const remainingViews = paste.maxViews
    ? paste.maxViews - paste.viewCount
    : null

  // Format dates
  const createdAt = new Date(paste.createdAt).toLocaleString()
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
        minHeight: '100px',
        marginBottom: '1rem'
      }}>
        {paste.content}
      </div>

      {/* Constraints Info - ALWAYS SHOW */}
      <div style={{
        background: '#e6f7ff',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '1rem'
      }}>
        <h3 style={{ marginTop: 0 }}>Paste Information</h3>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <p><strong>Views:</strong> {paste.viewCount}</p>
            <p><strong>Max Views:</strong> {paste.maxViews || 'Unlimited'}</p>
            <p><strong>Remaining Views:</strong> {
              remainingViews !== null ? remainingViews : 'Unlimited'
            }</p>
          </div>

          <div>
            <p><strong>Created:</strong> {createdAt}</p>
            <p><strong>Expires:</strong> {expiresAt || 'Never'}</p>
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