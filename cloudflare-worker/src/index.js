// ══════════════════════════════════════════════════════════════
// BINGO CMS — OAuth Proxy (GitHub + Google)
// Cloudflare Worker — handles both GitHub and Google OAuth
// ══════════════════════════════════════════════════════════════
//
// v2.0 — Dynamic email allowlist
// Now reads authorized emails from team .md files in the GitHub
// repository. Adding a team member with an email field automatically
// grants CMS access — no Worker redeployment needed.
//
// Required environment variables (set via Cloudflare dashboard):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
//   GITHUB_BOT_TOKEN (PAT with repo access for Google-authenticated users)
//
// Optional env vars (with defaults):
//   GITHUB_REPO, GITHUB_BRANCH, TEAM_FOLDER
// ══════════════════════════════════════════════════════════════

// URLs exatas de callback para evitar problemas de mismatch
const GITHUB_REDIRECT_URI = 'https://bingo-cms-oauth.geovanni.workers.dev/callback';
const GOOGLE_REDIRECT_URI = 'https://bingo-cms-oauth.geovanni.workers.dev/google/callback';

// ── Static fallback allowlist (used if GitHub API is unavailable) ──
const STATIC_ALLOWED_EMAILS = [
  'geovanniszzzz@gmail.com',
  'geovanni@usp.br',
  'marinilima@secties.pb.gov.br',
  'eabdalla@usp.br',
  'eabdalla@if.usp.br',
  'alessandrormarins@gmail.com',
  'filipe.abdalla@gmail.com',
  'pablomotta@ustc.edu.cn',
  'alcidesvm@usp.br',
  'alexsander5996@usp.br',
  'alexsander6001@gmail.com',
  'alissonteles@gmail.com',
  'bertha@usp.br',
  'cmolina@usp.br',
  'passile6@usp.br',
  'evelingmilena@usp.br',
  'gabrsilvacosta@gmail.com',
  'jordanyv@gmail.com',
  'joaomank@academico.ufs.br',
  'lbarosi@df.ufcg.edu.br',
  'nicolli@usp.br',
  'nicolli50@outlook.com',
  'opavelfp2006@gmail.com',
  'talesaugusto.barros@ee.ufcg.edu.br',
];

// ── Dynamic email fetcher (reads team files from GitHub) ──
async function fetchAllowedEmails(env) {
  try {
    const repo = env.GITHUB_REPO || 'Geovannisz/BINGO-Telescope-site';
    const branch = env.GITHUB_BRANCH || 'main';
    const folder = env.TEAM_FOLDER || 'src/content/team';

    const listRes = await fetch(
      `https://api.github.com/repos/${repo}/contents/${folder}?ref=${branch}`,
      { headers: { 'User-Agent': 'BINGO-CMS-OAuth-Worker', Accept: 'application/vnd.github.v3+json' } }
    );
    if (!listRes.ok) throw new Error(`GitHub API ${listRes.status}`);

    const files = await listRes.json();
    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    // Start with static list as base
    const emails = new Set(STATIC_ALLOWED_EMAILS.map(e => e.toLowerCase().trim()));

    for (const f of mdFiles) {
      try {
        const raw = await fetch(f.download_url, { headers: { 'User-Agent': 'BINGO-CMS-OAuth-Worker' } });
        const text = await raw.text();

        // Extract email from YAML frontmatter
        const emailMatch = text.match(/^email:\s*["']?([^\n"']+)/m);
        if (emailMatch) {
          // Handle "email1 / email2" format used by some members
          const parts = emailMatch[1].split('/').map(e => e.trim().toLowerCase()).filter(e => e.includes('@'));
          parts.forEach(e => emails.add(e));
        }
      } catch (_) { /* skip individual file errors */ }
    }

    return emails;
  } catch (e) {
    console.warn('Dynamic email fetch failed, using static list:', e.message);
    return new Set(STATIC_ALLOWED_EMAILS.map(e => e.toLowerCase().trim()));
  }
}

async function isEmailAllowed(email, env) {
  const allowed = await fetchAllowedEmails(env);
  return allowed.has(email.toLowerCase().trim());
}

// ── postMessage HTML (sends token back to Decap CMS popup) ──
function buildPostMessageHTML(token) {
  return `<!DOCTYPE html><html><body><script>
    (function() {
      function recvMsg(e) {
        window.opener.postMessage(
          'authorization:github:success:{"token":"${token}","provider":"github"}',
          e.origin
        );
      }
      window.addEventListener("message", recvMsg, false);
      window.opener.postMessage("authorizing:github", "*");
    })();
  </script></body></html>`;
}

// ── Denied page ──
function deniedPage(email) {
  return new Response(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Acesso Negado</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
    body {
      background: radial-gradient(circle at top right, rgba(248, 113, 113, 0.1) 0%, transparent 40%),
                  radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
                  #020617;
      color: #f8fafc;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; text-align: center;
    }
    .card {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(248, 113, 113, 0.2);
      border-radius: 24px; padding: 3rem 2.5rem;
      width: 90%; max-width: 460px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { color: #f87171; font-size: 1.8rem; font-weight: 800; margin-bottom: 1rem; }
    p { color: #94a3b8; margin-bottom: 0.75rem; font-size: 1rem; line-height: 1.6; }
    .email { color: #fff; font-weight: 700; }
    .hint { font-size: 0.85rem; color: #64748b; margin-top: 1.5rem; }
    a { color: #60a5fa; text-decoration: none; }
    a:hover { color: #93c5fd; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⛔</div>
    <h1>Acesso Negado</h1>
    <p>O e-mail <span class="email">${email}</span> não está autorizado.</p>
    <p class="hint">Para solicitar acesso, entre em contato com o administrador e peça para adicionar seu perfil na equipe do site.</p>
    <p style="margin-top: 1.5rem;"><a href="/auth">← Tentar novamente</a></p>
  </div>
</body>
</html>`, { status: 403, headers: { 'Content-Type': 'text/html' } });
}

// ══════════════════════════════════════════════════════════════
// Main handler
// ══════════════════════════════════════════════════════════════
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ── Tela de Seleção (Intercepta o popup original do Decap CMS) ──
    if (url.pathname.startsWith('/auth')) {
      return new Response(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>BINGO CMS - Autenticação</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
    body {
      background: radial-gradient(circle at top right, rgba(6, 182, 212, 0.15) 0%, transparent 40%), 
                  radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.15) 0%, transparent 40%), 
                  #020617;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .card {
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(34, 211, 238, 0.15);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      width: 90%;
      max-width: 420px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    h1 {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #fff 0%, #22d3ee 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p.subtitle {
      color: #94a3b8;
      font-size: 1rem;
      margin-bottom: 2.5rem;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      padding: 16px;
      margin-bottom: 16px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      color: #fff;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn:hover {
      transform: translateY(-3px);
    }
    .btn-github {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn-github:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }
    .btn-google {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border: 1px solid rgba(59, 130, 246, 0.5);
    }
    .btn-google:hover {
      box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
      border-color: rgba(96, 165, 250, 0.5);
    }
    .icon { width: 22px; height: 22px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>BINGO CMS</h1>
    <p class="subtitle">Selecione seu método de acesso</p>
    
    <a href="/google/auth" class="btn btn-google">
      <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
      </svg>
      Login com Google
    </a>
    
    <a href="/github/login" class="btn btn-github">
      <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
      Login com GitHub
    </a>
  </div>
</body>
</html>`, { headers: { 'Content-Type': 'text/html' } });
    }

    // ── GitHub OAuth: início ──
    if (url.pathname === '/github/login') {
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
      authUrl.searchParams.set('scope', 'repo,user');
      return Response.redirect(authUrl.toString(), 302);
    }

    // ── GitHub OAuth: callback ──
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        return new Response('Auth error: ' + tokenData.error_description, { status: 401 });
      }
      return new Response(buildPostMessageHTML(tokenData.access_token), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // ── Google OAuth: início ──
    if (url.pathname === '/google/auth') {
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID.trim());
      authUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'email profile');
      authUrl.searchParams.set('access_type', 'online');
      return Response.redirect(authUrl.toString(), 302);
    }

    // ── Google OAuth: callback ──
    if (url.pathname === '/google/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing code', { status: 400 });

      // Exchange code for Google access token
      const bodyParams = `client_id=${env.GOOGLE_CLIENT_ID.trim()}&client_secret=${env.GOOGLE_CLIENT_SECRET.trim()}&code=${encodeURIComponent(code)}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}`;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: bodyParams,
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return new Response('Erro Google: ' + JSON.stringify(tokenData), { status: 500 });
      }

      // Get user email from Google
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userRes.json();

      // Check if email is authorized (dynamic + static)
      if (!(await isEmailAllowed(userData.email, env))) {
        return deniedPage(userData.email);
      }

      // Authorized! Send the pre-stored GitHub bot token to Decap CMS
      return new Response(buildPostMessageHTML(env.GITHUB_BOT_TOKEN.trim()), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // ── Health check ──
    if (url.pathname === '/') {
      return new Response('BINGO CMS OAuth Proxy — OK (GitHub + Google)', { status: 200 });
    }

    return new Response('Not found', { status: 404 });
  },
};
