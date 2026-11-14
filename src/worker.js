// Multiverse Gamer — sitio web (Cloudflare Worker).
//
// Sirve la página principal y los archivos que lee la app (version.json,
// catalogo.json, estudio.json, ...) tal cual están en el repo, y además arma
// sola una página por cada juego publicado:
//
//   /juegos                 -> todos nuestros juegos
//   /juegos/<id-del-juego>  -> la página de ese juego (ej. /juegos/total-crisis)
//
// Los juegos salen de estudio.json (el mismo archivo que usa la pestaña
// «⭐ Nuestros juegos» de la app): al publicar un juego nuevo ahí, su página
// aparece sola, sin tocar este archivo.

const DESCARGA_APP =
  "https://github.com/multiversogamer02-bit/multiverse-gamer/releases/latest/download/MultiverseGamer-Setup.exe";
const OTRAS_APPS = "https://multiemprendedor.ar";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // La dirección vieja de la página para cambiar contraseña, sin la barra final.
    if (url.pathname === "/restablecer") {
      return Response.redirect(url.origin + "/restablecer/" + url.search + url.hash, 301);
    }

    const ruta = url.pathname.replace(/\/+$/, "") || "/";
    if (ruta === "/juegos") {
      const juegos = await cargarJuegos(env, url);
      return html(paginaListado(juegos, url), 200);
    }
    const m = ruta.match(/^\/juegos\/([a-z0-9-]+)$/i);
    if (m) {
      const juegos = await cargarJuegos(env, url);
      const juego = juegos.find((j) => slug(j) === m[1].toLowerCase());
      if (!juego) return html(paginaNoEncontrado(juegos, url), 404);
      return html(paginaJuego(juego, url), 200);
    }
    return env.ASSETS.fetch(request);
  },
};

async function cargarJuegos(env, url) {
  try {
    const r = await env.ASSETS.fetch(new Request(new URL("/estudio.json", url.origin)));
    if (!r.ok) return [];
    const datos = await r.json();
    const lista = Array.isArray(datos) ? datos : datos.juegos || [];
    return lista.filter((j) => j && j.nombre);
  } catch (e) {
    return [];
  }
}

function slug(juego) {
  const base = String(juego.id || juego.nombre || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return base;
}

function esc(t) {
  return String(t == null ? "" : t).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function html(cuerpo, estado) {
  return new Response(cuerpo, {
    status: estado,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}

const ESTILO = `
:root{--ground:#0b0d16;--ground-2:#0e1120;--surface:#151a29;--surface-2:#1b2133;--line:#262c40;
--violet:#7c5cff;--violet-2:#9a80ff;--violet-deep:#5b3ee0;--teal:#00d4a0;--text:#eaecf7;--muted:#9aa0b8;--muted-2:#6f758f}
*{box-sizing:border-box}body{margin:0;background:var(--ground);color:var(--text);line-height:1.6;
font-family:'Manrope',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}img{max-width:100%;display:block}
h1,h2,h3{font-family:'Sora',sans-serif;line-height:1.15;margin:0}
.wrap{max-width:1100px;margin:0 auto;padding:0 22px}
header{border-bottom:1px solid var(--line);background:rgba(11,13,22,.9);position:sticky;top:0;z-index:5;backdrop-filter:blur(8px)}
.nav{display:flex;align-items:center;gap:16px;height:64px}
.brand{font-family:'Sora',sans-serif;font-weight:700;font-size:1.05rem}
.brand b{color:var(--violet-2)}
.sp{flex:1}
.lnk{color:var(--muted);font-size:.92rem}.lnk:hover{color:var(--text)}
.btn{display:inline-flex;align-items:center;gap:.5em;font-family:'Sora',sans-serif;font-weight:600;
padding:.8em 1.4em;border-radius:12px;border:1px solid transparent;white-space:nowrap}
.btn-p{background:linear-gradient(135deg,var(--violet),var(--violet-deep));color:#fff}
.btn-g{border-color:var(--line);background:rgba(255,255,255,.03)}.btn-g:hover{border-color:var(--violet)}
.chip{display:inline-block;font-size:.78rem;padding:.25em .7em;border-radius:99px;border:1px solid var(--line);color:var(--muted);margin:0 6px 6px 0}
.hero{padding:40px 0 10px}.banner{border-radius:18px;overflow:hidden;border:1px solid var(--line);margin-bottom:26px}
.eyebrow{font-family:'Chakra Petch',sans-serif;text-transform:uppercase;letter-spacing:.16em;font-size:.72rem;color:var(--violet-2)}
.lead{color:var(--muted);font-size:1.08rem;max-width:70ch;margin:14px 0 22px}
.cta{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0 30px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;margin:26px 0 40px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden;transition:border-color .15s}
.card:hover{border-color:var(--violet)}.card .in{padding:16px 18px}.card p{color:var(--muted);font-size:.92rem;margin:6px 0 0}
.shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin:10px 0 36px}
.shots img{border-radius:12px;border:1px solid var(--line)}
section h2{font-size:1.3rem;margin:26px 0 10px}
footer{border-top:1px solid var(--line);margin-top:40px;padding:26px 0 34px;color:var(--muted);font-size:.9rem}
footer .fila{display:flex;gap:18px;flex-wrap:wrap;align-items:center}
.otras{color:var(--violet-2);font-weight:600}
@media(max-width:640px){.oculto-cel{display:none}.nav{gap:10px}.btn{padding:.7em 1em}}
`;

function marco({ titulo, descripcion, imagen, url, cuerpo }) {
  const t = esc(titulo);
  const d = esc(descripcion);
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t}</title><meta name="description" content="${d}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website"><meta property="og:title" content="${t}">
<meta property="og:description" content="${d}"><meta property="og:url" content="${esc(url)}">
${imagen ? `<meta property="og:image" content="${esc(imagen)}"><meta name="twitter:card" content="summary_large_image">` : ""}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Manrope:wght@400;500;600;700&family=Chakra+Petch:wght@600&display=swap">
<style>${ESTILO}</style></head><body>
<header><div class="wrap nav">
  <a class="brand" href="/">Multiverse <b>Gamer</b></a>
  <a class="lnk oculto-cel" href="/juegos">Nuestros juegos</a>
  <span class="sp"></span>
  <a class="lnk" href="${OTRAS_APPS}">🧩 Otras apps</a>
  <a class="btn btn-p oculto-cel" href="${DESCARGA_APP}">Descargar gratis</a>
</div></header>
<main class="wrap">${cuerpo}</main>
<footer><div class="wrap fila">
  <span>© ${new Date().getFullYear()} Multiverse Gamer</span>
  <a class="lnk" href="/">Inicio</a><a class="lnk" href="/juegos">Nuestros juegos</a>
  <span class="sp"></span>
  <a class="otras" href="${OTRAS_APPS}">🧩 Conocé todas las apps de Multi Emprendedor →</a>
</div></footer></body></html>`;
}

function paginaJuego(j, url) {
  const nombre = j.nombre;
  const desc = j.descripcion || "";
  const largo = j.descripcion_larga || desc;
  const imagen = j.banner || j.imagen || "";
  const chips = []
    .concat(j.genero ? [j.genero] : [], j.estado ? [j.estado] : [], j.tamano ? [j.tamano] : [],
      j.version ? ["Versión " + j.version] : [])
    .map((c) => `<span class="chip">${esc(c)}</span>`).join("");
  const destacados = (j.destacados || []).map((d) => `<span class="chip">✔ ${esc(d)}</span>`).join("");
  const capturas = (j.capturas || [])
    .map((c) => `<a href="${esc(c)}" target="_blank" rel="noopener"><img loading="lazy" src="${esc(c)}" alt="Captura de ${esc(nombre)}"></a>`)
    .join("");
  const proximamente = j.proximamente
    ? `<p class="chip" style="color:#ffd58a;border-color:#7a5a1f">Próximamente</p>` : "";
  const cuerpo = `
<div class="hero">
  ${imagen ? `<div class="banner"><img src="${esc(imagen)}" alt="${esc(nombre)}"></div>` : ""}
  <span class="eyebrow">Hecho por Multiverse Gamer Studio</span>
  <h1 style="font-size:2.1rem;margin-top:8px">${esc(nombre)}</h1>
  <div style="margin-top:12px">${chips}</div>
  <p class="lead">${esc(largo)}</p>
  ${proximamente}
  <div class="cta">
    <a class="btn btn-p" href="${DESCARGA_APP}">⬇ Jugalo con Multiverse Gamer</a>
    <a class="btn btn-g" href="/juegos">Ver todos nuestros juegos</a>
  </div>
  <p style="color:var(--muted);font-size:.92rem;max-width:70ch">Instalá Multiverse Gamer, entrá a la pestaña
  <b>«⭐ Nuestros juegos»</b> y tocá <b>Instalar</b>. Viene incluido en tu suscripción y se actualiza solo.</p>
</div>
${destacados ? `<section><h2>Lo más destacado</h2><div>${destacados}</div></section>` : ""}
${capturas ? `<section><h2>Capturas</h2><div class="shots">${capturas}</div></section>` : ""}`;
  return marco({
    titulo: `${nombre} — Multiverse Gamer`,
    descripcion: desc || `${nombre}, un juego de Multiverse Gamer Studio.`,
    imagen,
    url: `${url.origin}/juegos/${slug(j)}`,
    cuerpo,
  });
}

function tarjetas(juegos) {
  return juegos.map((j) => `
<a class="card" href="/juegos/${slug(j)}">
  ${(j.imagen || j.banner) ? `<img loading="lazy" src="${esc(j.imagen || j.banner)}" alt="${esc(j.nombre)}" style="aspect-ratio:16/9;object-fit:cover;width:100%">` : ""}
  <div class="in"><h3>${esc(j.nombre)}</h3><p>${esc(j.descripcion || "")}</p></div>
</a>`).join("");
}

function paginaListado(juegos, url) {
  const cuerpo = `
<div class="hero"><span class="eyebrow">Multiverse Gamer Studio</span>
<h1 style="font-size:2rem;margin-top:8px">Nuestros juegos</h1>
<p class="lead">Los juegos que hacemos nosotros. Todos vienen incluidos en tu suscripción de Multiverse Gamer.</p></div>
${juegos.length ? `<div class="grid">${tarjetas(juegos)}</div>` : `<p class="lead">Muy pronto vas a ver acá nuestros juegos.</p>`}`;
  return marco({
    titulo: "Nuestros juegos — Multiverse Gamer",
    descripcion: "Los juegos hechos por Multiverse Gamer Studio, incluidos en tu suscripción.",
    imagen: juegos[0] ? (juegos[0].banner || juegos[0].imagen || "") : "",
    url: `${url.origin}/juegos`,
    cuerpo,
  });
}

function paginaNoEncontrado(juegos, url) {
  const cuerpo = `
<div class="hero"><h1 style="font-size:1.8rem">No encontramos ese juego</h1>
<p class="lead">Puede que haya cambiado de nombre. Estos son todos nuestros juegos:</p></div>
<div class="grid">${tarjetas(juegos)}</div>`;
  return marco({ titulo: "Juego no encontrado — Multiverse Gamer", descripcion: "", imagen: "", url: `${url.origin}/juegos`, cuerpo });
}
