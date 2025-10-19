// functions/api/[[path]].js
export async function onRequest(ctx) {
  const { request, env, params } = ctx;

  // ====== CONFIG ======
  // 1) Set di Cloudflare Pages → Settings → Environment variables:
  //    GAS_BASE = https://script.google.com/macros/s/AKfycbXXXX/exec
  const GAS_BASE = env.GAS_BASE;

  if (!GAS_BASE) {
    return new Response(
      JSON.stringify({ error: 'Missing GAS_BASE env. Set in Pages Settings.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }

  // ====== CORS ======
  const origin = request.headers.get('Origin') || '*';
  const corsHeaders = {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'Content-Type, Authorization, X-Requested-With',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'vary': 'Origin'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Path setelah /api/... dikirimkan mentah ke GAS
  const tail = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const url = new URL(request.url);
  const target = new URL(GAS_BASE);

  // Forward query ?a=1&b=2 ke GAS
  target.search = url.search; // pertahankan query string
  // Opsional: kirim path juga, mis. GAS bisa baca parameter "path"
  target.searchParams.set('path', `/${tail}`);

  // Sanitasi headers (hapus hopByHop)
  const hopByHop = new Set(['connection','keep-alive','transfer-encoding','upgrade','proxy-authenticate','proxy-authorization','te','trailers']);
  const fwdHeaders = new Headers();
  for (const [k,v] of request.headers.entries()) {
    if (!hopByHop.has(k.toLowerCase())) fwdHeaders.set(k, v);
  }

  // Body (untuk POST/PUT/PATCH)
  let body = null;
  if (!['GET','HEAD'].includes(request.method)) {
    body = await request.arrayBuffer();
  }

  // Proxy call
  const res = await fetch(target.toString(), {
    method: request.method,
    headers: fwdHeaders,
    body,
    redirect: 'follow'
  });

  // Build response + CORS
  const outHeaders = new Headers(res.headers);
  // Paksa JSON/text tetap terbaca CORS
  outHeaders.set('access-control-allow-origin', corsHeaders['access-control-allow-origin']);
  outHeaders.set('access-control-allow-credentials', corsHeaders['access-control-allow-credentials']);
  outHeaders.set('vary', corsHeaders['vary']);

  return new Response(res.body, { status: res.status, headers: outHeaders });
}
