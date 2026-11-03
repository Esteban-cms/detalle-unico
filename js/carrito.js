/* Carrito en localStorage (solo en el navegador del cliente) + mensaje de WhatsApp */
const Carrito = (() => {
  const KEY = "tienda_carrito_v1";
  let items = [];
  try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { items = []; }
  const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} render(); };
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));

  function agregar(it) { it.id = Date.now() + Math.random(); it.cantidad = it.cantidad || 1; items.push(it); guardar(); abrir(true); }
  function totales() {
    const unidades = items.reduce((a, i) => a + i.cantidad, 0);
    const sub = items.reduce((a, i) => a + PRECIOS.precioUnitario(i) * i.cantidad, 0);
    const pct = PRECIOS.descuentoPara(unidades), desc = Math.round(sub * pct / 100);
    return { unidades, sub, pct, desc, total: sub - desc };
  }
  function lineas(i) {
    const out = [["Producto", i.producto]];
    if (i.modelo) out.push(["Modelo", i.modelo]);
    if (i.grabar) out.push([i.etiqueta || "Nombre a grabar", i.grabar]);
    if (i.fuente) out.push(["Tipografía", i.fuente]);
    if (i.diseno) out.push(["Diseño", i.diseno]);
    return out;
  }
  function render() {
    $("#cart-count").textContent = items.reduce((a, i) => a + i.cantidad, 0);
    const t = totales(), box = $("#cart-items");
    if (!items.length) { box.innerHTML = '<p class="vacio">Tu carrito está vacío.</p>'; }
    else box.innerHTML = items.map(i => {
      const pu = PRECIOS.precioUnitario(i);
      return `<div class="cart-item"><div class="ci-mini" data-mini="${i.id}">${MINI[i.id] ? `<img src="${MINI[i.id]}" alt="Vista del producto personalizado">` : '<span class="ci-cargando"></span>'}</div><div class="ci-info">${lineas(i).map(([k, v]) => `<div><b>${k}:</b> ${esc(v)}</div>`).join("")}
        <div class="ci-precio">${PRECIOS.formato(pu)} c/u · Subtotal ${PRECIOS.formato(pu * i.cantidad)}</div>
        <div class="ci-acc"><button data-q="-1" data-id="${i.id}">−</button><span>${i.cantidad}</span><button data-q="1" data-id="${i.id}">+</button>
        ${i.tipo === "cuaderno" ? `<button class="link" data-svg="${i.id}">Descargar SVG</button>` : ""}${i.tipo === "placa" && Llavero.admin ? `<button class="link" data-pl="${i.id}">SVG láser</button>` : ""}${i.tipo === "lapiz" && Llavero.admin ? `<button class="link" data-lp="${i.id}">SVG láser</button>` : ""}${i.tipo === "llavero" && i.cfg && Llavero.admin ? `<button class="link" data-lv="${i.id}">SVG láser</button>` : ""}
        <button class="link rojo" data-del="${i.id}">Eliminar</button></div></div></div>`; }).join("");
    miniaturas();
    $("#cart-total").innerHTML = items.length ? `<div>Subtotal: ${PRECIOS.formato(t.sub)}</div>` +
      (t.pct ? `<div>Descuento ${t.pct}%: −${PRECIOS.formato(t.desc)}</div>` : "") + `<strong>Total: ${PRECIOS.formato(t.total)}</strong>` : "";
    $("#btn-finalizar").disabled = !items.length;
  }
  /* Miniaturas del producto personalizado (se generan en el navegador y se guardan solo en memoria) */
  const MINI = {}, haciendo = new Set();
  function miniaturas() {
    if (typeof PedidoImg === "undefined" || !PedidoImg.miniatura) return;
    items.forEach(i => {
      if (MINI[i.id] || haciendo.has(i.id)) return;
      haciendo.add(i.id);
      PedidoImg.miniatura(i).then(url => {
        haciendo.delete(i.id); if (!url) return; MINI[i.id] = url;
        const el = document.querySelector(`[data-mini="${i.id}"]`); if (el) el.innerHTML = `<img src="${url}" alt="Vista del producto personalizado">`;
      });
    });
  }
  let pedidoNum = "", pedidoLink = "";
  function mensaje() {
    const t = totales();
    let m = (pedidoNum ? `*Pedido #${pedidoNum}*\n` : "") + PRECIOS.whatsappSaludo + "\n\n";
    items.forEach((i, n) => {
      const pu = PRECIOS.precioUnitario(i);
      m += `*${n + 1}. ${i.producto}*\n` + lineas(i).slice(1).map(([k, v]) => `${k}: ${v}`).join("\n") +
           `\nCantidad: ${i.cantidad}\nPrecio unitario: ${PRECIOS.formato(pu)}\nSubtotal: ${PRECIOS.formato(pu * i.cantidad)}\n` +
           (i.tipo === "cuaderno" ? "(Enviaré el archivo SVG del diseño)\n" : "") + "\n";
    });
    if (t.pct) m += `Descuento ${t.pct}%: -${PRECIOS.formato(t.desc)}\n`;
    return m + `*TOTAL: ${PRECIOS.formato(t.total)}*\n\nVer pedido completo (para el taller): ` + pedidoLink;
  }
  async function descargarSVG(i) {
    const cfg = { ...i.cfg, asig: ASIGNATURAS.find(a => a.id === i.cfg.asigId), fuente: FUENTES.find(f => f.id === i.cfg.fuenteId) };
    const svg = await GeneradorSVG.construir(cfg, "tecnico");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    a.download = `cuaderno-${cfg.asig.id}-${(cfg.nombre || "diseno").replace(/\W+/g, "_")}.svg`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function abrir(v) { $("#cart").classList.toggle("abierto", v); }
  function init() {
    $("#btn-cart").onclick = () => abrir(true);
    $("#cart-cerrar").onclick = () => abrir(false);
    $("#cart-seguir").onclick = () => abrir(false);
    $("#cart-items").onclick = e => {
      const b = e.target, id = b.dataset.id || b.dataset.del || b.dataset.svg || b.dataset.lv || b.dataset.pl || b.dataset.lp;
      const it = items.find(x => String(x.id) === id);
      if (!it) return;
      if (b.dataset.q) { it.cantidad = Math.max(1, it.cantidad + +b.dataset.q); guardar(); }
      if (b.dataset.del) { items = items.filter(x => x !== it); guardar(); }
      if (b.dataset.svg) descargarSVG(it);
      if (b.dataset.lp) Lapiz.descargar(Lapiz.estDeItem(it), false);
      if (b.dataset.pl) Placa.descargar(Placa.estDeItem(it), "trazado", false);
      if (b.dataset.lv) Llavero.descargar({ nombre:it.grabar, fuenteId:it.cfg.fuenteId || (FUENTES.find(q => q.n === it.fuente) || {}).id, dib:it.cfg.dibujo }, it.ref || it.cfg.ref, 30);
    };
    $("#btn-finalizar").onclick = () => { pedidoNum = PedidoImg.numero(); pedidoLink = Pedidos.enlace(pedidoNum, items); $("#wa-texto").value = mensaje(); $("#wa-modal").classList.add("abierto"); };
    $("#wa-cancelar").onclick = () => $("#wa-modal").classList.remove("abierto");
    $("#wa-img").onclick = async e => {
      const b = e.target, t = b.textContent; b.disabled = true; b.textContent = "Creando imagen…";
      try {
        const blob = await PedidoImg.generar(items, totales(), pedidoNum, lineas, pedidoLink), f = new File([blob], `pedido-${pedidoNum}.png`, { type:"image/png" });
        if (navigator.canShare && navigator.canShare({ files:[f] })) { try { await navigator.share({ files:[f], text:`Pedido #${pedidoNum}` }); return; } catch (er) { if (er.name === "AbortError") return; } }
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = f.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      } finally { b.disabled = false; b.textContent = t; }
    };
    $("#wa-copiar").onclick = () => navigator.clipboard?.writeText($("#wa-texto").value);
    $("#wa-enviar").onclick = () => {
      const n = (PRECIOS.whatsappNumero || "").replace(/\D/g, "");
      window.open(`https://wa.me/${n}?text=${encodeURIComponent($("#wa-texto").value)}`, "_blank", "noopener");
    };
    render();
  }
  return { agregar, init, abrir, descargarSVG };
})();
