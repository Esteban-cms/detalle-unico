# Tienda de grabado láser (alojamiento estático)
1. Publique esta carpeta en un alojamiento estático (por ejemplo Cloudflare Pages). El sitio público contiene únicamente los archivos de la tienda.
2. Edite precios y número de WhatsApp en `js/precios.js` (el número será PÚBLICO).
3. Pruebas locales: `python3 -m http.server` y abra http://localhost:8000 (con doble clic en index.html las fuentes no cargan).
4. Reemplace las fotos de `assets/productos/` por las definitivas; añada dibujos en `js/dibujos.js`.
Fuentes: Google Fonts (licencia OFL) vía @fontsource.

## Novedades
- `js/dibujos2.js`: ~40 dibujos nuevos; cada asignatura tiene 6-8 opciones (lista `EXTRA`). Figuras de llaveros en `FIGURAS` (gato, perro, león, caballo, herradura, mariposa, búho, flor, huella…).
- `js/llaveros.js`: la foto se acerca al llavero y el nombre/figura se ve grabado en la madera. Ajuste de posición por modelo en `MODELOS` (cx, cy, w, h, r, z en % de la foto).
- Inicio: demo interactiva con tu nombre; cuadernos: botón «Sorpréndeme» y chispas decorativas.
- `assets/figuras/*.svg`: 48 diseños vectoriales para llaveros. Se listan por categoría en `CATS` (js/llaveros.js). Para agregar uno: copie el .svg a esa carpeta y añádalo a `CATS`.
- Llaveros: visor grande (`Llavero.configurador`) con madera y cuero sintético; ajuste de posición por modelo en `MODELOS`.
- Modo taller: el panel de pedidos y las funciones de descarga SVG se habilitan únicamente al abrir la copia local desde `http://localhost:8000` o `http://127.0.0.1:8000`. En el sitio público no aparece el acceso al taller. Esto evita que un visitante de la página pública entre al panel desde su propio navegador. No protege el computador del taller frente a otras personas que tengan acceso físico a él.

- `js/placas.js`: placas (tarjeta metálica 5,5 × 8,5 cm) con frase larga en varios renglones + dibujo. La letra se ajusta sola al espacio. En modo taller baja el SVG a tamaño real en mm. La imagen del pedido incluye foto para todos los productos.
- `js/pedidos.js`: panel «📋 Pedidos» (solo modo taller). El mensaje de WhatsApp trae «Ver pedido completo» con todo el pedido dentro del enlace; al abrirlo o pegarlo se ve lo que escribió el cliente y se descargan los SVG. Los pedidos abiertos se recuerdan solo en el navegador del taller (localStorage) para buscarlos por número.
- `js/qrcode.js`: generador de códigos QR (qrcode-generator, licencia MIT). La imagen del pedido lleva un QR que abre el pedido completo en el panel del taller.


## Privacidad de pedidos y QR (versión local)
- Los pedidos se codifican en el fragmento de URL `#pedidoc=...`. El fragmento después de `#` lo procesa el navegador y no se envía en la solicitud HTTP normal al alojamiento estático.
- El QR de la imagen contiene ese enlace completo. En el panel local del taller se puede pegar el enlace o cargar la imagen para leer el QR mediante jsQR.
- Los pedidos importados se guardan en `localStorage` del navegador del taller, no en GitHub ni en una base de datos. Si se borran los datos del navegador o se cambia de computador/perfil, no estarán disponibles. Exporta o conserva las imágenes originales como respaldo.
- El contenido codificado en el QR no está cifrado. Cualquiera que tenga la imagen puede leer el nombre, producto y demás datos incluidos en el pedido. No incluyas datos sensibles que no sean necesarios.
- Deja `PRECIOS.urlPublica` vacío: el sistema usa automáticamente la dirección desde la que se está ejecutando. Cuando el cliente hace el pedido desde el sitio público, el QR contiene el enlace público. La dirección local `localhost` solo funciona en el computador que ejecuta Python.
- El panel puede leer el QR desde una imagen recibida en el computador. La lectura se hace localmente en el navegador; no se carga la imagen a un servicio externo.

### Prueba local
1. Abre una terminal en esta carpeta.
2. Ejecuta `python -m http.server 8000`.
3. Abre `http://localhost:8000`.
4. Agrega un producto al carrito, finaliza el pedido y descarga la imagen.
5. Entra al modo taller, abre «Pedidos» y carga la imagen descargada.
6. El pedido debe aparecer y quedar guardado en el navegador del taller.

### Nota de seguridad
El modo taller se restringe a `localhost`; no utiliza una contraseña pública. Esto es una barrera de separación entre el sitio público y la copia local, no un sistema de autenticación para proteger el computador frente a otras personas que puedan usarlo.


## Corrección del lector QR desde imagen

Esta versión usa `jsQR`. La imagen se abre en el navegador, se dibuja en un canvas y se decodifica localmente; no se carga ni se envía a un servidor.

**Nota de conectividad:** esta entrega carga la biblioteca jsQR desde jsDelivr al abrir la aplicación, por lo que requiere conexión a Internet para descargar ese archivo JavaScript. El contenido de las fotografías y los pedidos no se transmite. Para un funcionamiento totalmente desconectado, se debe guardar `jsQR.js` dentro de `js/` y cambiar el `script src` a `js/jsQR.js`.

Para probar: ejecutar `py -m http.server 8000` desde la carpeta del proyecto y abrir `http://localhost:8000`. Recargar con `Ctrl+F5`.


## Cambios de privacidad en esta revisión
- La versión pública no incluye una clave de acceso al panel del taller.
- El modo taller solo se habilita en `localhost` o `127.0.0.1`. En el dominio público, la ruta `#pedidos` vuelve al inicio y el panel no se inicializa.
- Los enlaces de pedido y diseño usan fragmentos `#pedidoc=` y `#pedido=` en vez de parámetros de consulta, para evitar que los datos formen parte de la solicitud HTTP normal.
- Se retiró la lectura automática de pedidos desde el parámetro antiguo `?pedidoc=`.
- WhatsApp solo se abre cuando el cliente pulsa el botón correspondiente. El número de WhatsApp, si se configura, es público.

## Limitación pendiente
La librería jsQR continúa alojada en jsDelivr. Aunque el archivo de imagen se procesa en el navegador y no se sube a jsDelivr, la carga de un script remoto es una dependencia de terceros. Para afirmar que toda la aplicación funciona sin scripts externos, hay que empaquetar una copia local de jsQR y probarla.

## Lápices (nuevo)
- `js/lapices.js`: configurador de lápices. El nombre se graba a lo largo de la cara del lápiz, con 12 adornos (trébol, corazón, estrella, flor, mariposa...), 4 separadores (ondas, línea, puntitos), 3 distribuciones (centrado, pegado al borrador, nombre repetido ×2–4) y sentido de lectura.
- Medidas ESTIMADAS en `MODELOS` (largo total `T`, ancho de una cara `s`, zona grabable `x1`–`x2`, en mm). Mida sus lápices reales y ajústelas ahí.
- Precios por tipo de lápiz en `PRECIOS.lapices` (js/precios.js).
- En modo taller (localhost) el botón «SVG para láser» baja la cara grabable en mm reales (texto en trazados). El archivo trae una referencia azul opcional que NO se debe grabar.
- Los pedidos con lápices se incluyen en el enlace/QR del pedido y en la imagen del pedido.

## Cambios para celular (última revisión)
- `js/visor.js`: visor de fotos a pantalla completa. Cualquier `<img data-zoom="grupo">` se amplía al tocarla (flechas, deslizar, Esc). Lo usan los ejemplos de grabado de lápices y los colgantes.
- `js/metal.js`: colgantes/pulseras. Se elige una pieza de la lista y se abre sola en grande; flechas ‹ › para pasar a la siguiente (conserva nombre y letra) y botón «Todos los colgantes» para volver.
- Lápices: se quitaron los deslizadores (repeticiones, tamaño de letra, mover). Botones «Otra figurita», «Otra letra» y «Al azar». Distribución/separador/sentido están en «Más opciones».
- Precios de lápices = precio del GRABADO (`js/precios.js`): `lapices` 1.000 por lápiz individual y `cajaLapices` 6.000 por caja de colores ×12 (mismo nombre en los 12). La caja solo existe para lápices de colores y viaja en el enlace/QR del pedido.
- Cuadernos: vista previa fija arriba, secciones plegables, letras/dibujos en carrusel horizontal, barra inferior fija con precio y «Agregar», botones «Otro dibujo / Otra letra / Al azar». El archivo técnico queda plegado.

## Revisión 3
- Lápices: precio por GRABADO en `js/precios.js` → `lapices` (500 por lápiz) y `cajaLapices` (4.500 la caja de 12; `porModelo` permite otro precio para «jumbo»). Se quitó el color del pedido (el color de la vista previa es solo de ejemplo). El primer paso es elegir «Un lápiz» o «Caja de 12 lápices».
- Imagen del pedido: el botón ahora es «Enviar imagen por WhatsApp» (celular: menú Compartir; PC: copia la imagen para pegarla). Solo guarda un archivo si el navegador no permite lo anterior. Compartir/copiar requiere HTTPS (o localhost): publicada en Cloudflare/Firebase funciona; por `http://IP:puerto` en la red local se guarda como archivo.
- Llaveros: vista más grande en celular y opción «Caras a grabar: 1 cara / 2 caras». Con 2 caras aparece Cara 1 · Voltear · Cara 2; cada cara lleva texto, figura o ambos. Recargo opcional por 2.ª cara: `PRECIOS.adicionales.dosCaras` (hoy 0). En modo taller se bajan 2 SVG (`-cara1`, `-cara2`). La imagen del pedido muestra la cara 2 como recuadro pequeño.

## Revisión 4
- Lápices: la página abre como vitrina (fotos ejemplo grandes y ampliables, precios y dos botones «Personalizar»: un lápiz / caja de 12). El editor se abre al pulsarlos y tiene «← Ver ejemplos y precios». Se quitó la selección de tipo de lápiz (se usa el modelo «colores» para las medidas de grabado).
