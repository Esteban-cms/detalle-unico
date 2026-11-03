/* Imagen del pedido (PNG) para enviar por WhatsApp. Todo se dibuja en el navegador del cliente: no se sube ni se guarda nada. */
const PedidoImg = (() => {
  const W = 1080, M = 44, MARRON = "#8a5a2b", TINTA = "#3a2616", CREMA = "#f6efe3", LINEA = "#e6d8c0";
  const SERIF = `'f-playfair-display', Georgia, serif`, SANS = `'f-quicksand', system-ui, sans-serif`;
  const cargar = src => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; });
  const rect = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const tinta = (im, s, col) => { const t = document.createElement("canvas"); t.width = t.height = s; const c = t.getContext("2d");
    const k = Math.min(s / im.width, s / im.height); c.drawImage(im, (s - im.width * k) / 2, (s - im.height * k) / 2, im.width * k, im.height * k);
    c.globalCompositeOperation = "source-in"; c.fillStyle = col; c.fillRect(0, 0, s, s); return t; };
  const fecha = () => new Date().toLocaleDateString("es-CO", { day:"numeric", month:"long", year:"numeric" });
  const numero = () => String(Math.floor(Date.now() / 60000) % 9000 + 1000);   // 4 cifras que van subiendo con el tiempo

  /* Foto del llavero acercada, con el nombre y la figura grabados (igual que en el visor) */
  async function llavero(c, i, x, y, S) {
    const ref = i.ref || (i.cfg && i.cfg.ref), dib = i.cfg && i.cfg.dibujo, fid = (i.cfg && i.cfg.fuenteId) || (FUENTES.find(q => q.n === i.fuente) || {}).id;
    const p = (CATALOGO.llaveroMadera.concat(CATALOGO.llaveroCuero)).find(q => q.ref === ref), im = p && await cargar(p.img);
    if (!im) return false;
    const m = Llavero.modelo(ref), half = 50 / m.z, sx = Math.min(Math.max(m.cx - half, 0), 100 - 2 * half), sy = Math.min(Math.max(m.cy - half, 0), 100 - 2 * half), u = S / (2 * half);
    c.save(); rect(c, x, y, S, S, 22); c.clip();
    c.drawImage(im, sx / 100 * im.width, sy / 100 * im.height, 2 * half / 100 * im.width, 2 * half / 100 * im.height, x, y, S, S);
    const f = FUENTES.find(q => q.id === fid) || FUENTES[0], fig = Llavero.fig(dib), nombre = f.mayus ? (i.grabar || "").toLocaleUpperCase("es") : (i.grabar || "");
    const L = Llavero.layout(m, dib, !!nombre.trim());
    c.translate(x + (m.cx - sx) * u, y + (m.cy - sy) * u); c.rotate(m.r * Math.PI / 180);
    c.globalCompositeOperation = m.mezcla === "multiply" ? "multiply" : "source-over"; c.globalAlpha = m.op;
    if (fig) {
      const s = L.sz * u, g = fig.src ? await cargar(fig.src) : await cargar("data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${fig.d}</svg>`));
      if (g) c.drawImage(tinta(g, Math.round(s * 2), m.tinta), L.ix * u - s / 2, L.iy * u - s / 2, s, s);
    }
    if (nombre.trim()) {
      try { await document.fonts.load(`80px "f-${f.id}"`); } catch (e) {}
      c.font = `100px "f-${f.id}"`; const w = c.measureText(nombre).width, k = Math.min(L.caja.w * u / w, L.caja.h * u / 100 * 0.95, (fig && !L.horiz ? 30 : 40) / 100 * u * 1.0);
      c.fillStyle = m.tinta; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `${100 * k}px "f-${f.id}"`; c.fillText(nombre, L.caja.x * u, L.caja.y * u);
    }
    c.restore(); return true;
  }

  /* Foto de referencia del producto (colgantes, pulseras, etc.), recortada cuadrada */
  async function foto(c, i, x, y, S) {
    const p = CATALOGO.metal.concat(CATALOGO.llaveroMadera, CATALOGO.llaveroCuero).find(q => q.n === i.producto.replace(/ \(.*\)$/, "")), src = i.img || (p && p.img), im = src && await cargar(src);
    if (!im) return false; const k = Math.min(im.width, im.height);
    c.save(); rect(c, x, y, S, S, 22); c.clip(); c.drawImage(im, (im.width - k) / 2, (im.height - k) / 2, k, k, x, y, S, S); c.restore(); return true;
  }
  /* Placa con su frase y dibujo, tal como se verá grabada */
  async function placa(c, i, x, y, S) {
    try {
      const svg = await Placa.vista(Placa.estDeItem(i), { n:i.cfg.color || i.producto }), im = await cargar("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
      if (!im) return false; const k = Math.min(S / im.width, S / im.height), w = im.width * k, h = im.height * k;
      c.fillStyle = "#ece3d3"; rect(c, x, y, S, S, 22); c.fill(); c.drawImage(im, x + (S - w) / 2, y + (S - h) / 2, w, h); return true;
    } catch (e) { return false; }
  }

  /* Lápiz con su nombre y adornos, tal como se verá grabado */
  async function lapiz(c, i, x, y, S) {
    try {
      const svg = await Lapiz.vistaZoom(Lapiz.estDeItem(i)), im = await cargar("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
      if (!im) return false; const k = S / im.width, h = im.height * k;
      c.save(); rect(c, x, y + (S - h) / 2, S, h, 22); c.clip(); c.drawImage(im, x, y + (S - h) / 2, S, h); c.restore(); return true;
    } catch (e) { return false; }
  }

  async function cuaderno(c, i, x, y, S) {
    try {
      const cfg = { ...i.cfg, asig: ASIGNATURAS.find(a => a.id === i.cfg.asigId), fuente: FUENTES.find(f => f.id === i.cfg.fuenteId) };
      const svg = await GeneradorSVG.construir(cfg, "vista", { colorPortada: "#e3cfae" }), im = await cargar("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
      if (!im) return false; const k = Math.min(S / im.width, S / im.height), w = im.width * k, h = im.height * k;
      c.save(); rect(c, x + (S - w) / 2, y, w, h, 12); c.clip(); c.drawImage(im, x + (S - w) / 2, y, w, h); c.restore(); return true;
    } catch (e) { return false; }
  }

  /* Parte un texto en renglones que quepan en maxW (usa la fuente ya puesta en c) */
  function envolver(c, texto, maxW, primerAncho) {
    const out = []; let lin = "";
    String(texto).split(/\r?\n/).forEach(par => {
      par.split(/\s+/).filter(Boolean).forEach(w => {
        const t = lin ? lin + " " + w : w, mw = out.length === 0 && primerAncho ? primerAncho : maxW;
        if (!lin || c.measureText(t).width <= mw) lin = t; else { out.push(lin); lin = w; }
      });
      if (lin) { out.push(lin); lin = ""; }
    });
    return out.length ? out : [""];
  }
  const fuenteDe = i => FUENTES.find(q => q.id === (i.cfg && i.cfg.fuenteId)) || FUENTES.find(q => q.n === i.fuente) || FUENTES[0];

  /* Calcula todo lo que va en un producto (renglones de detalle y de texto) para saber cuánto mide su tarjeta */
  function medir(c, i, tw, lineas) {
    const f = fuenteDe(i), esPlaca = i.tipo === "placa";
    c.font = `500 26px ${SANS}`;
    const info = [];                                           // [etiqueta, [renglones del valor]]
    lineas(i).slice(1).filter(([k]) => k !== "Nombre a grabar" && k !== "Frase a grabar").forEach(([k, v]) => {
      const w = c.measureText(k + ": ").width; info.push([k, envolver(c, v, tw, tw - w)]);
    });
    const nInfo = info.reduce((n, [, r]) => n + r.length, 0);
    const etY = 84 + 34 * (nInfo - 1) + 44;                    // línea base de la etiqueta (relativa al borde de la tarjeta + 28)
    let frase = [], fs = 64;
    if (i.grabar) {
      let t = String(i.grabar); if (f.mayus) t = t.toLocaleUpperCase("es");
      if (esPlaca) { fs = 30; c.font = `${fs}px "f-${f.id}"`; frase = envolver(c, t, tw); }
      else { c.font = `${fs}px "f-${f.id}"`; while (c.measureText(t).width > tw && fs > 22) { fs -= 2; c.font = `${fs}px "f-${f.id}"`; } frase = [t]; }
    }
    const ultima = i.grabar ? (esPlaca ? etY + 40 + 36 * (frase.length - 1) : etY + 62) : 84 + 34 * (nInfo - 1);
    return { f, esPlaca, info, etY, frase, fs, alto: Math.max(330, 28 + ultima + 28 + 56) };
  }

  /* Código QR con el enlace del pedido (para el taller) */
  function dibujarQR(c, link, x, y, Q) {
    try {
      const q = qrcode(0, "L"); q.addData(link); q.make();
      const n = q.getModuleCount(), cell = Math.max(2, Math.floor(Q / (n + 8))), tam = cell * (n + 8);
      c.fillStyle = "#fff"; c.fillRect(x, y, tam, tam); c.fillStyle = "#000";
      for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) c.fillRect(x + (k + 4) * cell, y + (r + 4) * cell, cell, cell);
      return tam;
    } catch (e) { return 0; }
  }

  async function generar(items, tot, num, lineas, enlace) {
    try { await Promise.all(["f-playfair-display", "f-quicksand"].map(f => document.fonts.load(`30px "${f}"`))); } catch (e) {}
    try { await Promise.all(items.filter(i => i.grabar).map(i => document.fonts.load(`40px "f-${fuenteDe(i).id}"`))); } catch (e) {}
    const S = 250, H0 = 230, GAP = 22;
    let qtam = 0;                                              // tamaño real del QR (para que el cuadro no sobre espacio)
    if (enlace) try { const q = qrcode(0, "L"); q.addData(enlace); q.make(); const n = q.getModuleCount(); qtam = Math.max(2, Math.floor(428 / (n + 8))) * (n + 8); } catch (e) {}
    const QSEC = qtam ? qtam + 92 : 0;
    const tx0 = M + 28 + S + 34, tw = W - M - 28 - tx0;
    const mc = document.createElement("canvas").getContext("2d"), L = items.map(i => medir(mc, i, tw, lineas));
    const ALTO = H0 + 28 + L.reduce((a, l) => a + l.alto + GAP, 0) + 150 + 60 + QSEC + 110;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = ALTO; const c = cv.getContext("2d");
    c.fillStyle = CREMA; c.fillRect(0, 0, W, ALTO);
    const gr = c.createLinearGradient(0, 0, W, H0); gr.addColorStop(0, "#6f4620"); gr.addColorStop(1, "#a8723a"); c.fillStyle = gr; c.fillRect(0, 0, W, H0);
    c.fillStyle = "#fff"; c.textBaseline = "alphabetic"; c.textAlign = "left";
    c.font = `600 30px ${SANS}`; c.globalAlpha = .85; c.fillText("TALLER LÁSER · GRABADO PERSONALIZADO", M, 70); c.globalAlpha = 1;
    c.font = `700 88px ${SERIF}`; c.fillText("Pedido #" + num, M, 160);
    c.font = `500 28px ${SANS}`; c.textAlign = "right"; c.fillText(fecha(), W - M, 160); c.textAlign = "left";
    let y = H0 + 28;
    for (let n = 0; n < items.length; n++) {
      const i = items[n], l = L[n], FILA = l.alto;
      c.fillStyle = "#fff"; c.strokeStyle = LINEA; c.lineWidth = 2; rect(c, M, y, W - 2 * M, FILA, 28); c.fill(); c.stroke();
      const px = M + 28, ty = y + 28, py = y + Math.max(28, (FILA - 56 - S) / 2 + 28); let hayFoto = false;
      if (i.tipo === "llavero" && (i.ref || (i.cfg && i.cfg.ref))) hayFoto = await llavero(c, i, px, py, S);
      else if (i.tipo === "cuaderno" && i.cfg) hayFoto = await cuaderno(c, i, px, py, S);
      else if (i.tipo === "placa" && i.cfg) hayFoto = await placa(c, i, px, py, S);
      else if (i.tipo === "lapiz" && i.cfg) hayFoto = await lapiz(c, i, px, py, S);
      if (!hayFoto) hayFoto = await foto(c, i, px, py, S);
      if (!hayFoto) { c.fillStyle = "#f3e7d3"; rect(c, px, py, S, S, 22); c.fill(); c.fillStyle = MARRON; c.font = `700 90px ${SERIF}`; c.textAlign = "center"; c.fillText("✦", px + S / 2, py + S / 2 + 30); c.textAlign = "left"; }
      const tx = tx0;
      c.fillStyle = TINTA; let ts = 36; c.font = `700 ${ts}px ${SERIF}`; while (c.measureText(i.producto).width > tw && ts > 20) { ts -= 1; c.font = `700 ${ts}px ${SERIF}`; } c.fillText(String(i.producto), tx, ty + 40);
      let ly = ty + 84; c.font = `500 26px ${SANS}`;
      l.info.forEach(([k, rr]) => { rr.forEach((t, r) => {
        if (r === 0) { c.fillStyle = "#8b7a63"; c.fillText(k + ":", tx, ly); const w = c.measureText(k + ": ").width; c.fillStyle = TINTA; c.fillText(t, tx + w, ly); }
        else { c.fillStyle = TINTA; c.fillText(t, tx, ly); }
        ly += 34; }); });
      if (i.grabar) {
        c.fillStyle = "#8b7a63"; c.font = `600 22px ${SANS}`; c.fillText(l.esPlaca ? "FRASE A GRABAR" : "NOMBRE A GRABAR", tx, ty + l.etY);
        c.fillStyle = MARRON; c.font = `${l.fs}px "f-${l.f.id}"`;
        if (l.esPlaca) l.frase.forEach((t, r) => c.fillText(t, tx, ty + l.etY + 40 + 36 * r)); else c.fillText(l.frase[0], tx, ty + l.etY + 62);
      }
      c.fillStyle = MARRON; c.font = `700 30px ${SANS}`; c.textAlign = "right";
      c.fillText(`x${i.cantidad}   ${PRECIOS.formato(PRECIOS.precioUnitario(i) * i.cantidad)}`, W - M - 28, y + FILA - 22); c.textAlign = "left";
      y += FILA + GAP;
    }
    c.fillStyle = TINTA; rect(c, M, y, W - 2 * M, 150, 28); c.fill();
    c.fillStyle = "#fff"; c.font = `500 28px ${SANS}`;
    if (tot.pct) c.fillText(`Descuento ${tot.pct}%: −${PRECIOS.formato(tot.desc)}`, M + 32, y + 52);
    c.font = `700 56px ${SERIF}`; c.fillText("Total", M + 32, y + 118); c.textAlign = "right"; c.fillText(PRECIOS.formato(tot.total), W - M - 32, y + 118); c.textAlign = "left";
    y += 150 + 36;
    if (qtam) {                                                // QR: abre el pedido completo en el panel del taller
      c.fillStyle = "#fff"; c.strokeStyle = LINEA; rect(c, M, y, W - 2 * M, QSEC - 20, 28); c.fill(); c.stroke();
      const tam = dibujarQR(c, enlace, M + 36, y + 36, QSEC - 92);
      if (tam) {
        const qx = M + 36 + tam + 34, qw = W - M - 36 - qx; c.fillStyle = TINTA; c.font = `700 34px ${SERIF}`; c.fillText("Código del pedido", qx, y + 90);
        c.fillStyle = "#8b7a63"; c.font = `500 25px ${SANS}`; c.textAlign = "left";
        envolver(c, "Para el taller: escanéalo con la cámara del celular para abrir este pedido completo y descargar los archivos de grabado.", qw).forEach((t, r) => c.fillText(t, qx, y + 140 + 34 * r));
      }
      y += QSEC;
    }
    c.fillStyle = "#8b7a63"; c.font = `500 24px ${SANS}`; c.textAlign = "center";
    c.fillText("Fotos de referencia · llaveros de aprox. 3 a 4 cm · ¡Gracias por tu pedido!", W / 2, y + 20);
    return new Promise(r => cv.toBlob(r, "image/png"));
  }
  return { generar, numero };
})();
