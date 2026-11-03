/* Visor de fotos a pantalla completa (pensado para celular).
   Uso: ponga data-zoom="grupo" en cualquier <img>. Al tocarla se abre en grande;
   se pasa a la siguiente/anterior con las flechas o deslizando el dedo; se cierra con ✕, tocando el fondo o Esc. */
const Visor = (() => {
  let caja, img, cont, lista = [], k = 0, x0 = null;
  const crear = () => {
    caja = document.createElement("div"); caja.className = "visor"; caja.hidden = true; caja.setAttribute("role", "dialog"); caja.setAttribute("aria-label", "Foto ampliada");
    caja.innerHTML = '<button type="button" class="vz-x" aria-label="Cerrar">✕</button><button type="button" class="vz-f vz-ant" aria-label="Anterior">‹</button><img alt=""><button type="button" class="vz-f vz-sig" aria-label="Siguiente">›</button><div class="vz-n"></div>';
    document.body.appendChild(caja); img = caja.querySelector("img"); cont = caja.querySelector(".vz-n");
    caja.addEventListener("click", e => {
      if (e.target.closest(".vz-x") || e.target === caja) cerrar();
      else if (e.target.closest(".vz-ant")) ir(-1);
      else if (e.target.closest(".vz-sig")) ir(1);
    });
    caja.addEventListener("touchstart", e => { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive:true });
    caja.addEventListener("touchend", e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(d) > 50) ir(d < 0 ? 1 : -1); });
    document.addEventListener("keydown", e => { if (caja.hidden) return; if (e.key === "Escape") cerrar(); else if (e.key === "ArrowLeft") ir(-1); else if (e.key === "ArrowRight") ir(1); });
  };
  function mostrar() {
    const it = lista[k]; img.src = it.src; img.alt = it.alt; cont.textContent = lista.length > 1 ? `${k + 1} de ${lista.length}` : "";
    caja.classList.toggle("uno", lista.length < 2);
  }
  function ir(d) { if (lista.length < 2) return; k = (k + d + lista.length) % lista.length; mostrar(); }
  function abrir(items, i) { if (!caja) crear(); lista = items; k = i || 0; mostrar(); caja.hidden = false; document.body.classList.add("sin-scroll"); caja.querySelector(".vz-x").focus(); }
  function cerrar() { caja.hidden = true; img.removeAttribute("src"); if (document.getElementById("drawer").hidden) document.body.classList.remove("sin-scroll"); }
  document.addEventListener("click", e => {
    const im = e.target.closest("img[data-zoom]"); if (!im) return;
    const g = im.dataset.zoom, grupo = [...document.querySelectorAll(`img[data-zoom="${g}"]`)].filter(q => q.offsetParent !== null || q === im);
    abrir(grupo.map(q => ({ src:q.dataset.full || q.currentSrc || q.src, alt:q.alt })), Math.max(0, grupo.indexOf(im)));
  });
  return { abrir, cerrar };
})();
