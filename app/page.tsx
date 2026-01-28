export default function Home() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Pastebin Lite</h1>
      <p>Create and share text snippets with optional expiry</p>

      <form id="pasteForm" style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Content:
          </label>
          <textarea
            id="content"
            rows={10}
            style={{ width: '100%', padding: '0.5rem', fontFamily: 'monospace' }}
            placeholder="Paste your text here..."
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Expire after (seconds):
            </label>
            <input
              id="ttl"
              type="number"
              min="1"
              style={{ width: '100%', padding: '0.5rem' }}
              placeholder="Optional - leave empty for no expiry"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Max views:
            </label>
            <input
              id="maxViews"
              type="number"
              min="1"
              style={{ width: '100%', padding: '0.5rem' }}
              placeholder="Optional - leave empty for unlimited"
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Create Paste
        </button>
      </form>

      <div id="result" style={{ marginTop: '2rem' }}></div>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.getElementById('pasteForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const content = document.getElementById('content').value;
            const ttl = document.getElementById('ttl').value;
            const maxViews = document.getElementById('maxViews').value;

            // Prepare data
            const data = {
              content: content,
            };

            // Add optional fields if provided
            if (ttl && ttl.trim() !== '') {
              data.ttl_seconds = parseInt(ttl);
            }
            if (maxViews && maxViews.trim() !== '') {
              data.max_views = parseInt(maxViews);
            }

            try {
              const response = await fetch('/api/pastes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });

              const result = await response.json();

              if (response.ok) {
                document.getElementById('result').innerHTML = \`
                  <div style="background: #e6f7e6; padding: 1rem; border-radius: 4px; border-left: 4px solid #00a000;">
                    <h3 style="margin-top: 0; color: #00a000;">✅ Paste Created!</h3>
                    <p><strong>URL:</strong> <a href="\${result.url}" target="_blank" style="color: #0070f3;">\${result.url}</a></p>
                    <p><strong>ID:</strong> <code>\${result.id}</code></p>
                    <p>Share this link with others. The paste will expire based on your settings.</p>
                  </div>
                \`;
                document.getElementById('pasteForm').reset();
              } else {
                document.getElementById('result').innerHTML = \`
                  <div style="background: #ffe6e6; padding: 1rem; border-radius: 4px; border-left: 4px solid #ff0000;">
                    <h3 style="margin-top: 0; color: #ff0000;">❌ Error</h3>
                    <p>\${result.error}</p>
                  </div>
                \`;
              }
            } catch (error) {
              document.getElementById('result').innerHTML = \`
                <div style="background: #ffe6e6; padding: 1rem; border-radius: 4px; border-left: 4px solid #ff0000;">
                  <h3 style="margin-top: 0; color: #ff0000;">❌ Network Error</h3>
                  <p>\${error.message}</p>
                </div>
              \`;
            }
          });
        `
      }} />
    </div>
  )
}