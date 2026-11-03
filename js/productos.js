/* CATÁLOGO: tipografías, asignaturas y productos. Todo ampliable. */
const FUENTES = [
  { id:"great-vibes",     n:"Cursiva elegante",   grupo:"Cursivas",   mayus:false },
  { id:"dancing-script",  n:"Cursiva manuscrita", grupo:"Cursivas",   mayus:false },
  { id:"pinyon-script",   n:"Caligrafía",         grupo:"Cursivas",   mayus:false },
  { id:"cinzel",          n:"Mayúsculas clásicas",grupo:"Mayúsculas", mayus:true  },
  { id:"bebas-neue",      n:"Mayúsculas modernas",grupo:"Mayúsculas", mayus:true  },
  { id:"fredoka",         n:"Infantil",           grupo:"Modernas",   mayus:false },
  { id:"nunito",          n:"Redondeada",         grupo:"Modernas",   mayus:false },
  { id:"quicksand",       n:"Minimalista",        grupo:"Modernas",   mayus:false },
  { id:"playfair-display",n:"Profesional",        grupo:"Clásicas",   mayus:false },
  { id:"pacifico",        n:"Decorativa",         grupo:"Clásicas",   mayus:false }
].map(f => ({ ...f, archivo: `assets/tipografias/${f.id}.woff` }));

const ASIGNATURAS = [
  { id:"mat",  n:"Matemáticas", dib:["compas","regla","calculadora","geometria","pi"] },
  { id:"leng", n:"Humanidades y Lengua Castellana", dib:["libro","pluma","diccionario"] },
  { id:"ingl", n:"Idioma Extranjero", dib:["dialogo","globo","libro"] },
  { id:"nat",  n:"Ciencias Naturales y Educación Ambiental", dib:["hoja","arbol","globo"] },
  { id:"bio",  n:"Biología", dib:["celula","adn","microscopio","hoja"] },
  { id:"fis",  n:"Física", dib:["atomo","onda","rayo","pi"] },
  { id:"qui",  n:"Química", dib:["matraz","tubos","molecula","atomo"] },
  { id:"soc",  n:"Ciencias Sociales", dib:["mapa","globo","edificio"] },
  { id:"his",  n:"Historia", dib:["columnas","reloj","pergamino"] },
  { id:"geo",  n:"Geografía", dib:["globo","brujula","mapa"] },
  { id:"con",  n:"Constitución Política y Democracia", dib:["balanza","documento","columnas"] },
  { id:"paz",  n:"Cátedra para la Paz", dib:["paloma","paz","corazon"] },
  { id:"eti",  n:"Educación Ética y en Valores Humanos", dib:["balanza","corazon","bombilla"] },
  { id:"rel",  n:"Educación Religiosa", dib:["cruz","estrella","luna","paloma"] },
  { id:"efi",  n:"Educación Física, Recreación y Deportes", dib:["balon","trofeo","bicicleta"] },
  { id:"art",  n:"Educación Artística y Cultural", dib:["pincel","paleta","nota"] },
  { id:"tec",  n:"Tecnología e Informática", dib:["computador","circuito","engranaje"] },
  { id:"fil",  n:"Filosofía", dib:["libro","busto","bombilla"] },
  { id:"eco",  n:"Ciencias Económicas y Políticas", dib:["grafica","moneda","edificio"] }
];

// Fotos = REFERENCIAS (se reemplazarán por las definitivas en assets/productos/)
const IMG = f => `assets/productos/${f}.jpg`;
const CATALOGO = {
  llaveroMadera: [
    { ref:"madera-rombo",    n:"Llavero madera · Rombo",   img:IMG("madera-rombo-a") },
    { ref:"madera-escudo",   n:"Llavero madera · Escudo",  img:IMG("madera-escudo-a") },
    { ref:"madera-alargado", n:"Llavero madera · Alargado",img:IMG("madera-alargado") },
    { ref:"madera-pastilla", n:"Llavero madera · Pastilla",img:IMG("madera-pastilla") },
    { ref:"madera-ovalo",    n:"Llavero madera · Óvalo",   img:IMG("madera-ovalo") }
  ],
  llaveroCuero: [
    { ref:"cuero-miel",  n:"Llavero cuero sintético · Gota miel",  img:IMG("cuero-miel") },
    { ref:"cuero-negro", n:"Llavero cuero sintético · Gota negro", img:IMG("cuero-negro") }
  ],
  metal: [
    { ref:"tarjeta", n:"Tarjeta metálica · Rosa",   img:IMG("tarjeta-rosa") },
    { ref:"tarjeta", n:"Tarjeta metálica · Azul",   img:IMG("tarjeta-azul") },
    { ref:"tarjeta", n:"Tarjeta metálica · Dorada", img:IMG("tarjeta-dorada") },
    { ref:"placa-militar", n:"Placa militar con cadena", img:IMG("placa-militar") },
    { ref:"hueso", n:"Colgante hueso · Negro",   img:IMG("hueso-negro-a") },
    { ref:"hueso", n:"Colgante hueso · Dorado",  img:IMG("hueso-dorado") },
    { ref:"puas",  n:"Colgante púa · Dorado",    img:IMG("puas-dorada") },
    { ref:"aro",   n:"Llavero aro redondo · Dorado", img:IMG("aro-dorado") },
    { ref:"pulsera", n:"Pulsera con placa · Dorada", img:IMG("pulsera-dorada") },
    { ref:"pulsera", n:"Pulsera con placa · Plateada", img:IMG("pulsera-plata") },
    { ref:"barra", n:"Colgante barra · Negro", img:IMG("barra-negra") }
  ]
};
