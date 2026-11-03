/* Configurador de cuadernos: estado -> GeneradorSVG -> vista previa + descarga + carrito */
const Configurador = (() => {
  const $ = s => document.querySelector(s);
  const col = { kraft:"#d9b98c", blanco:"#f1ece2", negro:"#2b2622", madera:"#c99a62" };
  const est = { asigId:"mat", dibujo:"compas", nombre:"Tu Nombre", fuenteId:"great-vibes", tam:1, dx:0, dy:0,
                layout:"clasica", marco:"simple", contorno:false, mostrarAsig:true, escala:1, dosLineas:false, color:"kraft", chispas:true };
  let token = 0;

  const cfgCompleta = () => ({ ...est, asig: ASIGNATURAS.find(a => a.id === est.asigId), fuente: FUENTES.find(f => f.id === est.fuenteId) });

  async function pintar() {
    const mi = ++token, c = cfgCompleta();
    const [vista, tec] = await Promise.all([GeneradorSVG.construir(c, "vista", { colorPortada: col[est.color] }), GeneradorSVG.construir(c, "tecnico")]);
    if (mi !== token) return;
    $("#vista").innerHTML = vista;
    $("#tecnico").innerHTML = tec.replace(/^<\?xml[^>]*>\s*/, "").replace(/<svg /, '<svg style="background:#fff" ');
    $("#precio-cuaderno").textContent = PRECIOS.formato(PRECIOS.precioUnitario({ tipo:"cuaderno", cfg:est }));
  }

  function dibujosGrid() {
    const a = ASIGNATURAS.find(x => x.id === est.asigId);
    if (!a.dib.includes(est.dibujo)) est.dibujo = a.dib[0];
    $("#dib-grid").innerHTML = a.dib.map(id => `<button class="dib ${id === est.dibujo ? "sel" : ""}" data-d="${id}" title="${DIBUJOS[id].n}">
      <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${DIBUJOS[id].d}</svg></button>`).join("");
  }
  function fuentesGrid() {
    $("#fuente-grid").innerHTML = FUENTES.map(f => `<button class="fuente ${f.id === est.fuenteId ? "sel" : ""}" data-f="${f.id}" style="font-family:'f-${f.id}'">
      <span>${f.mayus ? "AaBb" : "Aa"}</span><small>${f.n}</small></button>`).join("");
  }

  const centrar = c => { const e = document.querySelector(c + " .sel"); if (e && e.scrollIntoView) e.scrollIntoView({ block:"nearest", inline:"center", behavior:"smooth" }); };
  function sync() { $("#sel-layout").value = est.layout; $("#sel-marco").value = est.marco; $("#sel-color").value = est.color; $("#ck-chispas").checked = est.chispas; dibujosGrid(); fuentesGrid(); pintar(); }
  function azar() {
    const r = a => a[Math.random() * a.length | 0], a = ASIGNATURAS.find(x => x.id === est.asigId);
    est.dibujo = r(a.dib); est.fuenteId = r(FUENTES).id; est.layout = r(Object.keys(GeneradorSVG.LAYOUTS));
    est.marco = r(["simple", "doble", "esquinas"]); est.color = r(["kraft", "blanco", "madera"]); est.chispas = Math.random() > .3; sync();
  }
  function init() {
    $("#sel-asig").innerHTML = ASIGNATURAS.map(a => `<option value="${a.id}">${a.n}</option>`).join("");
    $("#sel-layout").innerHTML = Object.entries(GeneradorSVG.LAYOUTS).map(([k, v]) => `<option value="${k}">${v.n}</option>`).join("");
    dibujosGrid(); fuentesGrid();
    const bind = (id, k, tipo) => $(id).addEventListener("input", e => {
      const v = tipo === "bool" ? e.target.checked : tipo === "num" ? parseFloat(e.target.value) : e.target.value;
      est[k] = v; if (k === "asigId") dibujosGrid(); pintar(); });
    bind("#sel-asig", "asigId"); bind("#in-nombre", "nombre"); bind("#sel-layout", "layout"); bind("#sel-marco", "marco"); bind("#sel-color", "color");
    bind("#rg-tam", "tam", "num"); bind("#rg-x", "dx", "num"); bind("#rg-y", "dy", "num"); bind("#rg-esc", "escala", "num");
    bind("#ck-contorno", "contorno", "bool"); bind("#ck-asig", "mostrarAsig", "bool"); bind("#ck-dos", "dosLineas", "bool"); bind("#ck-chispas", "chispas", "bool");
    $("#dib-grid").onclick = e => { const b = e.target.closest("[data-d]"); if (b) { est.dibujo = b.dataset.d; dibujosGrid(); pintar(); } };
    $("#fuente-grid").onclick = e => { const b = e.target.closest("[data-f]"); if (b) { est.fuenteId = b.dataset.f; fuentesGrid(); pintar(); } };
    $("#btn-azar").onclick = azar;
    $("#btn-otraletra").onclick = () => { const o = FUENTES.filter(f => f.id !== est.fuenteId); est.fuenteId = o[Math.random() * o.length | 0].id; fuentesGrid(); pintar(); centrar("#fuente-grid"); };
    $("#btn-otradib").onclick = () => { const o = ASIGNATURAS.find(x => x.id === est.asigId).dib.filter(d => d !== est.dibujo); if (!o.length) return; est.dibujo = o[Math.random() * o.length | 0]; dibujosGrid(); pintar(); centrar("#dib-grid"); };
    $("#btn-descargar").onclick = async () => {
      const svg = await GeneradorSVG.construir(cfgCompleta(), "tecnico"), a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([svg], { type:"image/svg+xml" }));
      a.download = `cuaderno-${est.asigId}-${(est.nombre || "diseno").replace(/\W+/g, "_")}.svg`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    $("#btn-agregar").onclick = () => {
      const c = cfgCompleta();
      Carrito.agregar({ tipo:"cuaderno", producto:"Cuaderno escolar personalizado", modelo:c.asig.n, grabar:est.nombre,
        fuente:c.fuente.n, diseno:`${DIBUJOS[est.dibujo].n} · ${GeneradorSVG.LAYOUTS[est.layout].n}`, cfg:{ ...est } });
    };
    $("#in-nombre").value = est.nombre; $("#sel-asig").value = est.asigId;
    pintar();
  }
  return { init };
})();
