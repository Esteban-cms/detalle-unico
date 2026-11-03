/* Panel "Pedidos" (solo modo taller).
   El mensaje de WhatsApp trae un enlace con TODO el pedido codificado dentro (no hay servidor ni base de datos).
   Al abrir o pegar ese enlace aquí, se ve lo que escribió el cliente en cada producto y se descargan sus archivos.
   Cada pedido abierto se recuerda SOLO en este navegador (localStorage), para buscarlo luego por su número. */
const Pedidos = (() => {
  const KEY = "lv_pedidos";
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  const enc = d => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(d)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const dec = q => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(q.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))));
  const guardados = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const recordar = p => { try {
    const g = guardados(); g[p.n] = { ...p, t:Date.now() };
    const o = {}; Object.keys(g).sort((a, b) => g[b].t - g[a].t).slice(0, 100).forEach(k => o[k] = g[k]);
    localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  let actual = null;

  /* Formato compacto (v2): solo lo que escribió/eligió el cliente; el resto se reconstruye aquí. Así el enlace y el QR son cortos. */
  const tarjetas = () => CATALOGO.metal.filter(p => p.ref === "tarjeta");
  const llaveros = () => CATALOGO.llaveroMadera.concat(CATALOGO.llaveroCuero);
  const fidDe = i => (i.cfg && i.cfg.fuenteId) || (FUENTES.find(f => f.n === i.fuente) || {}).id || "great-vibes";
  function compactar(i) {
    const q = +i.cantidad || 1, f = fidDe(i), c = i.cfg || {};
    if (i.tipo === "llavero") return ["l", i.ref || c.ref, i.grabar || "", f, c.dibujo || "", q, c.b ? c.b.n || "" : "", c.b ? c.b.d || "" : ""];
    if (i.tipo === "placa") return ["p", Math.max(0, tarjetas().findIndex(p => p.n === c.color)), i.grabar || "", f, c.dibujo || "", q, c.disp, c.orient, c.tamTxt, c.tamFig];
    if (i.tipo === "lapiz") return ["z", c.modelo, c.color, i.grabar || "", f, c.o1 || "", c.o2 || "", c.sep || "", c.layout || "", c.rep || 1, c.tam || 1, c.sentido || "punta", c.dx || 0, q, c.caja ? 1 : 0];
    if (i.tipo === "metal") { const x = CATALOGO.metal.findIndex(p => p.n === i.producto); if (x >= 0) return ["m", x, i.grabar || "", f, q]; }
    if (i.tipo === "cuaderno") return ["c", c, q];
    const { id, img, ...r } = i; return ["x", r];
  }
  function expandir(a) {
    const fn = id => (FUENTES.find(f => f.id === id) || FUENTES[0]).n;
    if (a[0] === "l") { const p = llaveros().find(x => x.ref === a[1]) || llaveros()[0], b = (a[6] || a[7]) ? { n:a[6] || "", d:a[7] || "" } : null;
      return { tipo:"llavero", ref:p.ref, producto:p.n + " (aprox. 3 a 4 cm)", grabar:a[2], fuente:fn(a[3]), diseno:Llavero.diseno(a[2], a[4], b), cantidad:a[5], cfg:{ dibujo:a[4], fuenteId:a[3], ref:p.ref, ...(b ? { b } : {}) } }; }
    if (a[0] === "p") { const p = tarjetas()[a[1]] || tarjetas()[0];
      return Placa.armarItem({ texto:a[2], fuenteId:a[3], fig:a[4], disp:a[6], orient:a[7], tamTxt:a[8], tamFig:a[9] }, p, a[5]); }
    if (a[0] === "z") return Lapiz.armarItem({ modelo:a[1], color:a[2], nombre:a[3], fuenteId:a[4], o1:a[5], o2:a[6], sep:a[7], layout:a[8], rep:a[9], tam:a[10], sentido:a[11], dx:a[12], caja:!!a[14] }, a[13]);
    if (a[0] === "m") { const p = CATALOGO.metal[a[1]]; return { tipo:"metal", ref:p.ref, producto:p.n, grabar:a[2], fuente:fn(a[3]), cantidad:a[4], cfg:{} }; }
    if (a[0] === "c") { const c = a[1], asig = ASIGNATURAS.find(x => x.id === c.asigId) || {};
      return { tipo:"cuaderno", producto:"Cuaderno escolar personalizado", modelo:asig.n, grabar:c.nombre, fuente:fn(c.fuenteId), diseno:`${(DIBUJOS[c.dibujo] || {}).n} · ${(GeneradorSVG.LAYOUTS[c.layout] || {}).n}`, cantidad:a[2], cfg:c }; }
    return { ...a[1] };
  }

  /* Lo usa el carrito para armar el enlace del mensaje (y el QR de la imagen) */
  function enlace(num, items) {
    // El fragmento # nunca se envía al servidor (a diferencia de ?pedidoc=).
    // En producción se puede fijar la URL pública en PRECIOS.urlPublica.
    const base = (PRECIOS.urlPublica || (location.origin + location.pathname)).replace(/#.*$/, "");
    return base + "#pedidoc=" + enc({ v:2, n:String(num), d:Math.floor(Date.now() / 60000), i:items.map(compactar) });
  }
  function leer(txt) {
    const t = String(txt || "").trim();
    const m = t.match(/#pedidoc=([A-Za-z0-9_-]+)/) || t.match(/^pedidoc=([A-Za-z0-9_-]+)$/);
    const g = guardados(), num = t.replace(/^#/, "");
    if (!m && /^\d{3,6}$/.test(num)) return g[num] || { falta:num };
    try { const d = dec(m ? m[1] : t);
      if (d && d.v === 2 && Array.isArray(d.i)) return { n:String(d.n), d:d.d * 60000, items:d.i.map(expandir) };
      if (d && Array.isArray(d.i)) return { n:String(d.n), d:d.d || 0, items:d.i }; } catch (e) {}
    return null;
  }

  const fid = i => (i.cfg && i.cfg.fuenteId) || (FUENTES.find(f => f.n === i.fuente) || {}).id || "";
  const fotoDe = i => { const nom = String(i.producto).replace(/ \(.*\)$/, ""), p = CATALOGO.metal.concat(CATALOGO.llaveroMadera, CATALOGO.llaveroCuero).find(q => q.n === nom); return p ? p.img : ""; };
  const puede = i => ["llavero", "placa", "cuaderno", "lapiz"].includes(i.tipo);
  const mmLlavero = () => +($("#ped-mm") && $("#ped-mm").value) || 30;
  function svg(i) {
    if (i.tipo === "llavero") return Llavero.descargarItem(i, mmLlavero(), "trazado");
    if (i.tipo === "placa") return Placa.descargar(Placa.estDeItem(i), "trazado", false);
    if (i.tipo === "lapiz") return Lapiz.descargar(Lapiz.estDeItem(i), false);
    if (i.tipo === "cuaderno") return Carrito.descargarSVG(i);
  }
  const copiar = t => { try { navigator.clipboard.writeText(t); } catch (e) {
    const a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select(); document.execCommand("copy"); a.remove(); } };
  const pausa = ms => new Promise(r => setTimeout(r, ms));
  const fechaTxt = t => t ? new Date(t).toLocaleDateString("es-CO", { day:"numeric", month:"long", year:"numeric" }) : "";

  function listaGuardados() {
    const g = guardados(), ks = Object.keys(g).sort((a, b) => g[b].t - g[a].t);
    if (!ks.length) return `<p class="nota">Aún no has abierto ningún pedido en este navegador.</p>`;
    return `<div class="ped-chips">${ks.map(k => `<button type="button" class="tab" data-n="${esc(k)}">#${esc(k)} · ${g[k].items.length} prod.${g[k].d ? " · " + fechaTxt(g[k].d) : ""}</button>`).join("")}</div>
      <button type="button" class="link rojo" id="ped-borrar">Borrar la lista de este navegador</button>`;
  }

  async function tarjeta(i, k) {
    const f = FUENTES.find(x => x.id === fid(i)), graba = i.grabar ? (f && f.mayus ? String(i.grabar).toLocaleUpperCase("es") : i.grabar) : "";
    let mini = "";
    if (i.tipo === "placa" && i.cfg) { try { mini = await Placa.vista(Placa.estDeItem(i), { n:i.cfg.color || i.producto }); } catch (e) {} }
    else if (i.tipo === "lapiz" && i.cfg) { try { mini = await Lapiz.vistaZoom(Lapiz.estDeItem(i)); } catch (e) {} }
    else if (fotoDe(i)) mini = `<img src="${esc(fotoDe(i))}" alt="">`;
    const otras = [["Tipografía", i.fuente], ["Diseño", i.diseno], ["Modelo", i.modelo]].filter(([, v]) => v);
    return `<article class="ped-item"><div class="ped-mini">${mini}</div><div class="ped-info">
      <h3>${esc(i.producto)} <span class="ped-q">× ${+i.cantidad || 1}</span></h3>
      ${otras.map(([a, v]) => `<div><b>${a}:</b> ${esc(v)}</div>`).join("")}
      ${graba ? `<div class="ped-et">${esc(i.etiqueta || "Nombre a grabar").toUpperCase()}</div><div class="ped-grabar" style="font-family:'f-${esc(f ? f.id : "quicksand")}'">${esc(graba)}</div>` : ""}
      <div class="ped-acc">
        ${puede(i) ? `<button type="button" class="btn" data-a="svg" data-k="${k}">⬇ SVG para láser</button>` : `<small>Sin SVG automático: copia el nombre y escríbelo en LightBurn.</small>`}
        ${graba ? `<button type="button" class="btn sec" data-a="copiar" data-k="${k}">📋 Copiar texto</button>` : ""}
        ${f ? `<a class="btn sec" href="assets/tipografias/instalar/${f.id}.ttf" download>🔤 Tipografía</a>` : ""}
      </div></div></article>`;
  }

  async function mostrar(p) {
    actual = p; recordar(p);
    const unid = p.items.reduce((a, i) => a + (+i.cantidad || 1), 0), sub = p.items.reduce((a, i) => a + PRECIOS.precioUnitario(i) * (+i.cantidad || 1), 0);
    const pct = PRECIOS.descuentoPara(unid), total = sub - Math.round(sub * pct / 100), tj = await Promise.all(p.items.map((i, k) => tarjeta(i, k)));
    $("#ped-res").innerHTML = `<div class="ped-cab"><div><b>Pedido #${esc(p.n)}</b><small>${fechaTxt(p.d)} · ${p.items.length} producto(s) · ${unid} unidad(es) · ${PRECIOS.formato(total)}</small></div>
      <div class="ped-cab-acc"><label>Ancho llavero <input id="ped-mm" type="number" value="30" min="10" max="80"> mm</label>
      <button type="button" class="btn" data-a="todos">⬇ Descargar todos los SVG</button></div></div>${tj.join("")}`;
    $("#ped-lista").innerHTML = listaGuardados();
  }

  function buscar(txt) {
    const r = leer(txt), msg = $("#ped-msg"); msg.hidden = false;
    if (!r) { msg.textContent = "No pude leer ese enlace o código. Pega completa la línea «Ver pedido completo» del mensaje de WhatsApp."; return; }
    if (r.falta) { msg.textContent = `El pedido #${r.falta} no está guardado en este navegador. Pega el enlace del mensaje de WhatsApp una vez y quedará guardado.`; return; }
    msg.hidden = true; mostrar(r);
  }

  function init() {
    const raiz = $("#ped-raiz"); if (!raiz) return;
    if (!Llavero.admin) { raiz.innerHTML = ""; return; }
    const nav = $("#nav-pedidos"); if (nav) nav.hidden = false;
    raiz.innerHTML = `<p class="nota">Pega el enlace del pedido, escribe un número ya guardado o carga la imagen PNG que te envió el cliente. El QR se lee en este computador; la imagen no se sube a ningún servidor.</p>
      <div class="ped-buscar"><input type="text" id="ped-in" placeholder="Enlace del pedido o número (ej: 5973)" aria-label="Enlace o número de pedido"><button type="button" class="btn" id="ped-ok">Buscar</button></div>
      <div class="ped-buscar ped-importar"><label class="btn sec" for="ped-imagen">🖼️ Cargar imagen del pedido</label><input type="file" id="ped-imagen" accept="image/*" hidden><span class="nota">Selecciona la foto recibida por WhatsApp para leer su QR.</span></div>
      <p class="nota" id="ped-msg" hidden></p><div id="ped-res"></div><h3>Pedidos abiertos en este navegador</h3><div id="ped-lista">${listaGuardados()}</div>`;
    $("#ped-ok").onclick = () => buscar($("#ped-in").value);
    $("#ped-in").addEventListener("keydown", e => { if (e.key === "Enter") buscar(e.target.value); });
    $("#ped-imagen").addEventListener("change", async e => {
      const archivo = e.target.files && e.target.files[0]; if (!archivo) return;
      const msg = $("#ped-msg"); msg.hidden = false; msg.textContent = "Leyendo el código QR de la imagen…";
      try {
        // jsQR procesa los píxeles localmente. La fotografía nunca se envía a Internet.
        if (typeof window.jsQR !== "function") {
          throw new Error("No se cargó el lector QR. Comprueba que el archivo js/jsQR.js esté disponible y vuelve a cargar la página (Ctrl+F5).");
        }
        const url = URL.createObjectURL(archivo);
        try {
          const img = new Image();
          img.src = url;
          await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = () => reject(new Error("No pude abrir esa imagen. Prueba con JPG o PNG.")); });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { willReadFrequently:true });
          // Reducir imágenes gigantes para evitar consumir demasiada memoria.
          const escala = Math.min(1, 1800 / Math.max(img.naturalWidth, img.naturalHeight));
          canvas.width = Math.max(1, Math.round(img.naturalWidth * escala));
          canvas.height = Math.max(1, Math.round(img.naturalHeight * escala));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let codigo = window.jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts:"attemptBoth" });
          if (!codigo) {
            // Segundo intento a mayor resolución para QR pequeño dentro de una imagen grande.
            canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            const full = ctx.getImageData(0, 0, canvas.width, canvas.height);
            codigo = window.jsQR(full.data, full.width, full.height, { inversionAttempts:"attemptBoth" });
          }
          if (!codigo || !codigo.data) throw new Error("No encontré un QR legible. Selecciona la imagen original del pedido, sin recortarla ni comprimirla.");
          $("#ped-in").value = codigo.data;
          buscar(codigo.data);
        } finally { URL.revokeObjectURL(url); }
      } catch (err) { msg.hidden = false; msg.textContent = err.message || "No fue posible leer la imagen."; }
      e.target.value = "";
    });
    raiz.addEventListener("click", async e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.n) { $("#ped-in").value = b.dataset.n; buscar(b.dataset.n); }
      else if (b.id === "ped-borrar") { try { localStorage.removeItem(KEY); } catch (er) {} $("#ped-lista").innerHTML = listaGuardados(); }
      else if (b.dataset.a === "svg" && actual) svg(actual.items[b.dataset.k]);
      else if (b.dataset.a === "copiar" && actual) { copiar(actual.items[b.dataset.k].grabar || ""); const t = b.textContent; b.textContent = "✓ Copiado"; setTimeout(() => b.textContent = t, 1200); }
      else if (b.dataset.a === "todos" && actual) {
        b.disabled = true; const t = b.textContent;
        for (const i of actual.items.filter(puede)) { b.textContent = "Descargando…"; await svg(i); await pausa(600); }
        b.disabled = false; b.textContent = t;
      }
    });
    // Pedido recibido únicamente en el fragmento URL: #pedidoc=... (no se envía al servidor).
    const hashPedido = location.hash.match(/^#pedidoc=([A-Za-z0-9_-]+)/);
    if (hashPedido && Llavero.admin) { $("#ped-in").value = location.href; buscar(location.href); }
  }
  return { init, enlace };
})();
