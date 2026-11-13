/**
 * agrupar-productos.js
 * 
 * Función y script utilitario para procesar la lista de productos exportada de CSV a JSON.
 * Agrupa automáticamente las filas repetidas que corresponden al mismo producto,
 * combinando sus imágenes en el arreglo `imagenes: [...]`.
 * 
 * Uso desde línea de comandos:
 *   node scripts/agrupar-productos.js [archivo_origen.json] [archivo_destino.json]
 *   (Por defecto procesa productos.json y actualiza js/productos.js)
 */

const fs = require('fs');
const path = require('path');

/**
 * Agrupa productos con el mismo nombre y consolida sus imágenes
 * @param {Array<Object>} lista - Lista cruda de productos proveniente del CSV/JSON
 * @returns {Array<Object>} Lista normalizada y agrupada con formato e-commerce
 */
function agruparProductos(lista) {
  if (!Array.isArray(lista)) return [];

  const mapa = new Map();

  lista.forEach((p) => {
    if (!p) return;

    // Normalizar nombre para usar como clave de agrupación
    const nombreLimpio = String(p.nombre || '').trim();
    if (!nombreLimpio) return;

    const clave = nombreLimpio.toLowerCase().replace(/\s+/g, ' ');

    // Normalizar precio a número entero limpio
    let precioNum = 0;
    if (typeof p.precio === 'number') {
      precioNum = Math.round(p.precio);
    } else if (typeof p.precio === 'string') {
      const digitos = p.precio.replace(/[^0-9]/g, '');
      precioNum = parseInt(digitos, 10) || 0;
    }

    // Normalizar categoría
    let cat = String(p.categoria || 'Varios').trim();
    if (cat.toLowerCase() === 'sublimables varios') {
      cat = 'Sublimables varios';
    } else if (cat.length > 0) {
      cat = cat.charAt(0).toUpperCase() + cat.slice(1);
    }

    // Extraer imágenes de la fila actual (soporta string único, array o string separado por punto y coma)
    let imagenesFila = [];
    if (Array.isArray(p.imagenes)) {
      imagenesFila = p.imagenes.map((img) => String(img || '').trim()).filter(Boolean);
    } else if (typeof p.imagen === 'string' && p.imagen.trim().length > 0) {
      imagenesFila = p.imagen.split(/[;\n]+/).map((img) => img.trim()).filter(Boolean);
    } else if (typeof p.imagenes === 'string' && p.imagenes.trim().length > 0) {
      imagenesFila = p.imagenes.split(/[;\n]+/).map((img) => img.trim()).filter(Boolean);
    }

    const descripcionLimpia = String(p.descripcion || '').trim();

    if (mapa.has(clave)) {
      // El producto ya existe: unificar imágenes y conservar la descripción más completa
      const existente = mapa.get(clave);

      imagenesFila.forEach((img) => {
        if (!existente.imagenes.includes(img)) {
          existente.imagenes.push(img);
        }
      });

      // Si la nueva descripción es más detallada, actualizarla
      if (descripcionLimpia.length > existente.descripcion.length) {
        existente.descripcion = descripcionLimpia;
      }

      // Si el precio existente era 0 y este tiene precio, actualizarlo
      if (existente.precio === 0 && precioNum > 0) {
        existente.precio = precioNum;
      }
    } else {
      // Nuevo producto en el mapa
      const idNum = Number(p.id);
      const idFinal = !isNaN(idNum) && idNum > 0 ? idNum : String(p.id || '').trim() || (mapa.size + 1);

      mapa.set(clave, {
        id: idFinal,
        nombre: nombreLimpio,
        categoria: cat,
        precio: precioNum,
        imagenes: imagenesFila.length > 0 ? imagenesFila : ['logo_blancoNegro.jpg'],
        descripcion: descripcionLimpia
      });
    }
  });

  return Array.from(mapa.values());
}

// Ejecución directa por CLI
if (require.main === module) {
  const rutaOrigen = process.argv[2] 
    ? path.resolve(process.argv[2]) 
    : path.resolve(__dirname, '../productos.json');

  const rutaDestino = process.argv[3] 
    ? path.resolve(process.argv[3]) 
    : rutaOrigen;

  const rutaJsProductos = path.resolve(__dirname, '../js/productos.js');

  try {
    console.log(`📖 Leyendo datos desde: ${rutaOrigen}`);
    const contenido = fs.readFileSync(rutaOrigen, 'utf8');
    const datosCrudos = JSON.parse(contenido);

    const datosAgrupados = agruparProductos(datosCrudos);
    console.log(`✅ Procesados ${datosCrudos.length} elementos crudos -> ${datosAgrupados.length} productos consolidados.`);

    // Guardar en JSON formateado
    fs.writeFileSync(rutaDestino, JSON.stringify(datosAgrupados, null, 2) + '\n', 'utf8');
    console.log(`💾 Archivo JSON guardado en: ${rutaDestino}`);

    // Sincronizar js/productos.js para soporte offline
    if (fs.existsSync(rutaJsProductos)) {
      const contenidoJs = `const PRODUCTOS = ${JSON.stringify(datosAgrupados, null, 2)};\n`;
      fs.writeFileSync(rutaJsProductos, contenidoJs, 'utf8');
      console.log(`💾 Archivo js/productos.js sincronizado.`);
    }

    // Reporte de productos con múltiples fotos
    const conVariasFotos = datosAgrupados.filter(p => p.imagenes.length > 1);
    console.log(`\n📸 Productos con múltiples imágenes (${conVariasFotos.length}):`);
    conVariasFotos.forEach(p => {
      console.log(`  - [ID ${p.id}] ${p.nombre} (${p.imagenes.length} imágenes):`);
      p.imagenes.forEach(img => console.log(`      * ${img}`));
    });

  } catch (error) {
    console.error('❌ Error al procesar los productos:', error.message);
    process.exit(1);
  }
}

module.exports = { agruparProductos };
