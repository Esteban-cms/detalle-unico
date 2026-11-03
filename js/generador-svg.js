/* Generador SVG: UNA sola función produce el archivo técnico y la vista previa
   (la vista previa solo añade fondo/color), por eso ambos son idénticos en geometría.
   Unidades: milímetros. Texto convertido a trazados con opentype.js (sin fuentes externas). */
const GeneradorSVG = (() => {
  const W = 170, H = 240;               // portada de cuaderno (mm) — editable
  const cache = {};
  const f2 = n => (+n).toFixed(2);

  async function cargarFuente(f) {
    if (!cache[f.id]) cache[f.id] = fetch(f.archivo).then(r => r.arrayBuffer()).then(b => opentype.parse(b));
    return cache[f.id];
  }

  // Texto centrado por su caja visual; se reduce si excede maxW. Devuelve <path>.
  function texto(font, txt, cx, cy, size, maxW, contorno) {
    if (!txt.trim()) return "";
    let p = font.getPath(txt, 0, 0, size), b = p.getBoundingBox();
    if (b.x2 - b.x1 > maxW) { size *= maxW / (b.x2 - b.x1); p = font.getPath(txt, 0, 0, size); b = p.getBoundingBox(); }
    p = font.getPath(txt, cx - (b.x1 + b.x2) / 2, cy - (b.y1 + b.y2) / 2, size);
    const d = p.toPathData(2);
    return contorno ? `<path class="l" d="${d}" stroke-width="0.25"/>` : `<path class="r" d="${d}"/>`;
  }

  const LAYOUTS = {
    clasica:   { n:"Clásica",           asig:[38, 6.5],  ico:[105, 85],  nom:[190, 1.0] },
    nombre:    { n:"Nombre protagonista",asig:[212, 6.5], ico:[68, 56],   nom:[142, 1.25] },
    grande:    { n:"Ilustración grande", asig:[30, 6.5],  ico:[104, 120], nom:[205, 0.85] }
  };

  function marco(tipo) {
    if (tipo === "simple") return `<rect x="8" y="8" width="${W-16}" height="${H-16}" rx="3" stroke-width="0.5"/>`;
    if (tipo === "doble")  return `<rect x="8" y="8" width="${W-16}" height="${H-16}" rx="3" stroke-width="0.5"/><rect x="11.5" y="11.5" width="${W-23}" height="${H-23}" rx="2" stroke-width="0.3"/>`;
    if (tipo === "esquinas") { const a=8,s=18; return `<path stroke-width="0.6" d="M${a} ${a+s}V${a}H${a+s}M${W-a-s} ${a}H${W-a}V${a+s}M${W-a} ${H-a-s}V${H-a}H${W-a-s}M${a+s} ${H-a}H${a}V${H-a-s}"/>`; }
    return "";
  }

  /* cfg: {asig, dibujo, nombre, fuente, tam(0.5-1.6 factor), dx, dy, layout, marco, contorno,
           mostrarAsig, escala, dosLineas}
     modo: "tecnico" | "vista" (opts: colorPortada) */
  async function construir(cfg, modo = "tecnico", opts = {}) {
    const L = LAYOUTS[cfg.layout] || LAYOUTS.clasica, cx = W / 2;
    const font = await cargarFuente(cfg.fuente);
    const asigFont = await cargarFuente(FUENTES.find(f => f.id === "cinzel"));
    let nombre = (cfg.nombre || "").trim();
    if (cfg.fuente.mayus) nombre = nombre.toLocaleUpperCase("es");
    let r = "", l = "";

    l += marco(cfg.marco);
    if (cfg.mostrarAsig) r += texto(asigFont, cfg.asig.n.toLocaleUpperCase("es"), cx, L.asig[0], L.asig[1], W - 40, false);

    const d = DIBUJOS[cfg.dibujo];
    if (d) { const s = (L.ico[1] * cfg.escala) / 100, lw = 0.8 / s;
      l += `<g transform="translate(${f2(cx - 50*s)} ${f2(L.ico[0] - 50*s)}) scale(${f2(s)})" stroke-width="${f2(lw)}">${d.d}</g>`; }

    if (cfg.chispas && d) {
      const Rr = L.ico[1] * cfg.escala * 0.62;
      [[-1, -.7, 3.4], [1, -.95, 2.4], [1.05, .45, 1.7], [-1.05, .8, 2.6]].forEach(([a, b, k]) => {
        const x = Math.min(W - 14, Math.max(14, cx + a * Rr)), y = L.ico[0] + b * Rr, q = (u, v) => `${f2(u)} ${f2(v)}`;
        l += `<path d="M${q(x, y - k)}Q${q(x, y)} ${q(x + k, y)}Q${q(x, y)} ${q(x, y + k)}Q${q(x, y)} ${q(x - k, y)}Q${q(x, y)} ${q(x, y - k)}Z"/>`; });
    }
    const base = 22 * L.nom[1] * cfg.tam, cy = L.nom[0] + cfg.dy, ncx = cx + cfg.dx, mw = W - 30;
    const pal = nombre.split(/\s+/).filter(Boolean);
    if (cfg.dosLineas && pal.length > 1) {
      const m = Math.ceil(pal.length / 2), g = base * 0.62;
      const t1 = texto(font, pal.slice(0, m).join(" "), ncx, cy - g, base, mw, cfg.contorno);
      const t2 = texto(font, pal.slice(m).join(" "), ncx, cy + g, base, mw, cfg.contorno);
      (cfg.contorno ? (l += t1 + t2) : (r += t1 + t2));
    } else { const t = texto(font, nombre, ncx, cy, base, mw, cfg.contorno); cfg.contorno ? (l += t) : (r += t); }

    const grupos = (fill, stroke) =>
      `<g id="grabado-relleno" fill="${fill}" stroke="none">${r}</g>` +
      `<g id="grabado-lineal" fill="none" color="${stroke}" stroke="${stroke}" stroke-width="0.3" stroke-linecap="round" stroke-linejoin="round">${l.replace(/class="l" /g, "").replace(/<path d="/g, '<path d="')}</g>`;

    const cab = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}">`;
    if (modo === "vista") {
      const tinta = opts.colorPortada === "#2b2622" ? "#ead7b8" : "#3a2616";   // color de grabado simulado sobre el material
      return `${cab}<rect width="${W}" height="${H}" rx="4" fill="${opts.colorPortada || "#d9b98c"}"/>${grupos(tinta, tinta)}</svg>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n${cab}<title>${cfg.asig.n} - ${nombre.replace(/[<&]/g,"")}</title>` +
      `<desc>Cuaderno ${W}x${H} mm. Negro = grabado. Capa relleno: texto. Capa lineal: ilustración, marcos y contornos.</desc>${grupos("#000", "#000")}</svg>`;
  }
  return { construir, cargarFuente, LAYOUTS, W, H };
})();
