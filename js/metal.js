/* Colgantes, pulseras y otros de metal: primero se ve la lista; al tocar una pieza se abre SOLA, en grande,
   para personalizarla. Con las flechas ‹ › (o deslizando la foto) se pasa a la siguiente pieza con el mismo entorno,
   y el botón «Todos los colgantes» vuelve a la lista. El nombre y la letra elegidos se conservan al cambiar de pieza. */
const Metal = (() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
  function configurador(sel, lista) {
    const raiz = document.querySelector(sel); if (!raiz) return;
    let k = 0, fuenteId = "great-vibes", x0 = null;
    raiz.innerHTML = `<div class="mt">
      <div class="mt-lista" id="mt-lista">${lista.map((p, i) => `<button type="button" class="mt-card" data-i="${i}"><span class="mt-img"><img src="${p.img}" alt="${esc(p.n)}" loading="lazy"></span><b>${esc(p.n)}</b><span class="precio">${PRECIOS.formato(PRECIOS.precioUnitario({ tipo:"metal", ref:p.ref }))}</span><span class="mt-elegir">Personalizar →</span></button>`).join("")}</div>
      <div class="mt-pieza" id="mt-pieza" hidden>
        <div class="mt-top"><button type="button" class="btn sec" id="mt-volver">← Todos los colgantes</button><span class="mt-cont" id="mt-cont"></span></div>
        <div class="mt-foto" id="mt-foto">
          <button type="button" class="mt-flecha izq" id="mt-ant" aria-label="Pieza anterior">‹</button>
          <img id="mt-img" alt="">
          <button type="button" class="mt-flecha der" id="mt-sig" aria-label="Pieza siguiente">›</button>
          <span class="ref">Foto de referencia · toca para ampliar</span>
        </div>
        <h3 class="mt-nom" id="mt-nom"></h3>
        <div class="cl-ctrl">
          <label class="cl-et" for="mt-nombre">Escribe el nombre a grabar</label>
          <input type="text" id="mt-nombre" maxlength="30" placeholder="Ej: Sofía" autocomplete="off">
          <div class="cl-rapido"><select id="mt-fuente" aria-label="Tipografía">${FUENTES.map(f => `<option value="${f.id}" style="font-family:'f-${f.id}'">${f.n}</option>`).join("")}</select><button type="button" class="btn sec" id="mt-otraletra"><span style="font-family:'f-great-vibes'">Aa</span> Otra letra</button></div>
          <div class="vista-letra" id="mt-vista" aria-live="polite">Tu nombre</div>
          <div class="cl-add"><div><b id="mt-precio"></b><small id="mt-desc"></small></div><button type="button" class="btn" id="mt-agregar"><span class="t-lg">Agregar al carrito</span><span class="t-sm">🛒 Agregar</span></button></div>
        </div>
      </div></div>`;
    const $ = s => raiz.querySelector(s);
    const letra = () => {
      const f = FUENTES.find(x => x.id === fuenteId) || FUENTES[0], inp = $("#mt-nombre"), t = inp.value.trim(), v = $("#mt-vista");
      v.style.fontFamily = `'f-${f.id}'`; v.textContent = t ? (f.mayus ? t.toLocaleUpperCase("es") : t) : "Tu nombre"; v.style.opacity = t ? 1 : .45; inp.style.fontFamily = `'f-${f.id}'`; $("#mt-fuente").value = f.id;
    };
    const pieza = () => {
      const p = lista[k], im = $("#mt-img"); im.src = p.img; im.alt = p.n;
      $("#mt-nom").textContent = p.n; $("#mt-cont").textContent = `${k + 1} de ${lista.length}`;
      $("#mt-precio").textContent = PRECIOS.formato(PRECIOS.precioUnitario({ tipo:"metal", ref:p.ref })); $("#mt-desc").textContent = p.n;
    };
    const abrir = i => { k = i; $("#mt-lista").hidden = true; $("#mt-pieza").hidden = false; pieza(); letra(); window.scrollTo({ top:0, behavior:"smooth" }); };
    const cerrar = () => { $("#mt-pieza").hidden = true; $("#mt-lista").hidden = false;
      const c = raiz.querySelector(`.mt-card[data-i="${k}"]`); if (c) c.scrollIntoView({ block:"center" }); };
    const mover = d => { k = (k + d + lista.length) % lista.length; pieza(); };
    $("#mt-lista").onclick = e => { const c = e.target.closest(".mt-card"); if (c) abrir(+c.dataset.i); };
    $("#mt-volver").onclick = cerrar; $("#mt-ant").onclick = () => mover(-1); $("#mt-sig").onclick = () => mover(1);
    $("#mt-img").onclick = () => Visor.abrir(lista.map(p => ({ src:p.img, alt:p.n })), k);
    const foto = $("#mt-foto");
    foto.addEventListener("touchstart", e => { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive:true });
    foto.addEventListener("touchend", e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(d) > 50) mover(d < 0 ? 1 : -1); });
    $("#mt-nombre").addEventListener("input", letra);
    $("#mt-fuente").addEventListener("change", e => { fuenteId = e.target.value; letra(); });
    $("#mt-otraletra").onclick = () => { const o = FUENTES.filter(f => f.id !== fuenteId); fuenteId = o[Math.floor(Math.random() * o.length)].id; letra(); };
    $("#mt-agregar").onclick = () => {
      const inp = $("#mt-nombre"), nombre = inp.value.trim(), p = lista[k];
      if (!nombre) { inp.focus(); inp.classList.add("falta"); setTimeout(() => inp.classList.remove("falta"), 900); return; }
      Carrito.agregar({ tipo:"metal", ref:p.ref, producto:p.n, img:p.img, grabar:nombre, fuente:(FUENTES.find(f => f.id === fuenteId) || FUENTES[0]).n, cfg:{} });
    };
    letra();
  }
  return { configurador };
})();
