/* Ilustraciones adicionales (viewBox 0 0 100 100, solo trazos). Se suman a DIBUJOS de dibujos.js.
   Para añadir una: DIBUJOS.id = D("Nombre", "path…"), y agregue el id a EXTRA (cuadernos) o FIGURAS (llaveros). */
const P = d => `<path d="${d}"/>`;
const D = (n, d) => ({ n, d: P(d) });
const C = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const S = d => `<path d="${d}"/><path d="${d}" transform="translate(100 0) scale(-1 1)"/>`;   // simetría espejo
const F = d => `<path d="${d}" fill="currentColor" stroke="none"/>`;          // relleno (ojos, nariz)
const FS = d => `<path d="${d}" fill="currentColor" stroke="none"/><path d="${d}" fill="currentColor" stroke="none" transform="translate(100 0) scale(-1 1)"/>`;
const R = (d, n, x, y) => Array.from({ length: n }, (_, i) => `<path d="${d}" transform="rotate(${i * 360 / n} ${x} ${y})"/>`).join("");
const _mane = (() => { let d = "", N = 16; const p = (t, k) => (50 + k * Math.cos(t)).toFixed(1) + " " + (48 + k * Math.sin(t)).toFixed(1);
  for (let i = 0; i < N; i++) { const a = i * 2 * Math.PI / N, b = a + 2 * Math.PI / N; d += (i ? "" : "M" + p(a, 40)) + "Q" + p((a + b) / 2, 53) + " " + p(b, 40); } return d + "Z"; })();

Object.assign(DIBUJOS, {
  /* ---- Animales y figuras para llaveros (y cuadernos) ---- */
  gato: { n: "Gato", d: S("M50 37C41 35 33 36 27 40L19 14Q17 11 15 16C11 30 11 40 13 50C15 68 30 84 50 84M24 34 21 24 30 30M28 52Q35 44 43 52Q35 58 28 52ZM50 66.5V70Q46 74.5 41.5 71.5M27 63 6 58M27 67 5 68M28 71 9 78M44 38 45 44") + FS(C(35.5, 51.5, 3.4)) + F("M46.5 62H53.5L50 66.5Z") + P("M50 37V45") },
  perro: { n: "Perro", d: S("M50 22Q38 22 32 30Q10 28 10 58Q12 74 26 68Q31 58 32 46M32 46Q32 70 41 80Q46 86 50 86M33 41Q39 36 45 40M18 42Q16 54 20 62M24 38Q22 50 25 60M50 75V80Q45 86 38 82") + FS(C(39, 50, 3.6)) + F("M41 64Q50 58 59 64Q57 73 50 75Q43 73 41 64Z") + P("M50 22V38M45 82Q50 96 55 82") },
  leon: { n: "León", d: P(_mane + "M50 28C36 28 31 40 31 52C31 66 40 74 50 74C60 74 69 66 69 52C69 40 64 28 50 28ZM36 44Q40 41 45 44M64 44Q60 41 55 44M50 63V67Q45 72 40 69M50 63V67Q55 72 60 69M38 58 28 56M38 62 29 65M62 58 72 56M62 62 71 65") + R("M50 15V21", 16, 50, 48) + FS(C(40.5, 50, 3)) + F("M45 57H55L50 63Z") },
  caballo: { n: "Caballo", d: P("M50 28 53 8 63 26Q82 32 84 54Q86 76 70 94M52 26Q40 40 30 58Q24 66 20 74Q18 80 24 84Q30 86 34 82Q38 76 44 72Q52 80 58 74Q64 86 62 96M44 60Q50 66 48 74M26 84Q34 80 38 80M70 36Q88 42 86 60M66 48Q80 58 78 78M62 62Q72 72 68 88M74 30Q92 40 90 60M60 34Q70 46 66 60M52 26Q47 34 45 40M40 47Q46 42 52 47") + F(C(46, 50, 3)) + F("M23 76Q26 72 29 77Z") },
  herradura: { n: "Herradura de la suerte", d: P(`M30 90Q6 72 12 38Q20 10 50 10T88 38Q94 72 70 90L62 80Q78 66 74 44Q70 26 50 26T26 44Q22 66 38 80ZM20 70l5 4M16 52h6M22 36l5 3M80 70l-5 4M84 52h-6M78 36l-5 3`) },
  mariposa: { n: "Mariposa", d: S("M48 46C42 22 24 8 10 14C4 30 16 46 34 50C16 54 12 70 22 78C34 82 44 66 48 56M46 44C38 30 28 24 20 24M49 36Q46 24 38 18" + C(27, 30, 4.5) + C(29, 68, 3.5) + "M44 50 22 46M44 56 26 64") + FS(C(27, 30, 1.8)) + FS(C(29, 68, 1.4)) + P + P("M46.5 52a3.5 17 0 1 0 7 0a3.5 17 0 1 0-7 0") },
  buho: { n: "Búho", d: P(`M26 30 22 12 38 22Q50 18 62 22L78 12 74 30Q86 44 80 70Q72 92 50 92Q28 92 20 70Q14 44 26 30ZM${C(38, 42, 10)}${C(62, 42, 10)}${C(38, 42, 4)}${C(62, 42, 4)}M46 52 50 60 54 52ZM22 58Q16 76 34 86M78 58Q84 76 66 86M40 68Q44 74 48 68M52 68Q56 74 60 68M44 78Q48 84 52 78M12 96H88`) },
  flor: { n: "Flor", d: P(C(50, 36, 7) + "M50 66Q46 80 50 96M49 78Q32 66 26 74Q38 84 49 78M51 84Q66 74 74 82Q62 92 51 84") + R("M50 29Q38 18 50 6Q62 18 50 29Z", 8, 50, 36) },
  huella: { n: "Huellita", d: P("M50 56Q34 56 30 70Q28 84 40 84Q46 80 50 80Q54 80 60 84Q72 84 70 70Q66 56 50 56Z") + '<ellipse cx="22" cy="48" rx="7" ry="10" transform="rotate(-25 22 48)"/><ellipse cx="40" cy="30" rx="7.5" ry="11"/><ellipse cx="60" cy="30" rx="7.5" ry="11"/><ellipse cx="78" cy="48" rx="7" ry="10" transform="rotate(25 78 48)"/>' },
  /* ---- Nuevas por asignatura ---- */
  transportador: D("Transportador", "M8 74A42 42 0 0 1 92 74ZM18 74A32 32 0 0 1 82 74M50 74 22 44M50 74V36M50 74 78 44M50 74V68"),
  cubo: D("Cubo 3D", "M50 10 88 30V70L50 90 12 70V30ZM12 30 50 50 88 30M50 50V90"),
  infinito: D("Infinito y ecuaciones", "M50 36C60 20 90 20 90 40S60 60 50 44C40 60 10 60 10 40S40 20 50 36ZM28 80H52M40 70V90M62 74H86M62 86H86"),
  lapiz: D("Lápiz", "M70 12 88 30 36 82 14 86 18 64ZM60 22 78 40M18 64 36 82"),
  comillas: D("Comillas", "M12 30H40V58H26Q26 72 38 76V82Q12 78 12 58ZM56 30H84V58H70Q70 72 82 76V82Q56 78 56 58Z"),
  carta: D("Carta", "M10 24H90V76H10ZM10 24 50 54 90 24M10 76 38 48M90 76 62 48"),
  bandera: D("Bandera", "M24 10V92M24 14Q44 4 58 14T92 14V50Q76 60 58 50T24 50"),
  audifonos: D("Audífonos", "M16 62V50Q16 16 50 16T84 50V62M10 56H24V80H10ZM76 56H90V80H76Z"),
  taza: D("Taza de té", "M20 40H68V62Q68 82 44 82T20 62ZM68 46H78Q88 46 86 58T68 64M30 28Q34 22 30 16M46 28Q50 22 46 16M10 90H80"),
  hongo: D("Hongo", `M12 52Q12 14 50 14T88 52ZM40 52V82Q40 90 50 90T60 82V52${C(32, 36, 4)}${C(56, 28, 4)}${C(70, 42, 3)}`),
  gota: D("Gota de agua", "M50 8Q22 46 22 64A28 28 0 0 0 78 64Q78 46 50 8ZM36 66Q38 78 50 80"),
  sol: D("Sol", C(50, 50, 18) + R("M50 8V22", 12, 50, 50)),
  cohete: D("Cohete", `M50 6Q74 24 70 62L50 76 30 62Q26 24 50 6ZM30 62 14 78 22 56M70 62 86 78 78 56M44 80 50 94 56 80${C(50, 38, 8)}`),
  pendulo: D("Péndulo de Newton", `M14 8H86M34 8V54M42 8V54M50 8V54M58 8V54M66 8 90 52${C(34, 60, 6)}${C(46, 60, 6)}${C(58, 60, 6)}${C(92, 58, 6)}`),
  iman: D("Imán", "M22 14V54A28 28 0 0 0 78 54V14H60V54A10 10 0 0 1 40 54V14ZM22 28H40M60 28H78"),
  mechero: D("Mechero de laboratorio", "M50 4Q36 20 50 30Q64 20 50 4ZM42 36H58V64H42ZM32 64H68L74 84H26ZM18 92H82"),
  casa: D("Casa", "M10 48 50 14 90 48M20 42V88H80V42M42 88V62H58V88"),
  personas: D("Comunidad", `${C(50, 28, 10)}${C(24, 38, 8)}${C(76, 38, 8)}M32 80Q32 52 50 50Q68 52 68 80ZM6 76Q6 54 24 52M94 76Q94 54 76 52`),
  castillo: D("Castillo", "M12 90V34H26V44H38V34H62V44H74V34H88V90ZM42 90V70Q50 56 58 70V90M20 56V64M80 56V64M12 90H88"),
  carabela: D("Carabela", "M10 66H90L78 84H22ZM50 10V66M50 14Q80 24 78 54H50M50 20Q26 28 24 54H50M50 10 66 6V16"),
  montana: D("Montañas", "M6 86 36 30 52 56 62 42 94 86ZM28 44 36 50 44 42M56 50 62 56 70 50"),
  martillo: D("Martillo de juez", "M52 14 72 34 56 50 36 30ZM46 40 14 72 24 82 56 50M54 88H90M64 76H84V88H64"),
  olivo: D("Rama de olivo", "M14 88Q50 70 86 22M30 78Q24 64 34 60Q40 70 30 78M44 70Q40 54 52 52Q56 62 44 70M58 58Q56 44 68 40Q70 50 58 58M24 74Q14 68 14 58Q26 60 24 74M38 66Q30 58 32 48Q44 52 38 66M52 54Q46 46 50 36Q62 40 52 54"),
  vela: D("Vela", "M50 8Q40 22 50 30Q60 22 50 8ZM50 30V36M42 36H58V76H42ZM30 76H70V86H30Z"),
  biblia: D("Biblia", "M24 8H74V88H24ZM24 8Q16 8 16 18V80Q16 88 24 88M46 24H56V38H68V46H56V66H46V46H34V38H46Z"),
  medalla: D("Medalla", "M34 8 46 40M66 8 54 40M72 64A22 22 0 1 1 28 64A22 22 0 0 1 72 64ZM50 52 54 62 64 62 56 68 58 78 50 72 42 78 44 68 36 62 46 62Z"),
  pesas: D("Pesas", "M30 36V64M18 42V58M70 36V64M82 42V58M10 48V52M90 48V52M30 50H70"),
  mascara: D("Máscaras de teatro", "M10 18H54V50Q54 74 32 78Q10 74 10 50ZM20 36Q24 32 28 36M36 36Q40 32 44 36M22 56Q32 66 42 56M50 40H90V68Q90 90 70 92Q50 90 50 68ZM60 58Q64 54 68 58M74 58Q78 54 82 58M60 76Q70 68 80 76"),
  camara: D("Cámara", `M10 30H30L36 20H64L70 30H90V80H10Z${C(50, 54, 16)}${C(50, 54, 8)}`),
  robot: D("Robot", `M30 26H70V60H30ZM50 26V16${C(50, 11, 4)}M38 38V44M62 38V44M38 52H62M20 36V50M80 36V50M36 60V84H64V60M40 84V92M60 84V92`),
  wifi: D("Conexión", `M14 44Q50 12 86 44M26 58Q50 38 74 58M38 72Q50 62 62 72${C(50, 84, 4)}`),
  codigo: D("Código", "M32 28 10 50 32 72M68 28 90 50 68 72M56 20 44 80"),
  interrogacion: D("Pregunta", `M32 34Q32 12 52 12Q72 12 70 32Q68 44 54 52Q50 56 50 66${C(50, 82, 3)}`),
  cerdito: D("Alcancía", `M20 56Q18 34 44 32H62Q86 30 86 54Q86 70 74 74V84H62V78H40V84H28V72Q20 66 20 56ZM30 36 28 24 42 32M42 26H62M12 52Q8 52 8 58${C(68, 48, 2)}`)
});

/* Dibujos por asignatura (se muestran como opciones en el cuaderno) */
const EXTRA = {
  mat:"compas regla calculadora geometria pi transportador cubo infinito",
  leng:"libro pluma diccionario lapiz comillas carta",
  ingl:"dialogo globo libro bandera audifonos taza",
  nat:"hoja arbol globo flor mariposa hongo gota sol",
  bio:"celula adn microscopio hoja mariposa flor hongo huella",
  fis:"atomo onda rayo pi cohete pendulo iman",
  qui:"matraz tubos molecula atomo mechero gota",
  soc:"mapa globo edificio casa personas bandera",
  his:"columnas reloj pergamino castillo carabela brujula",
  geo:"globo brujula mapa montana sol arbol",
  con:"balanza documento columnas martillo bandera edificio",
  paz:"paloma paz corazon olivo mariposa flor",
  eti:"balanza corazon bombilla flor estrella sol",
  rel:"cruz estrella luna paloma vela biblia",
  efi:"balon trofeo bicicleta medalla pesas caballo",
  art:"pincel paleta nota mascara camara mariposa",
  tec:"computador circuito engranaje robot wifi codigo",
  fil:"libro busto bombilla buho interrogacion columnas",
  eco:"grafica moneda edificio cerdito balanza globo"
};
ASIGNATURAS.forEach(a => { if (EXTRA[a.id]) a.dib = EXTRA[a.id].split(" "); });

/* Figuras disponibles para grabar en llaveros */
const FIGURAS = ["gato","perro","leon","caballo","herradura","mariposa","buho","flor","huella","corazon","estrella","luna","paloma","sol","paz"];
