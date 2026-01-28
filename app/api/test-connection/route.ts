import { NextResponse } from 'next/server'

export async function GET() {
  const testUrls = [
    // Try without SSL
    "postgresql://neondb_owner:npg_dHimgeJA4hw3@ep-solitary-mountain-ahcw4loo-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=disable",
    // Try with pooler
    "postgresql://neondb_owner:npg_dHimgeJA4hw3@ep-solitary-mountain-ahcw4loo-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ]

  const results = []

  for (const url of testUrls) {
    try {
      // Test with pg library directly
      const { Client } = await import('pg')
      const client = new Client({ connectionString: url })
      await client.connect()
      const result = await client.query('SELECT 1')
      await client.end()
      results.push({ url: url.substring(0, 50) + '...', success: true })
    } catch (error: any) {
      results.push({
        url: url.substring(0, 50) + '...',
        success: false,
        error: error.message
      })
    }
  }

  return NextResponse.json({ results })
}