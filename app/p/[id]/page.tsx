// app/p/[id]/page.tsx - SIMPLEST WORKING VERSION
import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const prisma = new PrismaClient()

  try {
    const { id } = await params

    const paste = await prisma.paste.findUnique({
      where: { id }
    })

    if (!paste) notFound()

    // Check constraints
    const now = new Date()
    if (paste.expiresAt && now > paste.expiresAt) {
      await prisma.paste.delete({ where: { id } })
      notFound()
    }

    if (paste.maxViews && paste.viewCount >= paste.maxViews) {
      await prisma.paste.delete({ where: { id } })
      notFound()
    }

    // Increment view
    await prisma.paste.update({
      where: { id },
      data: { viewCount: paste.viewCount + 1 }
    })

    return (
      <div style={{ padding: '2rem' }}>
        <h1>Paste</h1>
        <pre style={{
          background: '#f5f5f5',
          padding: '1rem',
          whiteSpace: 'pre-wrap'
        }}>
          {paste.content}
        </pre>
        <p><a href="/">Create another paste</a></p>
      </div>
    )

  } catch (error) {
    notFound()
  } finally {
    await prisma.$disconnect()
  }
}