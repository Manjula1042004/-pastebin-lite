const { Client } = require('pg')

const connectionString = "postgresql://neondb_owner:npg_dHimgeJA4hw3@ep-solitary-mountain-ahcw4loo-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

async function test() {
  console.log("Testing Neon connection...")
  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log("✅ SUCCESS: Connected to Neon!")
    const res = await client.query("SELECT version()")
    console.log("PostgreSQL Version:", res.rows[0].version)
    await client.end()
    return true
  } catch (err) {
    console.log("❌ FAILED with channel_binding:", err.message)

    // Try WITHOUT channel_binding
    console.log("\nTrying WITHOUT channel_binding...")
    const client2 = new Client({
      connectionString: "postgresql://neondb_owner:npg_dHimgeJA4hw3@ep-solitary-mountain-ahcw4loo-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
    })

    try {
      await client2.connect()
      console.log("✅ SUCCESS: Connected WITHOUT channel_binding!")
      await client2.end()
      return true
    } catch (err2) {
      console.log("❌ FAILED both attempts:", err2.message)
      return false
    }
  }
}

test()