// Decap CMS GitHub OAuth proxy for Vercel
// Handles /api/auth and /api/auth/callback routes

const GH_AUTH = 'https://github.com/login/oauth/authorize';
const GH_TOKEN = 'https://github.com/login/oauth/access_token';
const ORIGIN = 'https://convertpivot.com';

function htmlPage(title, body) {
  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + title + '</title><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;background:#0f0f0f;color:#e0e0e0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:20px}a{color:#FF0000}.card{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:32px;max-width:400px}.err{color:#ef4444}</style></head><body><div class="card">' + body + '</div></body></html>';
}

export default async function handler(req, res) {
  var url = new URL(req.url, 'http://localhost');
  var path = url.pathname;
  var isCallback = path.endsWith('/callback');

  var clientId = process.env.GH_CLIENT_ID;
  var clientSecret = process.env.GH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500);
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlPage('Not Configured',
      '<h2 style="color:#FF0000">GitHub OAuth Not Configured</h2><p>Set <code>GH_CLIENT_ID</code> and <code>GH_CLIENT_SECRET</code> environment variables in Vercel.</p><p style="font-size:0.85rem;color:#888;margin-top:16px">Create a GitHub OAuth App with callback URL:<br><code>https://convertpivot.com/api/auth/callback</code></p>'
    ));
    return;
  }

  if (isCallback) {
    var code = url.searchParams.get('code');
    var state = url.searchParams.get('state');

    if (!code) {
      res.status(400);
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlPage('Error', '<h2 class="err">Missing authorization code</h2><p>GitHub did not return an authorization code. Try logging in again.</p>'));
      return;
    }

    try {
      var tokenResp = await fetch(GH_TOKEN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code
        })
      });
      var tokenData = await tokenResp.json();

      if (tokenData.error) {
        res.status(400);
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlPage('Error', '<h2 class="err">' + tokenData.error + '</h2><p>' + (tokenData.error_description || '') + '</p>'));
        return;
      }

      var token = tokenData.access_token;
      if (!token) {
        res.status(400);
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlPage('Error', '<h2 class="err">No access token returned</h2><p>GitHub did not return an access token.</p>'));
        return;
      }

      res.setHeader('Content-Type', 'text/html');
      res.send('<!DOCTYPE html><html><body><script>window.opener.postMessage("authorization:github:success:' + JSON.stringify({ token: token }).replace(/"/g, '&quot;') + '","*");window.close();</script></body></html>');
    } catch (err) {
      res.status(500);
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlPage('Error', '<h2 class="err">Server Error</h2><p>' + err.message + '</p>'));
    }
  } else {
    var state = url.searchParams.get('state') || '';
    var scope = url.searchParams.get('scope') || 'repo,user';
    var redirectUri = ORIGIN + '/api/auth/callback';
    var ghUrl = GH_AUTH + '?client_id=' + encodeURIComponent(clientId) + '&redirect_uri=' + encodeURIComponent(redirectUri) + '&scope=' + encodeURIComponent(scope) + '&state=' + encodeURIComponent(state);

    res.redirect(ghUrl);
  }
}
