/* Llaveros: visor grande con el nombre/figura grabado DENTRO de la madera o el cuero.
   MODELOS: cx,cy = centro del área grabable; w,h = tamaño útil; r = giro; z = zoom (todo en % de la foto). */
const Llavero = (() => {
  const T = { tinta:"#4a2a12", mezcla:"multiply", op:.9 };
  const MODELOS = {
    "madera-rombo":    { cx:49, cy:65, w:28, h:27, r:0,   z:1.6 },
    "madera-escudo":   { cx:40, cy:48, w:34, h:19, r:0,   z:1.8 },
    "madera-alargado": { cx:51, cy:37, w:36, h:13, r:-90, z:1.6 },
    "madera-pastilla": { cx:37.5, cy:47, w:38, h:20, r:0, z:1.6 },
    "madera-ovalo":    { cx:38, cy:47, w:33, h:17, r:0,   z:1.9 },
    "cuero-miel":      { cx:26, cy:49, w:26, h:26, r:0,   z:2.2, tinta:"#3b2410" },
    "cuero-negro":     { cx:27, cy:50, w:25, h:25, r:0,   z:2.2, tinta:"#e3d9c8", mezcla:"normal", op:.85 },
    "hero":            { cx:38, cy:51, w:30, h:19, r:0,   z:1.9, img:"assets/productos/madera-escudo-b.jpg" }
  };
  const TAM = "Tamaño aproximado: 3 a 4 cm";
  /* Figuras: [archivo en assets/figuras, nombre] por categoría */
  const CATS = {
    "Caballos": [["01","Caballo rampante"],["02","Caballo al galope"],["03","Caballo perfil"],["04","Caballo de frente"],["05","Caballo cabeza"],["06","Caballo asomado"],["07","Caballo en círculo"],["08","Caballo melena"],["09","Caballo de fuego"]],
    "Gatos": [["25_gato_perfil","Gato perfil"],["26_gato_maine_coon","Gato Maine Coon"],["27_gato_sonriente_ojos_cerrados","Gato sonriente"],["34_gato_con_flores","Gato con flores"],["35_gato_laurel_cinta","Gato con laurel"],["36_gato_grabado_bigotes","Gato bigotes"],["37_gato_lineas_bigotes","Gato líneas"],["24_gato_caricatura_sentado","Gato caricatura"],["28_gato_orejas_dobladas_grabado","Gato orejas dobladas"]],
    "Animales": [["02_perro_jack_russell","Perro Jack Russell"],["03_bulldog_sombrero","Bulldog sombrero"],["04_bulldog_gorra","Bulldog gorra"],["01_llama_gafas","Llama con gafas"],["05_gorila_sombrero","Gorila sombrero"],["06_oso_chistera","Oso chistera"],["39_loro_guacamayo","Guacamayo"]],
    "Mariposas": [["07_mariposa_monarca","Monarca"],["38_mariposa_ornamental","Ornamental"],["29_mariposa_manchas","Con manchas"],["31_mariposa_grabado_papel","Grabado"],["32_mariposa_lateral","Lateral"],["30_corona_flores_mariposas","Corona de flores"],["33_flores_con_mariposa","Flores y mariposa"]],
    "Flores": [["10_rosa_01","Rosa 1"],["11_rosa_02","Rosa 2"],["12_rosa_03","Rosa 3"],["13_rosa_capullo_tallo","Capullo"],["14_flor_pequena","Flor pequeña"],["15_lavanda","Lavanda"],["16_rama_arco","Rama arco"],["17_rama_larga_hojas","Rama hojas"],["18_rama_derecha","Rama derecha"],["19_rama_hojas_base","Hojas base"],["20_hojas_grupo","Hojas"],["21_hojas_esquina","Hojas esquina"],["22_rama_negra","Rama"],["23_ramita_brotes","Brotes"]],
    "Mamá": [["08_dia_de_la_madre_flores","Día de la madre"],["09_mejor_madre_corona","Mejor madre"]],
    "Íconos": ["corazon","estrella","luna","paloma","huella","herradura","sol","paz"].map(i => ["ico:" + i, DIBUJOS[i].n])
  };
  const FIG = {};
  Object.entries(CATS).forEach(([c, l]) => l.forEach(([id, n]) => FIG[id] = { id, n, c, src: id.startsWith("ico:") ? null : `assets/figuras/${id}.svg`, d: id.startsWith("ico:") ? DIBUJOS[id.slice(4)].d : null }));
  const TODAS = Object.keys(FIG);
  const vivos = []; let uid = 0;
  const thumb = f => f.src ? `<img src="${f.src}" alt="${f.n}" loading="lazy" decoding="async">` : `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${f.d}</svg>`;

  function armar(o) {
    const m = o.m = { ...T, ...MODELOS[o.ref] }, id = "tf" + (++uid), c = m.tinta, h = k => (parseInt(c.slice(k, k + 2), 16) / 255).toFixed(3);
    o.cont.classList.add("lv");
    o.cont.innerHTML = `<div class="zoom"><img src="${o.img || m.img}" alt="Llavero (foto de referencia)" decoding="async">
      <svg viewBox="0 0 100 100" style="mix-blend-mode:${m.mezcla}"><defs><filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${h(1)}  0 0 0 0 ${h(3)}  0 0 0 0 ${h(5)}  0 0 0 1 0"/></filter></defs><g class="ov" data-f="${id}"></g></svg></div><span class="ref">Foto de referencia</span>`;
    o.zoom = o.cont.querySelector(".zoom"); zoom(o);
  }
  function zoom(o) {
    const m = o.m; o.zoom.style.transformOrigin = `${m.cx}% ${m.cy}%`;
    o.zoom.style.transform = `translate(${50 - m.cx}%,${50 - m.cy}%) scale(${m.z * o.zm})`;
  }
  function montar(cont, ref, img) {
    const o = { cont, ref, img, zm:1, est:{ nombre:"", fuenteId:"great-vibes", dib:"" }, tok:0 };
    armar(o); vivos.push(o); pintar(o); return o;
  }

  function disponer(m, fig, hayNombre) {                 // misma distribución para la vista y para el archivo láser
    const horiz = m.w / m.h > 1.45, solo = !!fig && !hayNombre;
    let sz = 0, ix = 0, iy = 0, caja = { x:0, y:0, w:m.w, h:m.h };
    if (fig) {
      sz = solo ? Math.min(m.w, m.h) * 0.96 : horiz ? m.h * 0.98 : m.h * 0.68;
      ix = solo ? 0 : horiz ? -m.w / 2 + sz / 2 : 0; iy = solo ? 0 : horiz ? 0 : -m.h / 2 + sz / 2;
      caja = horiz ? { x:sz / 2 + 0.5, y:0, w:m.w - sz - 1, h:m.h } : { x:0, y:m.h * 0.37, w:m.w, h:m.h * 0.28 };
    }
    return { horiz, solo, sz, ix, iy, caja };
  }

  async function pintar(o) {
    const mi = ++o.tok, { m, est } = o, f = FUENTES.find(x => x.id === est.fuenteId);
    try { await document.fonts.load(`40px "f-${f.id}"`); } catch (e) {}
    if (mi !== o.tok || !o.cont.offsetParent) return;
    const g = o.cont.querySelector(".ov"), fantasma = !est.nombre.trim(), fig = FIG[est.dib], L = disponer(m, fig, !fantasma), caja = L.caja;
    let txt = fantasma ? "Tu nombre" : est.nombre.trim(), s = "";
    if (f.mayus) txt = txt.toLocaleUpperCase("es");
    if (fig) {
      const k = L.sz / 100;
      s += fig.src ? `<image href="${fig.src}" x="${(L.ix - L.sz / 2).toFixed(2)}" y="${(L.iy - L.sz / 2).toFixed(2)}" width="${L.sz.toFixed(2)}" height="${L.sz.toFixed(2)}" preserveAspectRatio="xMidYMid meet" filter="url(#${g.dataset.f})"/>`
        : `<g transform="translate(${L.ix - 50 * k} ${L.iy - 50 * k}) scale(${k})" color="${m.tinta}" fill="none" stroke="${m.tinta}" stroke-width="${(0.42 / k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">${fig.d}</g>`;
    }
    if (!L.solo) s += `<text class="nom" font-family="f-${f.id}" font-size="10" fill="${m.tinta}" text-anchor="middle" opacity="${fantasma ? 0.35 : m.op}">${txt.replace(/[<&]/g, "")}</text>`;
    g.setAttribute("transform", `translate(${m.cx} ${m.cy}) rotate(${m.r})`);
    g.innerHTML = s; g.classList.remove("pop"); g.getBoundingClientRect(); g.classList.add("pop");
    const t = g.querySelector("text.nom"), b = t && t.getBBox();
    if (b && b.width) {
      const k = Math.min(caja.w / b.width, caja.h / b.height, fig && !L.horiz ? 3 : 4);
      t.setAttribute("transform", `translate(${caja.x} ${caja.y}) scale(${k.toFixed(3)}) translate(${-(b.x + b.width / 2)} ${-(b.y + b.height / 2)})`);
    }
  }

  /* ---- Modo taller: disponible únicamente en la copia local del computador del taller. ----
     Esto NO es autenticación: cualquier persona con acceso al mismo computador/navegador
     puede abrir el panel. En el sitio público el panel permanece deshabilitado. */
  const ADMIN = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
  function accesoTaller() {
    if (!ADMIN) return;
    const pie = document.querySelector("footer"); if (!pie || pie.querySelector("#acceso-taller")) return;
    const a = document.createElement("a"); a.id = "acceso-taller"; a.href = "#pedidos"; a.textContent = "Acceso taller";
    const caja = document.createElement("div"); caja.className = "acc-fila"; caja.appendChild(a); pie.appendChild(caja);
    a.addEventListener("click", e => { e.preventDefault(); window.ver && ver("pedidos"); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", accesoTaller); else accesoTaller();
  const enc = d => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(d)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const dec = q => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(q.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))));
  const enlace = i => location.origin + location.pathname + "#pedido=" + enc({ r:i.ref || i.cfg.ref, n:i.grabar, f:i.cfg.fuenteId || (FUENTES.find(q => q.n === i.fuente) || {}).id, d:i.cfg.dibujo });

  async function svgLaser(est, ref, mm, modo = "trazado") {
    const m = { ...T, ...MODELOS[ref] }, f = FUENTES.find(x => x.id === est.fuenteId), fig = FIG[est.dib];
    const nombre = f.mayus ? est.nombre.trim().toLocaleUpperCase("es") : est.nombre.trim(), L = disponer(m, fig, modo === "sin" || !!nombre);
    let out = "";
    if (fig && fig.src) {
      const t = await (await fetch(fig.src)).text(), vb = t.match(/viewBox="([^"]+)"/)[1].trim().split(/[\s,]+/).map(Number), k = L.sz / Math.max(vb[2], vb[3]);
      out += `<g transform="translate(${L.ix} ${L.iy}) scale(${k}) translate(${-(vb[0] + vb[2] / 2)} ${-(vb[1] + vb[3] / 2)})" fill="#000">${t.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>[\s\S]*$/, "")}</g>`;
    } else if (fig) {
      const k = L.sz / 100;
      out += `<g transform="translate(${L.ix - 50 * k} ${L.iy - 50 * k}) scale(${k})" fill="none" stroke="#000" stroke-width="${(0.42 / k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">${fig.d}</g>`;
    }
    if (nombre && modo !== "sin") {
      const fo = await GeneradorSVG.cargarFuente(f), p = fo.getPath(nombre, 0, 0, 100), b = p.getBoundingBox(), c = L.caja;
      const k = Math.min(c.w / (b.x2 - b.x1), c.h / (b.y2 - b.y1), (fig && !L.horiz ? 30 : 40) / 100);
      if (modo === "texto") { const fam = fo.names.fontFamily ? (fo.names.fontFamily.en || Object.values(fo.names.fontFamily)[0]) : f.n;
        out += `<text x="${c.x}" y="${(c.y - (b.y1 + b.y2) / 2 * k).toFixed(3)}" font-family="${fam}" font-size="${(100 * k).toFixed(3)}" text-anchor="middle" fill="#000">${nombre.replace(/[<&]/g, "")}</text>`; }
      else out += `<path transform="translate(${c.x} ${c.y}) scale(${k.toFixed(4)}) translate(${-(b.x1 + b.x2) / 2} ${-(b.y1 + b.y2) / 2})" fill="#000" d="${p.toPathData(2)}"/>`;
    }
    const rot = m.r === -90, vw = rot ? m.h : m.w, vh = rot ? m.w : m.h, s = mm / m.w;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${(vw * s).toFixed(2)}mm" height="${(vh * s).toFixed(2)}mm" viewBox="${-vw / 2} ${-vh / 2} ${vw} ${vh}"><g${rot ? ' transform="rotate(-90)"' : ""}>${out}</g></svg>`;
  }
  async function descargar(est, ref, mm, modo) {
    const svg = await svgLaser(est, ref, mm, modo), a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svg], { type:"image/svg+xml" }));
    a.download = `llavero-${ref}-${(est.nombre || "figura").trim().replace(/\W+/g, "_")}.svg`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ---- Visor grande + selector (pensado para celular) ---- */
  function configurador(sel, lista) {
    const raiz = document.querySelector(sel); let p = lista[0], cat = "Caballos";
    raiz.innerHTML = `<div class="cl"><div class="cl-vista"><div class="foto vivo" id="cl-lv"></div>
      <div class="cl-barra"><button type="button" class="btn sec" id="cl-zoom">🔍 Ver detalle</button><small id="cl-tam">${TAM}</small></div>${ADMIN ? `<div class="adm"><b>Modo taller</b> Ancho <input id="cl-mm" type="number" value="30" min="10" max="80"> mm <select id="cl-modo"><option value="trazado">Nombre en trazados</option><option value="texto">Nombre como texto editable</option><option value="sin">Sin nombre (lo escribo yo)</option></select> <button type="button" class="btn" id="cl-svg">⬇ SVG para láser</button> <button type="button" class="btn sec" id="cl-ttf">🔤 Esta tipografía</button> <a class="btn sec" href="assets/tipografias/tipografias-para-instalar.zip" download>📦 Todas (ZIP)</a></div>` : ""}</div>
      <div class="cl-ctrl">
        <label class="cl-et">1. Elige tu llavero</label>
        <div class="mods" id="cl-mods">${lista.map((x, i) => `<button type="button" class="mod${i ? "" : " sel"}" data-i="${i}"><img src="${x.img}" alt="" loading="lazy"><span>${x.n.replace("Llavero ", "").replace("cuero sintético", "cuero")}</span></button>`).join("")}</div>
        <label class="cl-et">2. Escribe el nombre</label>
        <input type="text" id="cl-nom" maxlength="30" placeholder="Ej: Sofía" aria-label="Nombre a grabar">
        <select id="cl-fuente" aria-label="Tipografía">${FUENTES.map(f => `<option value="${f.id}" style="font-family:'f-${f.id}'">${f.n}</option>`).join("")}</select>
        <label class="cl-et">3. Elige una figura <small>(opcional)</small></label>
        <div class="tabs" id="cl-tabs">${Object.keys(CATS).map(c => `<button type="button" class="tab${c === cat ? " sel" : ""}" data-c="${c}">${c}</button>`).join("")}</div>
        <div class="fgrid" id="cl-fig"></div>
        <div class="cl-add"><div><b id="cl-precio"></b><small id="cl-desc"></small></div><button class="btn" id="cl-agregar">Agregar al carrito</button></div>
      </div></div>`;
    const $ = s => raiz.querySelector(s), o = montar($("#cl-lv"), p.ref, p.img);
    const figs = () => { $("#cl-fig").innerHTML = `<button type="button" class="ft${o.est.dib ? "" : " sel"}" data-f="" title="Solo nombre"><b>Aa</b><span>Solo nombre</span></button>` +
      CATS[cat].map(([id]) => `<button type="button" class="ft${o.est.dib === id ? " sel" : ""}" data-f="${id}" title="${FIG[id].n}">${thumb(FIG[id])}<span>${FIG[id].n}</span></button>`).join(""); };
    const info = () => { $("#cl-precio").textContent = PRECIOS.formato(PRECIOS.precioUnitario({ tipo:"llavero", ref:p.ref })); $("#cl-desc").textContent = p.n + " · " + TAM.replace("Tamaño aproximado", "aprox."); };
    figs(); info();
    if (ADMIN) $("#cl-ttf").onclick = () => { const id = $("#cl-fuente").value, a = document.createElement("a"); a.href = `assets/tipografias/instalar/${id}.ttf`; a.download = id + ".ttf"; document.body.appendChild(a); a.click(); a.remove(); };
    if (ADMIN) $("#cl-svg").onclick = () => { if (o.est.nombre.trim() || o.est.dib || $("#cl-modo").value === "sin") descargar(o.est, o.ref, +$("#cl-mm").value || 30, $("#cl-modo").value); };
    const q = (location.hash.match(/^#pedido=([A-Za-z0-9_-]+)/) || [])[1]; // enlace de diseño sin datos en la solicitud HTTP
    if (q) try {
      const d = dec(q), x = lista.findIndex(y => y.ref === d.r);
      if (x >= 0) {
        p = lista[x]; o.ref = p.ref; o.img = p.img; armar(o); o.est = { nombre:d.n || "", fuenteId:FUENTES.some(f => f.id === d.f) ? d.f : "great-vibes", dib:FIG[d.d] ? d.d : "" };
        $("#cl-nom").value = o.est.nombre; $("#cl-fuente").value = o.est.fuenteId; if (o.est.dib) cat = FIG[o.est.dib].c;
        raiz.querySelectorAll(".mod").forEach((b, i) => b.classList.toggle("sel", i === x)); raiz.querySelectorAll(".tab").forEach(b => b.classList.toggle("sel", b.dataset.c === cat));
        figs(); info(); setTimeout(() => { window.ver && ver("llaveros"); pintar(o); }, 0);
      }
    } catch (e) {}
    raiz.addEventListener("click", e => {
      const mo = e.target.closest(".mod"), ta = e.target.closest(".tab"), ft = e.target.closest(".ft");
      if (mo) { p = lista[mo.dataset.i]; o.ref = p.ref; o.img = p.img; o.zm = 1; armar(o); pintar(o); raiz.querySelectorAll(".mod").forEach(x => x.classList.toggle("sel", x === mo)); info(); $("#cl-zoom").textContent = "🔍 Ver detalle"; }
      else if (ta) { cat = ta.dataset.c; raiz.querySelectorAll(".tab").forEach(x => x.classList.toggle("sel", x === ta)); figs(); }
      else if (ft) { o.est.dib = ft.dataset.f; figs(); pintar(o); }
    });
    $("#cl-zoom").onclick = e => { o.zm = o.zm > 1 ? 1 : 1.7; zoom(o); e.target.textContent = o.zm > 1 ? "🔎 Alejar" : "🔍 Ver detalle"; };
    raiz.addEventListener("input", () => { $("#cl-nom").style.fontFamily = `'f-${$("#cl-fuente").value}'`; o.est.nombre = $("#cl-nom").value; o.est.fuenteId = $("#cl-fuente").value; pintar(o); });
    $("#cl-agregar").onclick = () => {
      if (!o.est.nombre.trim() && !o.est.dib) { $("#cl-nom").focus(); $("#cl-nom").classList.add("falta"); setTimeout(() => $("#cl-nom").classList.remove("falta"), 900); return; }
      Carrito.agregar({ tipo:"llavero", ref:p.ref, producto:p.n + " (aprox. 3 a 4 cm)", grabar:o.est.nombre.trim(), fuente:FUENTES.find(x => x.id === o.est.fuenteId).n,
        diseno: o.est.dib ? "Figura: " + FIG[o.est.dib].n : "", cfg:{ dibujo:o.est.dib, fuenteId:o.est.fuenteId, ref:p.ref } });
    };
  }

  // Demo del inicio
  function hero() {
    const cont = document.querySelector("#hero-llavero"); if (!cont) return;
    const o = montar(cont, "hero"); let i = 0;
    const inp = document.querySelector("#hero-nombre");
    inp.addEventListener("input", () => { o.est.nombre = inp.value; pintar(o); });
    document.querySelector("#hero-fig").onclick = () => { i = (i + 1) % TODAS.length; o.est.dib = TODAS[i]; o.est.fuenteId = FUENTES[i % FUENTES.length].id; pintar(o); };
    o.est.dib = TODAS[2]; pintar(o);
  }
  const repintar = () => vivos.forEach(pintar);
  return { configurador, hero, repintar, figuras:() => FIG, categorias:() => CATS, enlace, descargar, admin:ADMIN, modelo:r => ({ ...T, ...MODELOS[r] }), layout:(m, id, h) => disponer(m, FIG[id], h), fig:id => FIG[id] };
})();
