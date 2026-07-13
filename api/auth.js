const GH_AUTH = 'https://github.com/login/oauth/authorize';
const GH_TOKEN = 'https://github.com/login/oauth/access_token';
const ORIGIN = 'https://convertpivot.com';

function page(title, body) {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + title + '</title><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0f0f0f;color:#e0e0e0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:20px}.card{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:32px;max-width:500px}h2{color:#FF0000;margin-top:0}code{background:#2a2a2a;padding:2px 6px;border-radius:3px;font-size:0.9em}p{color:#ccc;line-height:1.5}.hint{font-size:0.85rem;color:#888;margin-top:16px;border-top:1px solid #2a2a2a;padding-top:16px}</style></head><body><div class="card">' + body + '</div></body></html>';
}

module.exports = async function handler(req, res) {
  var url = new URL(req.url, 'http://localhost');
  var path = url.pathname;
  var isCallback = path.endsWith('/callback');

  var clientId = process.env.GH_CLIENT_ID;
  var clientSecret = process.env.GH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).setHeader('Content-Type', 'text/html').end(page('Not Configured',
      '<h2>GitHub OAuth Not Configured</h2><p>Set <code>GH_CLIENT_ID</code> and <code>GH_CLIENT_SECRET</code> environment variables in Vercel.</p><div class="hint">Create a GitHub OAuth App with callback URL:<br><code>https://convertpivot.com/api/auth/callback</code></div>'
    ));
  }

  if (isCallback) {
    var code = url.searchParams.get('code');
    if (!code) {
      return res.status(400).setHeader('Content-Type', 'text/html').end(page('Error', '<h2 style="color:#ef4444">Missing authorization code</h2><p>GitHub did not return an authorization code.</p>'));
    }

    try {
      var tokenResp = await fetch(GH_TOKEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
      });
      var tokenData = await tokenResp.json();

      if (tokenData.error) {
        return res.status(400).setHeader('Content-Type', 'text/html').end(
          page('Error', '<h2 style="color:#ef4444">' + tokenData.error + '</h2><p>' + (tokenData.error_description || '') + '</p>')
        );
      }

      if (!tokenData.access_token) {
        return res.status(400).setHeader('Content-Type', 'text/html').end(page('Error', '<h2 style="color:#ef4444">No Token</h2><p>GitHub did not return an access token.</p>'));
      }

      return res.setHeader('Content-Type', 'text/html').end(
        '<!DOCTYPE html><html><body><script>window.opener.postMessage("authorization:github:success:' +
        JSON.stringify({ token: tokenData.access_token }).replace(/"/g, '&quot;') +
        '","*");window.close();</script></body></html>'
      );
    } catch (err) {
      return res.status(500).setHeader('Content-Type', 'text/html').end(page('Error', '<h2 style="color:#ef4444">Server Error</h2><p>' + err.message + '</p>'));
    }
  } else {
    var state = url.searchParams.get('state') || '';
    var scope = url.searchParams.get('scope') || 'repo,user';
    var ghUrl = GH_AUTH + '?client_id=' + encodeURIComponent(clientId) + '&redirect_uri=' + encodeURIComponent(ORIGIN + '/api/auth/callback') + '&scope=' + encodeURIComponent(scope) + '&state=' + encodeURIComponent(state);
    res.redirect(ghUrl);
  }
};
