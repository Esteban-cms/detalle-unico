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
  $(cont).innerHTML = lista.map((p, i) => `<article class="card">
    <div class="foto"><img src="${p.img}" alt="${p.n}" loading="lazy"><span class="ref">Foto de referencia</span></div>
    <h3>${p.n}</h3><div class="precio">${PRECIOS.formato(PRECIOS.precioUnitario({ tipo, ref:p.ref }))}</div>
    <input type="text" placeholder="Nombre a grabar" maxlength="30" aria-label="Nombre a grabar">
    <select aria-label="Tipografía">${FUENTES.map(f => `<option style="font-family:'f-${f.id}'">${f.n}</option>`).join("")}</select>
    <div class="vista-letra" style="font-family:'f-great-vibes'" aria-live="polite">Tu nombre</div>
    <button class="btn" data-i="${i}"><span class="t-lg">Agregar al carrito</span><span class="t-sm">🛒 Agregar</span></button></article>`).join("");
  const letra = c => { const f = FUENTES.find(x => x.n === c.querySelector("select").value) || FUENTES[0], v = c.querySelector(".vista-letra"), t = c.querySelector("input").value.trim() || "Tu nombre";
    v.style.fontFamily = `'f-${f.id}'`; v.textContent = f.mayus ? t.toLocaleUpperCase("es") : t; v.style.opacity = c.querySelector("input").value.trim() ? 1 : .45; c.querySelector("input").style.fontFamily = `'f-${f.id}'`; };
  $(cont).querySelectorAll(".card").forEach(c => { c.addEventListener("input", () => letra(c)); c.addEventListener("change", () => letra(c)); letra(c); });
  $(cont).onclick = e => {
    const b = e.target.closest("button[data-i]"); if (!b) return;
    const c = b.closest(".card"), p = lista[b.dataset.i], nombre = c.querySelector("input").value.trim();
    if (!nombre) { c.querySelector("input").focus(); return; }
    Carrito.agregar({ tipo, ref:p.ref, producto:p.n, img:p.img, grabar:nombre, fuente:c.querySelector("select").value, cfg:{} });
  };
}
document.addEventListener("DOMContentLoaded", () => {
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
