/* Navegación, catálogo y arranque */
const $ = s => document.querySelector(s);
function ver(vista) {
  document.querySelectorAll("[data-vista]").forEach(s => s.hidden = s.dataset.vista !== vista);
  document.querySelectorAll("[data-ir]").forEach(a => a.classList.toggle("activo", a.dataset.ir === vista));
  window.scrollTo({ top:0, behavior:"smooth" });
  if (location.hash !== "#" + vista) history.replaceState(null, "", "#" + vista);
}
function tarjetas(lista, tipo, cont) {
  $(cont).innerHTML = lista.map((p, i) => `<article class="card">
    <div class="foto"><img src="${p.img}" alt="${p.n}" loading="lazy"><span class="ref">Foto de referencia</span></div>
    <h3>${p.n}</h3><div class="precio">${PRECIOS.formato(PRECIOS.precioUnitario({ tipo, ref:p.ref }))}</div>
    <input type="text" placeholder="Nombre a grabar" maxlength="30" aria-label="Nombre a grabar">
    <select aria-label="Tipografía">${FUENTES.map(f => `<option>${f.n}</option>`).join("")}</select>
    <button class="btn" data-i="${i}">Agregar al carrito</button></article>`).join("");
  $(cont).onclick = e => {
    const b = e.target.closest("button[data-i]"); if (!b) return;
    const c = b.closest(".card"), p = lista[b.dataset.i], nombre = c.querySelector("input").value.trim();
    if (!nombre) { c.querySelector("input").focus(); return; }
    Carrito.agregar({ tipo, ref:p.ref, producto:p.n, grabar:nombre, fuente:c.querySelector("select").value, cfg:{} });
  };
}
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-ir]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); ver(a.dataset.ir); }));
  tarjetas(CATALOGO.llaveroMadera, "llavero", "#grid-madera");
  tarjetas(CATALOGO.llaveroCuero, "llavero", "#grid-cuero");
  tarjetas(CATALOGO.metal, "metal", "#grid-metal");
  Carrito.init(); Configurador.init();
  const h = location.hash.slice(1); ver(document.querySelector(`[data-vista="${h}"]`) ? h : "inicio");
});
