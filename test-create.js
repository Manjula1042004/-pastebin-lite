const fetch = require('node-fetch')

async function testCreatePaste() {
  const response = await fetch('http://localhost:3000/api/pastes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: 'Hello World Test Paste',
      ttl_seconds: 60,
      max_views: 5
    })
  })

  const data = await response.json()
  console.log('Status:', response.status)
  console.log('Response:', data)
}

testCreatePaste()