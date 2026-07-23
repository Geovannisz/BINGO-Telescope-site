/**
 * BINGO Telescope — CMS OAuth Proxy (Cloudflare Worker)
 * ─────────────────────────────────────────────────────
 * Handles Google and GitHub OAuth flows for Decap CMS.
 *
 * Authorization: Reads allowed emails dynamically from team .md files
 * in the GitHub repository. Falls back to a static allowlist if the
 * API call fails. This means adding a new team member with an email
 * automatically grants CMS access — no Worker redeployment needed.
 *
 * Required secrets (set via `wrangler secret put <NAME>`):
 *   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 */

// ── Static fallback allowlist (kept in sync with team files) ──
const STATIC_ALLOWED_EMAILS = [
  'geovanni@usp.br',
  'geovannisz@gmail.com',
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

// ── Dynamic email fetcher ──
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

    const emails = new Set(STATIC_ALLOWED_EMAILS.map(e => e.toLowerCase().trim()));

    for (const f of mdFiles) {
      try {
        const raw = await fetch(f.download_url, { headers: { 'User-Agent': 'BINGO-CMS-OAuth-Worker' } });
        const text = await raw.text();

        // Extract email from frontmatter
        const emailMatch = text.match(/^email:\s*["']?([^\s"']+)/m);
        if (emailMatch) {
          // Handle "email1 / email2" format
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

// ── HTML templates ──
function htmlPage(title, bodyContent) {
  return new Response(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0f172a 100%);
      color: #e2e8f0;
    }
    .card {
      background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(20px);
      border: 1px solid rgba(99, 102, 241, 0.15);
      border-radius: 20px; padding: 48px; max-width: 460px; width: 90%;
      text-align: center; box-shadow: 0 25px 60px rgba(0,0,0,0.4);
    }
    h1 { font-size: 1.5rem; margin-bottom: 8px; color: #fff; }
    p { color: #94a3b8; margin-bottom: 24px; font-size: 0.95rem; }
    .btn {
      display: block; padding: 14px 24px; border-radius: 12px;
      font-size: 1rem; font-weight: 600; text-decoration: none;
      transition: all 0.2s ease; margin-bottom: 12px; border: none; cursor: pointer;
    }
    .btn-google {
      background: linear-gradient(135deg, #4285f4, #357ae8); color: #fff;
    }
    .btn-google:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(66,133,244,0.4); }
    .btn-github {
      background: linear-gradient(135deg, #333, #24292e); color: #fff;
    }
    .btn-github:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .icon { font-size: 2.5rem; margin-bottom: 16px; }
    .error { color: #f87171; }
    .email-highlight { color: #fff; font-weight: 700; }
    .back-link { display: inline-block; margin-top: 16px; color: #6366f1; text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { color: #818cf8; }
  </style>
</head>
<body>
  <div class="card">${bodyContent}</div>
</body>
</html>`, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

function authPage() {
  return htmlPage('BINGO CMS - Autenticação', `
    <div class="icon">🔭</div>
    <h1>BINGO CMS</h1>
    <p>Selecione seu método de acesso</p>
    <a href="/google/auth" class="btn btn-google">Login com Google</a>
    <a href="/github/login" class="btn btn-github">Login com GitHub</a>
  `);
}

function deniedPage(email) {
  return htmlPage('Acesso Negado', `
    <div class="icon">🚫</div>
    <h1 class="error">Acesso Negado</h1>
    <p>O e-mail <span class="email-highlight">${email}</span> não está autorizado.</p>
    <p style="font-size: 0.85rem; color: #64748b;">Solicite ao administrador que adicione seu perfil na equipe do site para liberar o acesso.</p>
    <a href="/auth" class="back-link">← Tentar novamente</a>
  `);
}

function errorPage(msg) {
  return htmlPage('Erro', `
    <div class="icon">⚠️</div>
    <h1 class="error">Erro</h1>
    <p>${msg}</p>
    <a href="/auth" class="back-link">← Tentar novamente</a>
  `);
}

// ── OAuth flows ──

// GitHub OAuth
async function handleGitHubLogin(env) {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope: 'repo,user',
    redirect_uri: 'https://bingo-cms-oauth.geovanni.workers.dev/github/callback',
  });
  return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
}

async function handleGitHubCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return errorPage('Código de autorização não encontrado.');

  // Exchange code for token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return errorPage('Falha ao obter token de acesso do GitHub.');

  // Get user info
  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${tokenData.access_token}`, 'User-Agent': 'BINGO-CMS-OAuth' },
  });
  const user = await userRes.json();

  // Get primary email
  const emailsRes = await fetch('https://api.github.com/user/emails', {
    headers: { Authorization: `token ${tokenData.access_token}`, 'User-Agent': 'BINGO-CMS-OAuth' },
  });
  const emails = await emailsRes.json();
  const primaryEmail = Array.isArray(emails)
    ? (emails.find(e => e.primary)?.email || emails[0]?.email || user.email)
    : user.email;

  // Check authorization
  if (primaryEmail && !(await isEmailAllowed(primaryEmail, env))) {
    return deniedPage(primaryEmail);
  }

  // Return token to Decap CMS via postMessage
  return new Response(`<!DOCTYPE html><html><head><script>
    (function() {
      function receiveMessage(e) {
        console.log("receiveMessage", e);
        window.opener.postMessage(
          'authorization:github:success:${JSON.stringify({ token: tokenData.access_token, provider: 'github' })}',
          e.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    })();
  </script></head><body><p>Autenticando...</p></body></html>`, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

// Google OAuth
async function handleGoogleAuth(env) {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: 'https://bingo-cms-oauth.geovanni.workers.dev/google/callback',
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });
  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, 302);
}

async function handleGoogleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) return errorPage(`Google retornou erro: ${error}`);
  if (!code) return errorPage('Código de autorização não encontrado.');

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'https://bingo-cms-oauth.geovanni.workers.dev/google/callback',
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) return errorPage('Falha ao obter token de acesso do Google.');

  // Get user info from Google
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userInfo = await userRes.json();
  const email = userInfo.email;

  if (!email) return errorPage('Não foi possível obter o e-mail da conta Google.');

  // Check authorization
  if (!(await isEmailAllowed(email, env))) {
    return deniedPage(email);
  }

  // Now we need a GitHub token for Decap CMS (Google is only for identity)
  // Use the GitHub OAuth Device Flow or redirect to GitHub login
  // Strategy: after Google verification, redirect to GitHub OAuth to get a repo token
  const ghParams = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope: 'repo,user',
    redirect_uri: 'https://bingo-cms-oauth.geovanni.workers.dev/github/callback',
  });
  return Response.redirect(`https://github.com/login/oauth/authorize?${ghParams}`, 302);
}

// ── Main handler ──
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      // Routes
      if (path === '/') return new Response('BINGO CMS OAuth Proxy — OK (GitHub + Google)', { status: 200 });
      if (path === '/auth') return authPage();

      // GitHub flow
      if (path === '/github/login') return handleGitHubLogin(env);
      if (path === '/github/callback') return handleGitHubCallback(request, env);

      // Google flow
      if (path === '/google/auth') return handleGoogleAuth(env);
      if (path === '/google/callback') return handleGoogleCallback(request, env);

      return new Response('Not found', { status: 404 });
    } catch (e) {
      console.error('Worker error:', e);
      return errorPage(`Erro interno: ${e.message}`);
    }
  },
};
