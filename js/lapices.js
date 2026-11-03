/* Lápices personalizados: nombre a lo largo de la cara del lápiz + adornos (trébol, corazón, estrella...).
   Una sola función (contenido) genera la vista previa Y el archivo láser, así que son idénticos.
   Unidades: milímetros. El texto se convierte a trazados con opentype.js (sin fuentes externas).
   MEDIDAS ESTIMADAS: ajuste T (largo total), s (ancho de UNA cara), x1/x2 (zona grabable) en MODELOS al medir sus lápices reales. */
const Lapiz = (() => {
  const EX = n => `assets/productos/lapiz-ej${n}.jpg`;
  const LW = 0.2;                                   // grosor de las líneas finas (mm)
  const COLORES = [["Verde","#5ea43a"],["Rosa","#f0a7c3"],["Azul","#86b4e3"],["Lila","#b69ae0"],["Menta","#a9dcc0"],["Turquesa","#4db3b1"],["Amarillo","#f2cc66"],["Rojo","#d9473f"]].map(([n, h]) => ({ n, h }));
  const MODELOS = [
    { id:"grafito", n:"Grafito con borrador", img:EX(1), T:177, s:4,   borr:true,  x0:22, x1:34, x2:146,
      colores:[["Amarillo","#f0a22e"],["Rojo","#cf3f38"],["Azul","#3c6fb5"],["Verde","#4f9a46"],["Negro","#2d2b2a"]].map(([n, h]) => ({ n, h })) },
    { id:"colores", n:"Colores estándar",     img:EX(4), T:176, s:4.4, borr:false, x0:0,  x1:12, x2:148, colores:COLORES },
    { id:"jumbo",   n:"Colores jumbo (grueso)",img:EX(6), T:178, s:6,   borr:false, x0:0,  x1:12, x2:148, colores:COLORES }
  ];
  /* Adornos en caja 100×100. m:"f" silueta rellena · m:"l" línea fina */
  const ala = '<path d="M52 46C58 22 84 8 92 20C98 32 74 46 52 50ZM52 52C72 52 90 62 82 78C74 90 56 78 52 62Z"/>';
  const ORN = {
    trebol:  { n:"Trébol", m:"f", d:'<circle cx="36" cy="34" r="19"/><circle cx="64" cy="34" r="19"/><circle cx="36" cy="62" r="19"/><circle cx="64" cy="62" r="19"/><path d="M48 60Q50 82 40 94L47 96Q58 84 54 60Z"/>' },
    corazon: { n:"Corazón", m:"f", d:'<path d="M50 90C10 60 6 30 26 16 40 8 50 20 50 28 50 20 60 8 74 16 94 30 90 60 50 90Z"/>' },
    estrella:{ n:"Estrella", m:"f", d:'<path d="M50 6 62 38 95 38 68 58 78 92 50 72 22 92 32 58 5 38 38 38Z"/>' },
    flor:    { n:"Flor", m:"l", d:[0, 1, 2, 3, 4].map(i => `<ellipse cx="50" cy="27" rx="13" ry="20" transform="rotate(${i * 72} 50 50)"/>`).join("") + '<circle cx="50" cy="50" r="9"/>' },
    mariposa:{ n:"Mariposa", m:"f", d:`<ellipse cx="50" cy="52" rx="3.5" ry="25"/>${ala}<g transform="matrix(-1 0 0 1 100 0)">${ala}</g>` },
    hoja:    { n:"Hoja", m:"f", d:'<path d="M14 88C6 36 40 8 90 10 92 60 62 92 14 88Z"/>' },
    luna:    { n:"Luna", m:"f", d:'<path d="M60 10A40 40 0 1 0 90 66A32 32 0 1 1 60 10Z"/>' },
    huella:  { n:"Huella", m:"f", d:'<path d="M50 52C36 52 24 66 28 78S42 86 50 80 66 86 72 78C76 66 64 52 50 52Z"/><ellipse cx="22" cy="46" rx="7" ry="10" transform="rotate(-25 22 46)"/><ellipse cx="38" cy="28" rx="7" ry="11" transform="rotate(-8 38 28)"/><ellipse cx="62" cy="28" rx="7" ry="11" transform="rotate(8 62 28)"/><ellipse cx="78" cy="46" rx="7" ry="10" transform="rotate(25 78 46)"/>' },
    nota:    { n:"Nota musical", m:"f", d:'<path d="M40 14 82 6V62H72V26L50 31V76H40Z"/><ellipse cx="32" cy="76" rx="14" ry="10"/><ellipse cx="64" cy="64" rx="14" ry="10"/>' },
    libro:   { n:"Libro", m:"l", d:'<path d="M50 24Q30 14 8 22V80Q30 72 50 84Q70 72 92 80V22Q70 14 50 24ZM50 24V84"/>' },
    balon:   { n:"Balón", m:"l", d:'<circle cx="50" cy="50" r="40"/><path d="M50 34 65 45 59 63H41L35 45ZM50 34V10M65 45 88 38M59 63 72 82M41 63 28 82M35 45 12 38"/>' },
    rayo:    { n:"Rayo", m:"f", d:'<path d="M58 4 22 54H46L38 96 78 40H54Z"/>' }
  };
  const SEPS = { onda:"Ondas", ondas3:"Tres ondas", linea:"Línea fina", puntos:"Puntitos", ninguno:"Ninguno" };
  const DISPOS = { centro:"Centrado", izquierda:"Pegado al borrador", repetido:"Nombre repetido" };
  const num = n => (+n).toFixed(3);
  const esc = s => String(s).replace(/[<>&"]/g, c => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;", '"':"&quot;" }[c]));
  const modelo = id => MODELOS.find(m => m.id === id) || MODELOS[1];
  const colorDe = (m, n) => m.colores.find(c => c.n === n) || m.colores[0];
  const lum = h => (0.299 * parseInt(h.slice(1, 3), 16) + 0.587 * parseInt(h.slice(3, 5), 16) + 0.114 * parseInt(h.slice(5, 7), 16)) / 255;
  const oscuro = (h, t) => `rgb(${[1, 3, 5].map(i => Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - t)))})`;
  const tintaDe = h => lum(h) > 0.62 ? "#8f5f26" : "#e6c58e";      // el láser descubre la madera
  const fuenteDe = id => FUENTES.find(f => f.id === id) || FUENTES[1];

  function orn(id, cx, cy, h) {
    const o = ORN[id]; if (!o) return { r:"", l:"" };
    const k = h / 100, g = `translate(${num(cx - 50 * k)} ${num(cy - 50 * k)}) scale(${num(k)})`;
    return o.m === "f" ? { r:`<g transform="${g}">${o.d}</g>`, l:"" } : { r:"", l:`<g transform="${g}" stroke-width="${num(LW / k)}">${o.d}</g>` };
  }
  const onda = (x0, w, y, amp, lam) => { let d = ""; for (let x = 0; x <= w + 0.01; x += 0.25) d += (x ? "L" : "M") + num(x0 + x) + " " + num(y + amp * Math.sin(2 * Math.PI * x / lam)); return d; };
  function sep(t, cx, w, h) {
    const x0 = cx - w / 2;
    if (t === "onda")   return { r:"", l:`<path d="${onda(x0, w, 0, h * .13, h * .9)}"/>` };
    if (t === "ondas3") return { r:"", l:[-1, 0, 1].map(j => `<path d="${onda(x0 + w * .2, w * .6, j * h * .22, h * .07, h * .7)}"/>`).join("") };
    if (t === "linea")  return { r:`<circle cx="${num(x0)}" cy="0" r=".3"/><circle cx="${num(x0 + w)}" cy="0" r=".3"/>`, l:`<path d="M${num(x0)} 0H${num(x0 + w)}"/>` };
    if (t === "puntos") return { r:[-1, 0, 1].map(j => `<circle cx="${num(cx + j * h * .28)}" cy="0" r="${num(h * .07)}"/>`).join(""), l:"" };
    return { r:"", l:"" };
  }

  /* Grabado en coordenadas de la cara: x de 0 a L, y centrada en 0 */
  async function contenido(est) {
    const m = modelo(est.modelo), s = m.s, L = m.x2 - m.x1, f = fuenteDe(est.fuenteId), font = await GeneradorSVG.cargarFuente(f);
    let nombre = String(est.nombre || "").trim().slice(0, 28); if (f.mayus) nombre = nombre.toLocaleUpperCase("es");
    const ref = font.getPath("Hg", 0, 0, 100).getBoundingBox(), capB = font.getPath("H", 0, 0, 100).getBoundingBox();
    const base = (s * 0.72 * (est.tam || 1)) / (ref.y2 - ref.y1) * 100;          // "Hg" ocupa el 72 % de la cara
    const nat = nombre ? font.getPath(nombre, 0, 0, base).getBoundingBox() : null, wN = nat ? nat.x2 - nat.x1 : 0;
    const oh = s * 0.62, gap = s * 0.55, sw = s * 3.2;
    const tieneO1 = !!ORN[est.o1], tieneO2 = !!ORN[est.o2], tieneS = !!est.sep && est.sep !== "ninguno";
    let r = "", l = "", bloque = [0, L], kFinal = 1;
    const mas = o => { r += o.r; l += o.l; };
    const nombreEn = (cx, k) => { if (!nombre) return; const size = base * k, p = font.getPath(nombre, 0, 0, size), b = p.getBoundingBox();
      r += `<path transform="translate(${num(cx - (b.x1 + b.x2) / 2)} ${num(-(ref.y1 + ref.y2) / 2 * size / 100)})" d="${p.toPathData(2)}"/>`; };

    if (est.layout === "repetido") {
      const n = Math.max(1, Math.min(4, Math.round(est.rep) || 2)), slot = L / n, avail = slot - 2 * gap - (n > 1 ? oh : 0);
      kFinal = wN ? Math.min(1, avail / wN) : 1;
      for (let i = 0; i < n; i++) { nombreEn((i + .5) * slot, kFinal); if (i) mas(tieneO1 ? orn(est.o1, i * slot, 0, oh) : { r:`<circle cx="${num(i * slot)}" cy="0" r=".32"/>`, l:"" }); }
      bloque = [0, slot];                                    // el zoom enseña solo la primera repetición
    } else {
      const variantes = [{ o:1, s:1 }, { o:1, s:0 }, { o:0, s:0 }];
      let elegido = null;
      for (let v = 0; v < variantes.length && !elegido; v++) {
        const V = variantes[v], izq = est.layout === "izquierda";
        const seq = [];
        if (V.o && tieneO1) seq.push({ t:"o1", w:oh });
        if (V.s && tieneS && !izq) seq.push({ t:"s", w:sw });
        seq.push({ t:"n", w:wN });
        if (V.s && tieneS) seq.push({ t:"s", w:sw });
        if (V.o && tieneO2) seq.push({ t:"o2", w:oh });
        const fijo = seq.filter(q => q.t !== "n").reduce((a, q) => a + q.w, 0) + gap * (seq.length - 1) + 2 * gap;
        const k = wN ? Math.min(1, (L - fijo) / wN) : 1;
        if (k >= 0.7 || v === variantes.length - 1) elegido = { seq, k: Math.max(0.2, k) };
      }
      const { seq, k } = elegido; kFinal = k; seq.find(q => q.t === "n").w = wN * k;
      const total = seq.reduce((a, q) => a + q.w, 0) + gap * (seq.length - 1);
      let x = (est.layout === "izquierda" ? gap : (L - total) / 2) + (+est.dx || 0);
      x = Math.max(0, Math.min(L - total, x)); bloque = [x, x + total];
      seq.forEach(q => { const c = x + q.w / 2;
        if (q.t === "n") nombreEn(c, k); else if (q.t === "s") mas(sep(est.sep, c, q.w, s)); else mas(orn(q.t === "o1" ? est.o1 : est.o2, c, 0, oh));
        x += q.w + gap; });
    }
    if (est.sentido === "borrador") {                                  // texto que se lee hacia el borrador
      const g = c => c ? `<g transform="rotate(180 ${num(L / 2)} 0)">${c}</g>` : "";
      r = g(r); l = g(l); bloque = [L - bloque[1], L - bloque[0]];
    }
    const capMM = (capB.y2 - capB.y1) / 100 * base * kFinal;
    return { r, l, bloque, L, s, capMM: nombre ? capMM : 0 };
  }

  function cuerpo(m, hex, id) {
    const s = m.s, T = m.T, xc = T - 22, dk = oscuro(hex, .22);
    let o = `<defs><linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5f5f5"/><stop offset=".35" stop-color="#b9bcc0"/><stop offset=".6" stop-color="#f0f0f0"/><stop offset="1" stop-color="#8d9094"/></linearGradient></defs>`;
    if (m.borr) { o += `<rect x="0" y="${num(-s * .9)}" width="10" height="${num(s * 1.8)}" rx="1.4" fill="#e7a0a6"/><rect x="9" y="${num(-s * .95)}" width="${m.x0 - 9}" height="${num(s * 1.9)}" fill="url(#${id}m)"/>`;
      [12, 14.5, 17, 19.5].forEach(x => o += `<path d="M${x} ${num(-s * .95)}V${num(s * .95)}" stroke="#7d8084" stroke-width=".25"/>`); }
    o += `<path d="M${xc - 3} ${-s}L${T - 4} ${num(-s * .2)}V${num(s * .2)}L${xc - 3} ${s}Z" fill="#e8c898"/><path d="M${T - 4} ${num(-s * .2)}L${T} 0L${T - 4} ${num(s * .2)}Z" fill="${m.borr ? "#3b3b3b" : dk}"/>`;
    let w = "", n = 6, dy = 2 * s / n; for (let i = 0; i < n; i++) w += `Q${num(xc + 2.4)} ${num(-s + i * dy + dy / 2)} ${num(xc)} ${num(-s + (i + 1) * dy)}`;
    o += `<path d="M${m.x0} ${-s}H${xc}${w}H${m.x0}Z" fill="${hex}"/>`;
    o += `<rect x="${m.x0}" y="${-s}" width="${xc - m.x0}" height="${num(s / 2)}" fill="#000" opacity=".17"/><rect x="${m.x0}" y="${num(s / 2)}" width="${xc - m.x0}" height="${num(s / 2)}" fill="#000" opacity=".08"/>`;
    o += `<path d="M${m.x0} ${num(-s / 2)}H${xc}M${m.x0} ${num(s / 2)}H${xc}" stroke="#000" stroke-width=".18" opacity=".22"/>`;
    return o;
  }

  async function vista(est, modo) {                                       // modo: "zoom" | "completo"
    const m = modelo(est.modelo), col = colorDe(m, est.color), c = await contenido(est), tinta = tintaDe(col.h), id = "lp" + Math.random().toString(36).slice(2, 7);
    const grab = `<g transform="translate(${m.x1} 0)"><g fill="${tinta}" stroke="none">${c.r}</g><g fill="none" stroke="${tinta}" stroke-width="${LW}" stroke-linecap="round" stroke-linejoin="round">${c.l}</g></g>`;
    const cu = cuerpo(m, col.h, id);
    if (modo === "completo") return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 ${num(-m.s * 1.6)} ${m.T + 8} ${num(m.s * 3.2)}" class="lp-svg">${cu}${grab}</svg>`;
    const cx = m.x1 + (c.bloque[0] + c.bloque[1]) / 2, zw = Math.min(m.x2 - m.x1 + 10, Math.max(48, c.bloque[1] - c.bloque[0] + 14)), zh = zw * 0.3, x0 = cx - zw / 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${num(x0)} ${num(-zh / 2)} ${num(zw)} ${num(zh)}" class="lp-svg"><rect x="${num(x0 - 5)}" y="${num(-zh / 2 - 5)}" width="${num(zw + 10)}" height="${num(zh + 10)}" fill="#ece3d3"/>${cu}${grab}</svg>`;
  }

  /* Archivo para el láser: solo la cara grabable, tamaño real en mm */
  async function svgLaser(est, conContorno) {
    const m = modelo(est.modelo), c = await contenido(est), L = m.x2 - m.x1, s = m.s;
    const borde = conContorno ? `<rect x="0" y="${-s / 2}" width="${L}" height="${s}" fill="none" stroke="#0057ff" stroke-width="0.1"/>` : "";
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${num(L)}mm" height="${num(s)}mm" viewBox="0 ${num(-s / 2)} ${num(L)} ${num(s)}"><title>Lápiz ${esc(m.n)} - ${esc(est.nombre || "")}</title>` +
      `<desc>Cara grabable ${num(L)} x ${num(s)} mm. ${est.sentido === "borrador" ? "Texto se lee hacia el borrador." : "Extremo izquierdo = lado del borrador; derecho = punta."} Azul = referencia, no grabar.</desc>${borde}` +
      `<g id="grabado-relleno" fill="#000" stroke="none">${c.r}</g><g id="grabado-lineal" fill="none" stroke="#000" stroke-width="${LW}" stroke-linecap="round" stroke-linejoin="round">${c.l}</g></svg>`;
  }
  function descargar(est, conContorno) {
    return svgLaser(est, conContorno).then(svg => {
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([svg], { type:"image/svg+xml" }));
      a.download = `lapiz-${(est.nombre || "diseno").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().slice(0, 24).replace(/\W+/g, "_")}.svg`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  }

  const ESTADO0 = { modelo:"colores", color:"Verde", nombre:"", fuenteId:"dancing-script", o1:"trebol", o2:"trebol", sep:"onda", layout:"centro", rep:3, tam:1, sentido:"punta", dx:0 };
  function armarItem(est, cantidad) {
    const m = modelo(est.modelo), col = colorDe(m, est.color), f = fuenteDe(est.fuenteId), on = id => (ORN[id] ? ORN[id].n : "sin adorno");
    return { tipo:"lapiz", ref:m.id, producto:"Lápiz · " + m.n, modelo:"Color " + col.n, etiqueta:"Nombre a grabar", grabar:String(est.nombre || "").trim(), fuente:f.n,
      diseno:`${DISPOS[est.layout] || "Centrado"}${est.layout === "repetido" ? " ×" + est.rep : ""} · adornos: ${on(est.o1)} / ${on(est.o2)} · separador: ${SEPS[est.sep] || "ninguno"} · se lee hacia ${est.sentido === "borrador" ? "el borrador" : "la punta"}`,
      img:m.img, cantidad:cantidad || 1, cfg:{ lapiz:true, modelo:m.id, color:col.n, fuenteId:f.id, o1:est.o1, o2:est.o2, sep:est.sep, layout:est.layout, rep:est.rep, tam:est.tam, sentido:est.sentido, dx:est.dx } };
  }
  const estDeItem = i => ({ ...ESTADO0, ...(i.cfg || {}), nombre:i.grabar || "" });

  function configurador(sel) {
    const raiz = document.querySelector(sel); if (!raiz) return;
    const est = { ...ESTADO0 }; let tok = 0;
    const adornos = (k) => `<button type="button" class="ft${est[k] ? "" : " sel"}" data-k="${k}" data-o="" title="Sin adorno"><b>✕</b><span>Ninguno</span></button>` +
      Object.entries(ORN).map(([id, o]) => `<button type="button" class="ft${est[k] === id ? " sel" : ""}" data-k="${k}" data-o="${id}" title="${o.n}"><svg viewBox="0 0 100 100" ${o.m === "f" ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"'}>${o.d}</svg><span>${o.n}</span></button>`).join("");
    raiz.innerHTML = `<div class="cl lp">
      <div class="cl-vista">
        <div id="lp-zoom" class="lp-lienzo"></div>
        <div id="lp-completo" class="lp-lienzo fino"></div>
        <div class="cl-barra"><small id="lp-info"></small></div>
        <details class="lp-ej"><summary>📸 Ver ejemplos de grabado en lápices</summary><div class="lp-ej-g">${[1, 2, 3, 4, 5, 6].map(n => `<img src="${EX(n)}" alt="Ejemplo de lápiz grabado ${n}" loading="lazy">`).join("")}</div><small>Fotos de referencia</small></details>
      </div>
      <div class="cl-ctrl">
${Llavero.admin ? `<div class="adm"><b>Modo taller</b><label><input type="checkbox" id="lp-borde"> referencia azul</label><button type="button" class="btn" id="lp-svg">⬇ SVG para láser</button></div>` : ""}
        <label class="cl-et">1. Elige el tipo de lápiz</label>
        <div class="mods" id="lp-mods">${MODELOS.map(m => `<button type="button" class="mod${m.id === est.modelo ? " sel" : ""}" data-m="${m.id}"><img src="${m.img}" alt="" loading="lazy"><span>${m.n}</span></button>`).join("")}</div>
        <label class="cl-et">2. Color del lápiz</label><div class="sws" id="lp-sw"></div>
        <label class="cl-et">3. Escribe el nombre</label>
        <input id="lp-nombre" type="text" maxlength="28" placeholder="Ej: Mateo Pérez" autocomplete="off">
        <select id="lp-fuente" aria-label="Tipografía">${FUENTES.map(f => `<option value="${f.id}" style="font-family:'f-${f.id}'"${f.id === est.fuenteId ? " selected" : ""}>${f.n}</option>`).join("")}</select>
        <label class="cl-et">4. Adorno del lado del borrador</label><div class="fgrid" id="lp-o1">${adornos("o1")}</div>
        <label class="cl-et">5. Adorno del lado de la punta</label><div class="fgrid" id="lp-o2">${adornos("o2")}</div>
        <label class="cl-et">6. Distribución</label>
        <select id="lp-layout">${Object.entries(DISPOS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select>
        <select id="lp-sep" aria-label="Separador">${Object.entries(SEPS).map(([k, v]) => `<option value="${k}"${k === est.sep ? " selected" : ""}>Separador: ${v}</option>`).join("")}</select>
        <label>Veces que se repite el nombre <small>(solo en «Nombre repetido»)</small><input type="range" id="lp-rep" min="2" max="4" step="1" value="${est.rep}"></label>
        <label>Tamaño de la letra<input type="range" id="lp-tam" min="0.6" max="1.15" step="0.05" value="1"></label>
        <label>Mover a lo largo del lápiz<input type="range" id="lp-dx" min="-25" max="25" step="1" value="0"></label>
        <select id="lp-sentido" aria-label="Sentido de lectura"><option value="punta">Se lee hacia la punta (recomendado)</option><option value="borrador">Se lee hacia el borrador</option></select>
        <div class="cl-add"><div><b id="lp-precio"></b><small id="lp-desc"></small></div><button class="btn sec" id="lp-azar" type="button">🎲</button><button class="btn" id="lp-agregar" type="button">Agregar al carrito</button></div>
      </div></div>`;
    const $ = s => raiz.querySelector(s);
    const swatches = () => { const m = modelo(est.modelo); if (!m.colores.some(c => c.n === est.color)) est.color = m.colores[0].n;
      $("#lp-sw").innerHTML = m.colores.map(c => `<button type="button" class="sw${c.n === est.color ? " sel" : ""}" data-c="${c.n}" title="${c.n}" style="background:${c.h}"></button>`).join(""); };
    const info = () => { const m = modelo(est.modelo); $("#lp-precio").textContent = PRECIOS.formato(PRECIOS.precioUnitario({ tipo:"lapiz", ref:est.modelo })); $("#lp-desc").textContent = `${m.n} · color ${est.color}`; };
    const pintar = async () => {
      const mi = ++tok, e = { ...est, nombre: est.nombre.trim() ? est.nombre : "Tu nombre" };
      const [z, c, k] = await Promise.all([vista(e, "zoom"), vista(e, "completo"), contenido(e)]);
      if (mi !== tok) return; $("#lp-zoom").innerHTML = z; $("#lp-completo").innerHTML = c;
      const m = modelo(est.modelo), cap = k.capMM, aviso = cap && cap < 1.5 ? " ⚠ Letra muy pequeña: usa un nombre más corto o menos adornos." : "";
      $("#lp-info").textContent = `Cara grabable: ${m.x2 - m.x1} × ${m.s} mm (medidas estimadas) · letra mayúscula ≈ ${cap.toFixed(1).replace(".", ",")} mm.${aviso}`;
    };
    const todo = () => { swatches(); info(); pintar(); };
    raiz.addEventListener("click", e => {
      const mo = e.target.closest(".mod"), sw = e.target.closest(".sw"), ft = e.target.closest(".ft");
      if (mo) { est.modelo = mo.dataset.m; raiz.querySelectorAll(".mod").forEach(x => x.classList.toggle("sel", x === mo)); todo(); }
      else if (sw) { est.color = sw.dataset.c; swatches(); info(); pintar(); }
      else if (ft) { est[ft.dataset.k] = ft.dataset.o; $("#" + "lp-" + ft.dataset.k).querySelectorAll(".ft").forEach(x => x.classList.toggle("sel", x === ft)); pintar(); }
    });
    raiz.addEventListener("input", () => {
      est.nombre = $("#lp-nombre").value; est.fuenteId = $("#lp-fuente").value; est.layout = $("#lp-layout").value; est.sep = $("#lp-sep").value;
      est.rep = +$("#lp-rep").value; est.tam = +$("#lp-tam").value; est.dx = +$("#lp-dx").value; est.sentido = $("#lp-sentido").value;
      $("#lp-nombre").style.fontFamily = `'f-${est.fuenteId}'`; pintar();
    });
    $("#lp-azar").onclick = () => { const A = a => a[Math.floor(Math.random() * a.length)], ids = Object.keys(ORN), m = modelo(est.modelo);
      est.color = A(m.colores).n; est.fuenteId = A(FUENTES).id; est.o1 = A(ids); est.o2 = Math.random() < .6 ? est.o1 : A(ids); est.sep = A(Object.keys(SEPS)); est.layout = A(Object.keys(DISPOS));
      $("#lp-fuente").value = est.fuenteId; $("#lp-sep").value = est.sep; $("#lp-layout").value = est.layout;
      ["o1", "o2"].forEach(k => $("#lp-" + k).innerHTML = adornos(k)); $("#lp-nombre").style.fontFamily = `'f-${est.fuenteId}'`; todo(); };
    if (Llavero.admin) $("#lp-svg").onclick = () => { if (est.nombre.trim()) descargar(est, $("#lp-borde").checked); else $("#lp-nombre").focus(); };
    $("#lp-agregar").onclick = () => {
      if (!est.nombre.trim()) { const i = $("#lp-nombre"); i.focus(); i.classList.add("falta"); setTimeout(() => i.classList.remove("falta"), 900); return; }
      Carrito.agregar(armarItem(est));
    };
    $("#lp-nombre").style.fontFamily = `'f-${est.fuenteId}'`; todo();
  }
  return { configurador, armarItem, estDeItem, descargar, svgLaser, vistaZoom: e => vista({ ...e, nombre: e.nombre || "Tu nombre" }, "zoom"), MODELOS, ORN };
})();
