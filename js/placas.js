/* Placas: tarjeta metálica de 55 × 85 mm con frase larga (varias líneas) y figura.
   Una sola función (contenido) genera la vista previa Y el archivo láser, así que son idénticos.
   Unidades: milímetros. El texto se convierte a trazados con opentype.js. */
const Placa = (() => {
  const LADO = { v:{ w:55, h:85 }, h:{ w:85, h:55 } };
  const MARGEN = 4, MAX_CHARS = 220;
  const COLORES = {
    "Rosa":   { a:"#d98b84", b:"#b8645e" },
    "Azul":   { a:"#3f6fc0", b:"#274f97" },
    "Dorada": { a:"#e0b040", b:"#bd8a1c" }
  };
  const TINTA_GRABADO = "#f3eee4";       // el láser descubre el aluminio claro
  const DISPOSICIONES = [
    { id:"fig-arriba", n:"Figura arriba · frase abajo" },
    { id:"fig-abajo",  n:"Figura abajo · frase arriba" },
    { id:"solo-frase", n:"Solo frase" },
    { id:"solo-fig",   n:"Solo figura" }
  ];
  const esc = s => String(s).replace(/[<>&"]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;" }[c]));
  const num = n => (+n).toFixed(3);

  const dims = est => LADO[est.orient === "h" ? "h" : "v"];

  /* Parte el texto en renglones que quepan en maxW (respeta los Enter del cliente) */
  function envolver(font, texto, size, maxW) {
    const out = [];
    texto.split(/\r?\n/).forEach(par => {
      const palabras = par.trim().split(/\s+/).filter(Boolean);
      if (!palabras.length) { out.push(""); return; }
      let lin = "";
      palabras.forEach(p => {
        const prueba = lin ? lin + " " + p : p;
        if (!lin || font.getAdvanceWidth(prueba, size) <= maxW) lin = prueba;
        else { out.push(lin); lin = p; }
      });
      out.push(lin);
    });
    while (out.length && !out[out.length - 1]) out.pop();
    return out;
  }

  /* Busca el tamaño de letra más grande (hasta tope) con el que la frase cabe en la caja */
  function ajustar(font, texto, caja, tope, factor) {
    const interlineado = 1.28;
    let lo = 1.5, hi = tope, mejor = null;
    const prueba = size => {
      const lineas = envolver(font, texto, size, caja.w);
      const anchoMax = Math.max(0, ...lineas.map(l => font.getAdvanceWidth(l, size)));
      const alto = size * interlineado * lineas.length;
      return { size, lineas, ok: anchoMax <= caja.w + 0.01 && alto <= caja.h };
    };
    const t = prueba(tope); if (t.ok) mejor = t;
    else {
      for (let i = 0; i < 18; i++) { const mid = (lo + hi) / 2, r = prueba(mid); if (r.ok) { mejor = r; lo = mid; } else hi = mid; }
      if (!mejor) mejor = prueba(lo);
    }
    const s = mejor.size * (factor || 1), lineas = envolver(font, texto, s, caja.w);
    return { size: s, lineas, paso: s * interlineado };
  }

  /* Zonas de la placa según la disposición */
  function zonas(est, tieneFig, tieneTxt) {
    const { w, h } = dims(est), iw = w - 2 * MARGEN, ih = h - 2 * MARGEN, x0 = -iw / 2, y0 = -ih / 2;
    const horiz = est.orient === "h";
    let disp = est.disp;
    if (!tieneFig) disp = "solo-frase"; else if (!tieneTxt) disp = "solo-fig";
    if (disp === "solo-frase") return { disp, txt:{ x:x0, y:y0, w:iw, h:ih } };
    if (disp === "solo-fig")   return { disp, fig:{ x:x0, y:y0, w:iw, h:ih } };
    if (horiz) {                          // horizontal: figura a un lado, frase al otro
      const fw = Math.min(ih, iw * 0.38), gap = 3, tw = iw - fw - gap;
      return disp === "fig-arriba"
        ? { disp, fig:{ x:x0, y:y0, w:fw, h:ih }, txt:{ x:x0 + fw + gap, y:y0, w:tw, h:ih } }
        : { disp, txt:{ x:x0, y:y0, w:tw, h:ih }, fig:{ x:x0 + tw + gap, y:y0, w:fw, h:ih } };
    }
    const fh = Math.min(iw * 0.95, ih * 0.42), gap = 3, th = ih - fh - gap;
    return disp === "fig-arriba"
      ? { disp, fig:{ x:x0, y:y0, w:iw, h:fh }, txt:{ x:x0, y:y0 + fh + gap, w:iw, h:th } }
      : { disp, txt:{ x:x0, y:y0, w:iw, h:th }, fig:{ x:x0, y:y0 + th + gap, w:iw, h:fh } };
  }

  async function textoSVG(est, caja, color, modo) {
    const f = FUENTES.find(x => x.id === est.fuenteId) || FUENTES[0];
    let t = (est.texto || "").slice(0, MAX_CHARS); if (f.mayus) t = t.toLocaleUpperCase("es");
    if (!t.trim()) return "";
    const font = await GeneradorSVG.cargarFuente(f);
    const tope = est.disp === "solo-frase" || !est.fig ? 9 : 7;            // mm de tamaño máximo (tipografía)
    const aj = ajustar(font, t, caja, tope * 2, est.tamTxt || 1);
    const alto = aj.paso * aj.lineas.length, y1 = caja.y + (caja.h - alto) / 2, cx = caja.x + caja.w / 2;
    let out = "";
    aj.lineas.forEach((lin, i) => {
      if (!lin) return;
      const base = y1 + aj.paso * i + aj.size * 0.5 + aj.paso * 0.28;       // línea base aproximada
      if (modo === "texto") {
        const fam = font.names.fontFamily ? (font.names.fontFamily.en || Object.values(font.names.fontFamily)[0]) : f.n;
        out += `<text x="${num(cx)}" y="${num(base)}" font-family="${esc(fam)}" font-size="${num(aj.size)}" text-anchor="middle" fill="${color}">${esc(lin)}</text>`;
      } else {
        const p0 = font.getPath(lin, 0, 0, aj.size), w = font.getAdvanceWidth(lin, aj.size);
        out += `<path transform="translate(${num(cx - w / 2)} ${num(base)})" fill="${color}" d="${p0.toPathData(2)}"/>`;
      }
    });
    return out;
  }

  async function figuraSVG(est, caja, color, laser) {
    const fig = Llavero.fig(est.fig); if (!fig) return "";
    const s = Math.min(caja.w, caja.h) * (est.tamFig || 1), cx = caja.x + caja.w / 2, cy = caja.y + caja.h / 2;
    if (fig.src) {
      const t = await (await fetch(fig.src)).text(), m = t.match(/viewBox="([^"]+)"/);
      if (!m) return "";
      const vb = m[1].trim().split(/[\s,]+/).map(Number), k = s / Math.max(vb[2], vb[3]);
      const inner = t.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>[\s\S]*$/, "").replace(/fill="#0{3,6}"/gi, `fill="${color}"`);
      return `<g transform="translate(${num(cx)} ${num(cy)}) scale(${num(k)}) translate(${num(-(vb[0] + vb[2] / 2))} ${num(-(vb[1] + vb[3] / 2))})" fill="${color}">${inner}</g>`;
    }
    const k = s / 100;
    return `<g transform="translate(${num(cx - 50 * k)} ${num(cy - 50 * k)}) scale(${num(k)})" fill="none" stroke="${color}" stroke-width="${num(1.2 / k * 0.35)}" stroke-linecap="round" stroke-linejoin="round">${fig.d}</g>`;
  }

  /* Contenido del grabado en mm, centrado en (0,0) */
  async function contenido(est, color, modo) {
    const tieneTxt = !!(est.texto || "").trim(), tieneFig = !!(est.fig && Llavero.fig(est.fig));
    const z = zonas(est, tieneFig, tieneTxt);
    let out = "";
    if (z.fig && tieneFig) out += await figuraSVG(est, z.fig, color);
    if (z.txt && tieneTxt) out += await textoSVG({ ...est, disp:z.disp, fig:tieneFig ? est.fig : "" }, z.txt, color, modo);
    return out;
  }

  /* Vista previa: placa de color con el grabado claro */
  async function vista(est, ref) {
    const { w, h } = dims(est), c = COLORES[colorDe(ref)] || COLORES.Dorada, id = "pg" + Math.random().toString(36).slice(2, 7);
    const grab = await contenido(est, TINTA_GRABADO, "trazado");
    const vacio = !grab ? `<text x="0" y="0" text-anchor="middle" font-size="4" fill="#fff" opacity=".55" font-family="f-quicksand">Escribe tu frase</text>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-w / 2 - 3} ${-h / 2 - 3} ${w + 6} ${h + 6}" class="placa-svg">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.a}"/><stop offset="1" stop-color="${c.b}"/></linearGradient>
      <filter id="${id}s" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0.6" dy="1" stdDeviation="1.2" flood-opacity=".35"/></filter></defs>
      <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3.2" fill="url(#${id})" filter="url(#${id}s)"/>
      <rect x="${-w / 2 + 1.2}" y="${-h / 2 + 1.2}" width="${w - 2.4}" height="${h - 2.4}" rx="2.4" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width=".3"/>
      ${grab}${vacio}</svg>`;
  }

  /* Archivo para el láser: tamaño real en mm, negro, texto en trazados (o texto editable) */
  async function svgLaser(est, modo = "trazado", conContorno = false) {
    const { w, h } = dims(est), g = await contenido(est, "#000", modo === "texto" ? "texto" : "trazado");
    const borde = conContorno ? `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="3.2" fill="none" stroke="#f00" stroke-width="0.1"/>` : "";
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="${-w / 2} ${-h / 2} ${w} ${h}">${borde}${g}</svg>`;
  }
  function descargar(est, modo, conContorno) {
    return svgLaser(est, modo, conContorno).then(svg => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([svg], { type:"image/svg+xml" }));
      a.download = `placa-${(est.texto || est.fig || "diseno").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().slice(0, 24).replace(/\W+/g, "_")}.svg`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  }
  /* Enlace "Ver diseño" para WhatsApp: lleva el diseño del cliente dentro de la dirección (no se guarda en ningún servidor) */
  const enc = d => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(d)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const dec = q => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(q.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))));
  const enlace = (i, lista) => { const e = estDeItem(i), x = Math.max(0, lista.findIndex(y => y.n === i.cfg.color));
    return location.origin + location.pathname + "#placa=" + enc({ c:x, t:e.texto, f:e.fuenteId, d:e.fig, s:e.disp, o:e.orient, tt:e.tamTxt, tf:e.tamFig }); };
  const colorDe = ref => (ref && ref.n && (ref.n.split("·")[1] || "").trim()) || ref || "Dorada";

  const DISP_N = { "fig-arriba":"figura arriba", "fig-abajo":"figura abajo", "solo-frase":"solo frase", "solo-fig":"solo figura" };
  /* Producto del carrito a partir del diseño (lo usa el configurador y el panel de pedidos del taller) */
  function armarItem(est, p, cantidad) {
    const f = FUENTES.find(x => x.id === est.fuenteId) || FUENTES[0], FIG = Llavero.figuras();
    return { tipo:"placa", ref:"tarjeta", producto:p.n + " (5,5 × 8,5 cm)", etiqueta:"Frase a grabar", grabar:(est.texto || "").trim(), fuente:f.n,
      diseno:(est.fig && FIG[est.fig] ? "Figura: " + FIG[est.fig].n + " · " : "") + DISP_N[est.disp] + " · " + (est.orient === "h" ? "horizontal" : "vertical"),
      img:p.img, cantidad:cantidad || 1, cfg:{ placa:true, color:p.n, dibujo:est.fig, fuenteId:est.fuenteId, disp:est.disp, orient:est.orient, tamTxt:est.tamTxt, tamFig:est.tamFig } };
  }

  /* ---- Configurador en pantalla ---- */
  let LISTA = [];
  function configurador(sel, lista) {
    LISTA = lista;
    const raiz = document.querySelector(sel); if (!raiz) return;
    let p = lista[0], cat = "Caballos", tok = 0;
    const est = { texto:"", fuenteId:"great-vibes", fig:"", disp:"fig-arriba", orient:"v", tamTxt:1, tamFig:1 };
    const FIG = Llavero.figuras(), CATS = Llavero.categorias();
    const thumb = f => f.src ? `<img src="${f.src}" alt="${f.n}" loading="lazy" decoding="async">` : `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${f.d}</svg>`;
    raiz.innerHTML = `<div class="cl pl">
      <div class="cl-vista"><div id="pl-lienzo" class="pl-lienzo"></div>
        <div class="cl-barra"><small>Tamaño real: <b id="pl-tam">5,5 × 8,5 cm</b> · aluminio anodizado</small></div>
      </div>
      <div class="cl-ctrl">
${Llavero.admin ? `<div class="adm"><b>Modo taller</b>
          <select id="pl-modo"><option value="trazado">Texto en trazados</option><option value="texto">Texto editable</option></select>
          <label><input type="checkbox" id="pl-borde"> contorno rojo</label>
          <button type="button" class="btn" id="pl-svg">⬇ SVG para láser</button>
          <button type="button" class="btn sec" id="pl-ttf">🔤 Esta tipografía</button>
          <a class="btn sec" href="assets/tipografias/tipografias-para-instalar.zip" download>📦 Todas (ZIP)</a></div>` : ""}
        <label class="cl-et">1. Elige el color de la placa</label>
        <div class="mods" id="pl-mods">${lista.map((x, i) => `<button type="button" class="mod${i ? "" : " sel"}" data-i="${i}"><img src="${x.img}" alt="" loading="lazy"><span>${x.n.replace("Tarjeta metálica · ", "")}</span></button>`).join("")}</div>
        <label class="cl-et">2. Escribe tu frase o dedicatoria <small id="pl-cont">(0/${MAX_CHARS})</small></label>
        <textarea id="pl-txt" rows="4" maxlength="${MAX_CHARS}" placeholder="Ej: Para mamá, con todo mi amor.&#10;Gracias por cada día."></textarea>
        <select id="pl-fuente" aria-label="Tipografía">${FUENTES.map(f => `<option value="${f.id}" style="font-family:'f-${f.id}'">${f.n}</option>`).join("")}</select>
        <label class="cl-et">3. Elige un dibujo <small>(opcional)</small></label>
        <div class="tabs" id="pl-tabs">${Object.keys(CATS).map(c => `<button type="button" class="tab${c === cat ? " sel" : ""}" data-c="${c}">${c}</button>`).join("")}</div>
        <div class="fgrid" id="pl-fig"></div>
        <label class="cl-et">4. Distribución</label>
        <select id="pl-disp">${DISPOSICIONES.map(d => `<option value="${d.id}">${d.n}</option>`).join("")}</select>
        <div class="pl-fila"><label class="ck"><input type="radio" name="pl-or" value="v" checked> Vertical 5,5 × 8,5</label><label class="ck"><input type="radio" name="pl-or" value="h"> Horizontal 8,5 × 5,5</label></div>
        <label>Tamaño de la letra<input type="range" id="pl-rt" min="0.5" max="1.2" step="0.05" value="1"></label>
        <label>Tamaño del dibujo<input type="range" id="pl-rf" min="0.5" max="1.1" step="0.05" value="1"></label>
        <div class="cl-add"><div><b id="pl-precio"></b><small id="pl-desc"></small></div><button class="btn" id="pl-agregar" type="button">Agregar al carrito</button></div>
      </div></div>`;
    const $ = s => raiz.querySelector(s);
    const pintar = async () => {
      const mi = ++tok, f = FUENTES.find(x => x.id === est.fuenteId);
      try { await document.fonts.load(`40px "f-${f.id}"`); } catch (e) {}
      const svg = await vista(est, p);
      if (mi === tok) $("#pl-lienzo").innerHTML = svg;
    };
    const figs = () => { $("#pl-fig").innerHTML = `<button type="button" class="ft${est.fig ? "" : " sel"}" data-f="" title="Sin dibujo"><b>Aa</b><span>Solo frase</span></button>` +
      CATS[cat].map(([id]) => `<button type="button" class="ft${est.fig === id ? " sel" : ""}" data-f="${id}" title="${FIG[id].n}">${thumb(FIG[id])}<span>${FIG[id].n}</span></button>`).join(""); };
    const info = () => { $("#pl-precio").textContent = PRECIOS.formato(PRECIOS.precioUnitario({ tipo:"placa", ref:p.ref })); $("#pl-desc").textContent = p.n; };
    const tam = () => { $("#pl-tam").textContent = est.orient === "h" ? "8,5 × 5,5 cm (horizontal)" : "5,5 × 8,5 cm (vertical)"; };
    figs(); info(); pintar();
    const q = (location.hash.match(/^#placa=([A-Za-z0-9_-]+)/) || [])[1]; // diseño en fragmento; no se envía en la solicitud HTTP
    if (q) try {
      const d = dec(q); p = lista[d.c] || lista[0];
      Object.assign(est, { texto:String(d.t || "").slice(0, MAX_CHARS), fuenteId:FUENTES.some(f => f.id === d.f) ? d.f : "great-vibes", fig:FIG[d.d] ? d.d : "",
        disp:DISPOSICIONES.some(x => x.id === d.s) ? d.s : "fig-arriba", orient:d.o === "h" ? "h" : "v", tamTxt:+d.tt || 1, tamFig:+d.tf || 1 });
      $("#pl-txt").value = est.texto; $("#pl-fuente").value = est.fuenteId; $("#pl-disp").value = est.disp; $("#pl-rt").value = est.tamTxt; $("#pl-rf").value = est.tamFig;
      raiz.querySelector(`input[name="pl-or"][value="${est.orient}"]`).checked = true; $("#pl-txt").style.fontFamily = `'f-${est.fuenteId}'`;
      if (est.fig) cat = FIG[est.fig].c;
      raiz.querySelectorAll(".mod").forEach((b, i) => b.classList.toggle("sel", lista[i] === p)); raiz.querySelectorAll(".tab").forEach(b => b.classList.toggle("sel", b.dataset.c === cat));
      figs(); info(); tam(); pintar(); setTimeout(() => { window.ver && ver("llaveros"); pintar(); }, 0);
    } catch (e) {}
    raiz.addEventListener("click", e => {
      const mo = e.target.closest(".mod"), ta = e.target.closest(".tab"), ft = e.target.closest(".ft");
      if (mo) { p = lista[mo.dataset.i]; raiz.querySelectorAll(".mod").forEach(x => x.classList.toggle("sel", x === mo)); info(); pintar(); }
      else if (ta) { cat = ta.dataset.c; raiz.querySelectorAll(".tab").forEach(x => x.classList.toggle("sel", x === ta)); figs(); }
      else if (ft) { est.fig = ft.dataset.f; if (est.fig && est.disp === "solo-frase") { est.disp = "fig-arriba"; $("#pl-disp").value = est.disp; } figs(); pintar(); }
    });
    raiz.addEventListener("input", e => {
      est.texto = $("#pl-txt").value; est.fuenteId = $("#pl-fuente").value; est.disp = $("#pl-disp").value;
      est.tamTxt = +$("#pl-rt").value; est.tamFig = +$("#pl-rf").value;
      const r = raiz.querySelector('input[name="pl-or"]:checked'); est.orient = r ? r.value : "v";
      $("#pl-txt").style.fontFamily = `'f-${est.fuenteId}'`; $("#pl-cont").textContent = `(${est.texto.length}/${MAX_CHARS})`; tam(); pintar();
    });
    if (Llavero.admin) {
      $("#pl-svg").onclick = () => { if (est.texto.trim() || est.fig) descargar(est, $("#pl-modo").value, $("#pl-borde").checked); };
      $("#pl-ttf").onclick = () => { const id = $("#pl-fuente").value, a = document.createElement("a"); a.href = `assets/tipografias/instalar/${id}.ttf`; a.download = id + ".ttf"; document.body.appendChild(a); a.click(); a.remove(); };
    }
    $("#pl-agregar").onclick = () => {
      if (!est.texto.trim() && !est.fig) { $("#pl-txt").focus(); $("#pl-txt").classList.add("falta"); setTimeout(() => $("#pl-txt").classList.remove("falta"), 900); return; }
      Carrito.agregar(armarItem(est, p));
    };
  }
  function estDeItem(i) { return estDeItem0(i); }
  const estDeItem0 = i => ({ texto:i.grabar || "", fuenteId:i.cfg.fuenteId, fig:i.cfg.dibujo || "", disp:i.cfg.disp || "fig-arriba", orient:i.cfg.orient || "v", tamTxt:i.cfg.tamTxt || 1, tamFig:i.cfg.tamFig || 1 });
  return { configurador, vista, svgLaser, descargar, estDeItem, dims, armarItem, lista:() => LISTA, enlace:i => enlace(i, LISTA) };
})();
