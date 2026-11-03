/* ==========================================================
   PRECIOS Y CONFIGURACIÓN COMERCIAL  (único lugar para editar)
   Valores en pesos colombianos (COP). Los montos son EJEMPLOS.
   ========================================================== */
const PRECIOS = {
  // AVISO: todo lo que escriba aquí es PÚBLICO (cualquiera puede verlo
  // con "Inspeccionar"). El número del vendedor NO es secreto.
  // Formato internacional sin + ni espacios, ej: "573001234567".
  // Si lo deja vacío, WhatsApp pedirá al cliente elegir el contacto.
  whatsappNumero: "",
  // URL base opcional para el QR. Déjela vacía: se toma automáticamente la dirección actual.
  // En pruebas locales usará localhost; publicada usará automáticamente GitHub Pages.
  // Solo rellénela si necesita forzar una dirección concreta.
  urlPublica: "",
  // El modo taller solo se habilita al abrir la copia local en localhost.
  whatsappSaludo: "Hola, quiero hacer el siguiente pedido:",

  cuaderno: { base: 18000 },
  agenda:   { base: 35000 },
  lapiz:    { base: 1000 },
  boligrafo:{ base: 8000 },
  // Precio de cada tipo de lápiz (ids de js/lapices.js). Si falta uno, se usa lapiz.base
  lapices: { grafito: 1000, colores: 1000, jumbo: 1000, caja12: 6000 },

  // Precio por referencia de producto (ids de productos.js)
  llaveros: {
    "madera-rombo": 9000, "madera-escudo": 9000, "madera-alargado": 9000,
    "madera-pastilla": 9000, "madera-ovalo": 9000,
    "cuero-negro": 14000, "cuero-miel": 14000
  },
  metal: { "tarjeta": 12000, "placa-militar": 15000, "hueso": 14000,
           "pulsera": 22000, "puas": 13000, "aro": 12000, "barra": 18000 },

  // Adicionales por personalización
  adicionales: { marco: 2000, contornoNombre: 1000, dosLineas: 0, ilustracion: 0 },

  // Descuentos por cantidad TOTAL de unidades en el pedido (se aplica el mayor que cumpla)
  descuentos: [ { min: 5, porcentaje: 5 }, { min: 10, porcentaje: 10 } ],

  formato(n) { return "$" + Math.round(n).toLocaleString("es-CO") + " COP"; },

  precioUnitario(item) {
    let p = 0, c = item.cfg || {};
    if (item.tipo === "cuaderno") {
      p = this.cuaderno.base;
      if (c.marco && c.marco !== "ninguno") p += this.adicionales.marco;
      if (c.contorno) p += this.adicionales.contornoNombre;
    } else if (item.tipo === "llavero") p = this.llaveros[item.ref] ?? 0;
    else if (item.tipo === "lapiz") p = c.caja12 ? this.lapices.caja12 : (this.lapices[item.ref] ?? this.lapiz.base);
    else if (item.tipo === "metal" || item.tipo === "placa") p = this.metal[item.ref] ?? 0;
    return p;
  },
  descuentoPara(unidades) {
    return this.descuentos.filter(d => unidades >= d.min).reduce((m, d) => Math.max(m, d.porcentaje), 0);
  }
};
