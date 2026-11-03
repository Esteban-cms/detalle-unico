/* Navegación, catálogo y arranque */
const $ = s => document.querySelector(s);
function ver(vista) {
  document.querySelectorAll("[data-vista]").forEach(s => s.hidden = s.dataset.vista !== vista);
  document.querySelectorAll("[data-ir]").forEach(a => a.classList.toggle("activo", a.dataset.ir === vista));
  window.scrollTo({ top:0, behavior:"smooth" });
  requestAnimationFrame(() => { Llavero.repintar(); revelar(); });
  // No sobrescribir los fragmentos que transportan pedidos/diseños. Nunca se usan parámetros ? para datos personales.
  if (!location.hash.startsWith("#pedidoc=") && !location.hash.startsWith("#pedido=") && !location.hash.startsWith("#placa=") && location.hash !== "#" + vista) history.replaceState(null, "", "#" + vista);
}
/* Grupos dentro de "Llaveros, placas y metal": se muestra uno a la vez para no hacer scroll largo en el celular */
function grupoLlaveros(g) {
  const sec = document.querySelector('[data-vista="llaveros"]'); if (!sec || !sec.querySelector(`[data-g="${g}"]`)) return;
  sec.querySelectorAll("[data-g]").forEach(d => d.hidden = d.dataset.g !== g);
  sec.querySelectorAll(".grupo").forEach(b => { const on = b.dataset.grupo === g; b.classList.toggle("sel", on); b.setAttribute("aria-selected", on); });
  requestAnimationFrame(() => { Llavero.repintar(); revelar(); });
}
/* Animación de aparición al hacer scroll */
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold:.08 }) : null;
function revelar() { document.querySelectorAll(".card,.cat,.paneles,.prev-bloque").forEach(el => { el.classList.add("rev"); io ? io.observe(el) : el.classList.add("in"); }); }
function tarjetas(lista, tipo, cont) {
  $(cont).innerHTML = lista.map((p, i) => tipo === "metal" ? `<article class="card metal-card" data-producto="${i}">
    <div class="foto"><img src="${p.img}" alt="${p.n}" loading="lazy" class="ampliable"><span class="ref">Toca para ampliar</span></div>
    <h3>${p.n}</h3><div class="precio">${PRECIOS.formato(PRECIOS.precioUnitario({ tipo, ref:p.ref }))}</div>
    <button class="btn" data-i="${i}">✨ Personalizar esta pieza</button></article>` : `<article class="card" data-producto="${i}">
    <div class="foto"><img src="${p.img}" alt="${p.n}" loading="lazy" class="ampliable"><span class="ref">Foto de referencia · toca para ampliar</span></div>
    <h3>${p.n}</h3><div class="precio">${PRECIOS.formato(PRECIOS.precioUnitario({ tipo, ref:p.ref }))}</div>
    <input type="text" placeholder="Nombre a grabar" maxlength="30" aria-label="Nombre a grabar">
    <select aria-label="Tipografía">${FUENTES.map(f => `<option style="font-family:'f-${f.id}'">${f.n}</option>`).join("")}</select>
    <div class="vista-letra" style="font-family:'f-great-vibes'" aria-live="polite">Tu nombre</div>
    <button class="btn" data-i="${i}"><span class="t-lg">Agregar al carrito</span><span class="t-sm">🛒 Agregar</span></button></article>`).join("");
  const letra = c => { const f = FUENTES.find(x => x.n === c.querySelector("select").value) || FUENTES[0], v = c.querySelector(".vista-letra"), t = c.querySelector("input").value.trim() || "Tu nombre";
    v.style.fontFamily = `'f-${f.id}'`; v.textContent = f.mayus ? t.toLocaleUpperCase("es") : t; v.style.opacity = c.querySelector("input").value.trim() ? 1 : .45; c.querySelector("input").style.fontFamily = `'f-${f.id}'`; };
  if (tipo !== "metal") $(cont).querySelectorAll(".card").forEach(c => { c.addEventListener("input", () => letra(c)); c.addEventListener("change", () => letra(c)); letra(c); });
  $(cont).onclick = e => {
    const b = e.target.closest("button[data-i]");
    if (tipo === "metal") {
      const card = e.target.closest(".card");
      if (card) abrirMetal(lista[card.dataset.producto ? +card.dataset.producto : (b ? +b.dataset.i : 0)], lista, cont);
      return;
    }
    if (!b) return;
    const c = b.closest(".card"), p = lista[b.dataset.i], nombre = c.querySelector("input").value.trim();
    if (!nombre) { c.querySelector("input").focus(); return; }
    Carrito.agregar({ tipo, ref:p.ref, producto:p.n, img:p.img, grabar:nombre, fuente:c.querySelector("select").value, cfg:{} });
  };
}

/* Vista de detalle para colgantes: una pieza a la vez, navegación y regreso al catálogo */
let metalOverlay, metalActual = 0, metalLista = [];
function abrirMetal(p, lista, cont) {
  metalLista = lista || metalLista;
  metalActual = Math.max(0, metalLista.indexOf(p));
  if (!metalOverlay) {
    metalOverlay = document.createElement("div");
    metalOverlay.className = "metal-detalle-modal";
    metalOverlay.innerHTML = `<div class="metal-detalle-panel" role="dialog" aria-modal="true" aria-label="Personalizar pieza">
      <button class="detalle-cerrar" aria-label="Volver al catálogo">← Todos los colgantes</button>
      <div class="detalle-cab"><button type="button" data-prev aria-label="Pieza anterior">‹</button><span class="detalle-contador"></span><button type="button" data-next aria-label="Pieza siguiente">›</button></div>
      <img class="detalle-foto ampliable" alt="Pieza seleccionada">
      <h2 class="detalle-titulo"></h2><p class="detalle-precio"></p>
      <label>Nombre o texto para grabar<input class="detalle-nombre" maxlength="30" placeholder="Escribe aquí el nombre"></label>
      <label>Tipo de letra<select class="detalle-fuente"></select></label>
      <div class="detalle-vista"></div>
      <div class="detalle-acciones"><button type="button" class="btn sec" data-azar>🎲 Letra aleatoria</button><button type="button" class="btn" data-add>Agregar al carrito</button></div>
    </div>`;
    document.body.appendChild(metalOverlay);
    metalOverlay.addEventListener("click",e=>{
      if(e.target===metalOverlay || e.target.closest(".detalle-cerrar")) { metalOverlay.classList.remove("abierto"); return; }
      if(e.target.closest("[data-prev]")) { metalActual=(metalActual-1+metalLista.length)%metalLista.length; renderMetal(); }
      if(e.target.closest("[data-next]")) { metalActual=(metalActual+1)%metalLista.length; renderMetal(); }
      if(e.target.closest("[data-azar]")) { const sel=metalOverlay.querySelector(".detalle-fuente"); sel.selectedIndex=Math.floor(Math.random()*sel.options.length); renderMetalLetra(); }
      if(e.target.closest("[data-add]")) {
        const p=metalLista[metalActual], nombre=metalOverlay.querySelector(".detalle-nombre").value.trim();
        if(!nombre){metalOverlay.querySelector(".detalle-nombre").focus();return;}
        Carrito.agregar({tipo:"metal",ref:p.ref,producto:p.n,img:p.img,grabar:nombre,fuente:metalOverlay.querySelector(".detalle-fuente").selectedOptions[0].text,cfg:{}});
        metalOverlay.classList.remove("abierto");
      }
    });
    metalOverlay.querySelector(".detalle-nombre").addEventListener("input",renderMetalLetra);
    metalOverlay.querySelector(".detalle-fuente").addEventListener("change",renderMetalLetra);
  }
  if (!metalOverlay.classList.contains("abierto")) metalOverlay.querySelector(".detalle-nombre").value="";
  metalOverlay.classList.add("abierto"); renderMetal();
}
function renderMetal(){
  if(!metalOverlay || !metalLista.length)return;
  const p=metalLista[metalActual], panel=metalOverlay.querySelector(".metal-detalle-panel");
  panel.querySelector(".detalle-foto").src=p.img; panel.querySelector(".detalle-foto").alt=p.n;
  panel.querySelector(".detalle-titulo").textContent=p.n;
  panel.querySelector(".detalle-precio").textContent=PRECIOS.formato(PRECIOS.precioUnitario({tipo:"metal",ref:p.ref}))+" · grabado incluido";
  panel.querySelector(".detalle-contador").textContent=`Pieza ${metalActual+1} de ${metalLista.length}`;
  panel.querySelector(".detalle-fuente").innerHTML=FUENTES.map(f=>`<option value="${f.id}" style="font-family:'f-${f.id}'">${f.n}</option>`).join("");
  renderMetalLetra();
}
function renderMetalLetra(){
  if(!metalOverlay)return;
  const panel=metalOverlay.querySelector(".metal-detalle-panel"), sel=panel.querySelector(".detalle-fuente"), f=FUENTES.find(x=>x.id===sel.value)||FUENTES[0], n=panel.querySelector(".detalle-nombre").value.trim()||"Tu nombre", v=panel.querySelector(".detalle-vista");
  v.textContent=f.mayus?n.toLocaleUpperCase("es"):n; v.style.fontFamily=`'f-${f.id}'`;
}
/* Lightbox para ampliar fotos y ejemplos en móvil o escritorio */
let fotoOverlay;
function ampliarFoto(img){
  if(!fotoOverlay){fotoOverlay=document.createElement("div");fotoOverlay.className="foto-lightbox";fotoOverlay.innerHTML='<button type="button" aria-label="Cerrar imagen">✕</button><img alt="Imagen ampliada"><small>Toca fuera de la imagen para cerrar</small>';document.body.appendChild(fotoOverlay);
    fotoOverlay.addEventListener("click",e=>{if(e.target===fotoOverlay||e.target.closest("button"))fotoOverlay.classList.remove("abierto");});
    document.addEventListener("keydown",e=>{if(e.key==="Escape"){fotoOverlay.classList.remove("abierto");metalOverlay?.classList.remove("abierto");}});
  }
  fotoOverlay.querySelector("img").src=img.src;fotoOverlay.querySelector("img").alt=img.alt||"Imagen ampliada";fotoOverlay.classList.add("abierto");
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click",e=>{const im=e.target.closest("img.ampliable, .lp-ej img, .foto img");if(im && !e.target.closest(".metal-detalle-modal") && !e.target.closest("#grid-metal")){e.preventDefault();ampliarFoto(im);}});
  document.querySelectorAll("[data-ir]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); ver(a.dataset.ir); if (a.dataset.grupo) grupoLlaveros(a.dataset.grupo); }));
  document.querySelectorAll(".grupo").forEach(b => b.addEventListener("click", () => grupoLlaveros(b.dataset.grupo)));
  Llavero.configurador("#conf-llavero", CATALOGO.llaveroMadera.concat(CATALOGO.llaveroCuero)); Llavero.hero();
  Placa.configurador("#conf-placa", CATALOGO.metal.filter(p => p.ref === "tarjeta"));
  Lapiz.configurador("#conf-lapiz");
  tarjetas(CATALOGO.metal.filter(p => p.ref !== "tarjeta"), "metal", "#grid-metal");
  Carrito.init(); Configurador.init(); Pedidos.init();
  const dr = $("#drawer"), menu = v => { dr.hidden = !v; document.body.classList.toggle("sin-scroll", v); $("#btn-menu").setAttribute("aria-expanded", v); };   // menú ☰ (celular)
  $("#btn-menu").onclick = () => menu(true);
  dr.addEventListener("click", e => { if (e.target.closest("[data-cerrar]") || e.target.closest("a[data-ir]")) menu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") menu(false); });
  if (Llavero.admin) $("#nav-pedidos-m").hidden = false;
  const traePedido = location.hash.startsWith("#pedidoc=");
  const traeDiseno = location.hash.startsWith("#pedido=") || location.hash.startsWith("#placa=");
  let h = traePedido ? "pedidos" : (traeDiseno ? "llaveros" : location.hash.slice(1));
  if (h === "pedidos" && !Llavero.admin) h = "inicio";
  ver(document.querySelector(`[data-vista="${h}"]`) ? h : "inicio");
});
