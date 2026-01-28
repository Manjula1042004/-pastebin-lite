import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient()

  try {
    // Test 1: Check if env var is loaded
    const dbUrl = process.env.DATABASE_URL
    const dbUrlExists = !!dbUrl

    // Test 2: Try raw query
    let queryResult = null
    let queryError = null
    try {
      queryResult = await prisma.$queryRaw`SELECT 1 as test`
    } catch (error: any) {
      queryError = error.message
    }

    // Test 3: Try to connect
    let connectSuccess = false
    try {
      await prisma.$connect()
      connectSuccess = true
      await prisma.$disconnect()
    } catch (error: any) {
      queryError = error.message
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      dbUrlExists,
      dbUrlLength: dbUrl?.length,
      dbUrlPreview: dbUrl ? dbUrl.substring(0, 30) + '...' : null,
      connectSuccess,
      queryResult,
      queryError
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}