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
  // Mensaje que ve el cliente al enviar su pedido (edítelo a su gusto):
  gracias: { titulo: "¡Gracias por tu compra! 🎉", texto: "Tu pedido quedó reservado. Si necesitas algún cambio, escríbeme y con gusto te atiendo." },

  cuaderno: { base: 18000 },
  agenda:   { base: 35000 },
  lapiz:    { base: 6000 },
  boligrafo:{ base: 8000 },
  // El precio de los lápices es por GRABADO, no por el lápiz:
  //   · un lápiz: 500 COP por cada lápiz grabado
  //   · caja de 12 lápices (colores): 4.500 COP por la caja (los 12 con el mismo nombre)
  //   · si algún tipo de caja (ej. "jumbo") cuesta distinto, póngalo en porModelo: { jumbo: 6000 }
  lapices: { grafito: 500, colores: 500, jumbo: 500 },
  cajaLapices: { unidades: 12, precio: 4500, porModelo: {} },

  // Precio por referencia de producto (ids de productos.js)
  llaveros: {
    "madera-rombo": 9000, "madera-escudo": 9000, "madera-alargado": 9000,
    "madera-pastilla": 9000, "madera-ovalo": 9000,
    "cuero-negro": 14000, "cuero-miel": 14000
  },
  metal: { "tarjeta": 12000, "placa-militar": 15000, "hueso": 14000,
           "pulsera": 22000, "puas": 13000, "aro": 12000, "barra": 18000 },

  // Adicionales por personalización
  adicionales: { marco: 2000, contornoNombre: 1000, dosLineas: 0, ilustracion: 0,
                 dosCaras: 0 },   // recargo por grabar también la 2.ª cara del llavero (0 = sin recargo)

  // Descuentos por cantidad TOTAL de unidades en el pedido (se aplica el mayor que cumpla)
  descuentos: [ { min: 5, porcentaje: 5 }, { min: 10, porcentaje: 10 } ],

  formato(n) { return "$" + Math.round(n).toLocaleString("es-CO") + " COP"; },

  precioUnitario(item) {
    let p = 0, c = item.cfg || {};
    if (item.tipo === "cuaderno") {
      p = this.cuaderno.base;
      if (c.marco && c.marco !== "ninguno") p += this.adicionales.marco;
      if (c.contorno) p += this.adicionales.contornoNombre;
    } else if (item.tipo === "llavero") { p = this.llaveros[item.ref] ?? 0; if (c.b) p += this.adicionales.dosCaras; }
    else if (item.tipo === "lapiz") p = (c.caja ? (this.cajaLapices.porModelo[item.ref] ?? this.cajaLapices.precio) : this.lapices[item.ref]) ?? this.lapiz.base;
    else if (item.tipo === "metal" || item.tipo === "placa") p = this.metal[item.ref] ?? 0;
    return p;
  },
  descuentoPara(unidades) {
    return this.descuentos.filter(d => unidades >= d.min).reduce((m, d) => Math.max(m, d.porcentaje), 0);
  }
};
