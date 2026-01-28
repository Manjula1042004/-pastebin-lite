import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient()

  try {
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database test result:', result)

    return NextResponse.json({
      ok: true,
      message: 'Database connected successfully'
    })
  } catch (error: any) {
    console.error('Database connection error:', error.message)

    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}