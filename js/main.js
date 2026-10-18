/**
 * ============================================================================
 * UTN - Programación III - División 131
 * Trabajo Práctico: Funcionalidad Integral de Carrito de Compras
 * Alumno: Javier Sosa
 * Stack: HTML5 Semántico + CSS3 Responsivo + Vanilla JavaScript / DOM API
 * ============================================================================
 */

/* ==========================================================================
   1. Catálogo de Productos
   Modularizado de forma independiente en: js/productos.js
   (Define la constante global PRODUCTOS respetando rutas relativas de ./productos)
   ========================================================================== */

/* ==========================================================================
   2. Estado de la Aplicación (State Management)
   ========================================================================== */
const CLAVE_STORAGE = "carrito";
let carrito = [];
let catalogoProductos = [];

/* ==========================================================================
   3. Referencias a Elementos del DOM (DOM Queries)
   ========================================================================== */
const grillaProductos = document.getElementById("grilla-productos");
const inputBusqueda = document.getElementById("input-busqueda");
const selectCategoria = document.getElementById("select-categoria");
const selectOrden = document.getElementById("select-orden");
const sinResultados = document.getElementById("sin-resultados");
const btnLimpiarFiltros = document.getElementById("btn-limpiar-filtros");

// Drawer y Carrito
const carritoDrawer = document.getElementById("carrito-drawer");
const carritoOverlay = document.getElementById("carrito-overlay");
const btnAbrirCarrito = document.getElementById("btn-abrir-carrito");
const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
const carritoListado = document.getElementById("carrito-listado");
const carritoVacio = document.getElementById("carrito-vacio");
const contadorCarrito = document.getElementById("contador-carrito");
const carritoItemsContador = document.getElementById("carrito-items-contador");
const carritoSubtotal = document.getElementById("carrito-subtotal");
const carritoTotal = document.getElementById("carrito-total");
const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");
const btnFinalizarCompra = document.getElementById("btn-finalizar-compra");
const carritoAvisoInstagram = document.getElementById("carrito-aviso-instagram");

// Modal de Checkout y Toasts
const modalCheckout = document.getElementById("modal-checkout");
const modalOverlay = document.getElementById("modal-overlay");
const modalResumen = document.getElementById("modal-resumen");
const modalTextoPedido = document.getElementById("modal-texto-pedido");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const btnCopiarNuevamente = document.getElementById("btn-copiar-nuevamente");
const btnAbrirChatIg = document.getElementById("btn-abrir-chat-ig");
const toastContenedor = document.getElementById("toast-contenedor");

let ultimoTextoPedido = "";

/* ==========================================================================
   4. Funciones de Utilidad, Normalización y Formateo
   ========================================================================== */
/**
 * Normaliza el catálogo para aceptar formatos flexibles:
 * - Precios como string ("$12.000", "12000", "$ 12.000") o numéricos (12000)
 * - IDs como string o número
 * - Categorías unificadas y limpias
 * @param {Array} lista 
 * @returns {Array}
 */
function normalizarCatalogo(lista) {
    if (!Array.isArray(lista)) return [];

    return lista.map((p) => {
        let precioNum = 0;
        if (typeof p.precio === "number") {
            precioNum = p.precio;
        } else if (typeof p.precio === "string") {
            // Elimina signo de moneda, espacios y puntos de miles
            const soloDigitos = p.precio.replace(/[^0-9]/g, "");
            precioNum = parseInt(soloDigitos, 10) || 0;
        }

        // Unificar categoría (capitalizar adecuadamente)
        let cat = String(p.categoria || "Varios").trim();
        if (cat.toLowerCase() === "sublimables varios") {
            cat = "Sublimables varios";
        } else if (cat.length > 0) {
            cat = cat.charAt(0).toUpperCase() + cat.slice(1);
        }

        return {
            id: String(p.id !== undefined ? p.id : "").trim(),
            nombre: String(p.nombre || "").trim(),
            categoria: cat,
            precio: precioNum,
            imagen: String(p.imagen || "").trim(),
            descripcion: String(p.descripcion || "").trim()
        };
    });
}

/**
 * Genera dinámicamente las opciones del selector de categorías según los productos disponibles
 * @param {Array} productos 
 */
function inicializarCategorias(productos) {
    if (!selectCategoria) return;

    // Obtener categorías únicas presentes en los datos
    const categoriasUnicas = Array.from(new Set(productos.map((p) => p.categoria))).filter(Boolean);
    categoriasUnicas.sort((a, b) => a.localeCompare(b));

    // Guardar categoría actualmente seleccionada si hubiera
    const categoriaActual = selectCategoria.value;

    selectCategoria.innerHTML = `<option value="todas">Todas las categorías</option>`;
    categoriasUnicas.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        if (cat === categoriaActual) {
            option.selected = true;
        }
        selectCategoria.appendChild(option);
    });
}

/**
 * Da formato de moneda en pesos argentinos (ARS)
 * @param {number} valor 
 * @returns {string} Ejemplo: "$ 8.500"
 */
function formatearPrecio(valor) {
    const num = typeof valor === "number" ? valor : parseInt(String(valor).replace(/[^0-9]/g, ""), 10) || 0;
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

/**
 * Muestra una notificación flotante (toast) amigable
 * Cumple con la regla de encerrar elementos en línea dentro de bloques
 * @param {string} mensaje 
 * @param {string} tipo 'exito' | 'peligro' | 'info'
 */
function mostrarToast(mensaje, tipo = "exito") {
    const toast = document.createElement("div");
    toast.className = `toast toast--${tipo}`;

    // Estructura semántica estricta: todas las etiquetas inline van en bloques
    toast.innerHTML = `
        <div class="toast__icono-caja">
            <span aria-hidden="true">${tipo === "peligro" ? "🗑️" : "✓"}</span>
        </div>
        <div class="toast__texto-caja">
            <p class="toast__mensaje">${mensaje}</p>
        </div>
    `;

    toastContenedor.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast--salida");
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, 2500);
}

/**
 * Copia un texto al portapapeles del navegador con compatibilidad moderna y fallback
 * @param {string} texto 
 * @returns {Promise<boolean>}
 */
async function copiarAlPortapapeles(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(texto);
            return true;
        } catch (error) {
            console.warn("Clipboard API falló, usando fallback de textarea:", error);
        }
    }

    try {
        const areaTemporal = document.createElement("textarea");
        areaTemporal.value = texto;
        areaTemporal.setAttribute("readonly", "");
        areaTemporal.style.position = "fixed";
        areaTemporal.style.left = "-9999px";
        document.body.appendChild(areaTemporal);
        areaTemporal.select();
        const copiado = document.execCommand("copy");
        document.body.removeChild(areaTemporal);
        return copiado;
    } catch (error) {
        console.error("Error al copiar al portapapeles:", error);
        return false;
    }
}

/**
 * Genera el texto formateado con los productos del carrito para enviar por Instagram Direct
 * @param {Array} items 
 * @param {number} total 
 * @param {number} nroOrden 
 * @returns {string}
 */
function generarTextoPedido(items, total, nroOrden) {
    let mensaje = `¡Hola Embrollitos MaLu! 👋 Quiero coordinar este pedido realizado en la web:\n\n`;
    items.forEach((item, index) => {
        mensaje += `${index + 1}. ${item.nombre} (x${item.cantidad}) - ${formatearPrecio(item.precio * item.cantidad)}\n`;
    });
    mensaje += `\n📦 Total: ${formatearPrecio(total)}`;
    mensaje += `\n🚚 Envío: ¡Gratis!`;
    mensaje += `\n🔖 N° de orden: #${nroOrden}`;
    mensaje += `\n\n¿Me indican cómo continuar con el diseño, pago y entrega? ¡Muchas gracias!`;
    return mensaje;
}

/* ==========================================================================
   5. Persistencia en LocalStorage
   Implementación vista en cátedra UTN: JSON.stringify() y JSON.parse()
   ========================================================================== */
function guardarCarritoEnStorage() {
    try {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(carrito));
    } catch (error) {
        console.error("Error al guardar en localStorage:", error);
    }
}

function cargarCarritoDesdeStorage() {
    try {
        const datosStorage = localStorage.getItem(CLAVE_STORAGE);
        if (datosStorage) {
            const items = JSON.parse(datosStorage);
            carrito = items.map((item) => ({
                ...item,
                id: String(item.id),
                precio: typeof item.precio === "number" ? item.precio : parseInt(String(item.precio).replace(/[^0-9]/g, ""), 10) || 0
            }));
        } else {
            carrito = [];
        }
    } catch (error) {
        console.error("Error al recuperar el carrito de localStorage:", error);
        carrito = [];
    }
}

/* ==========================================================================
   6. Renderizado del Catálogo de Productos
   Cumple estrictamente la regla de encerrar elementos inline en bloques
   ========================================================================== */
/**
 * Renderiza la lista filtrada u ordenada de productos en la grilla del DOM
 * @param {Array} listaProductos 
 */
function renderizarCatalogo(listaProductos) {
    grillaProductos.innerHTML = "";

    if (!listaProductos || listaProductos.length === 0) {
        sinResultados.classList.remove("mensaje-aviso--oculto");
        return;
    }

    sinResultados.classList.add("mensaje-aviso--oculto");

    listaProductos.forEach((producto) => {
        // Clase badge sanitizada para CSS (reemplaza espacios por guiones)
        const claseBadge = producto.categoria.toLowerCase().replace(/\s+/g, "-");

        // Elemento de bloque contenedor
        const card = document.createElement("article");
        card.className = "card-producto";

        // Estructura HTML con riguroso respeto semántico y elementos en línea encapsulados
        card.innerHTML = `
            <div class="card-producto__imagen-caja">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="card-producto__imagen" loading="lazy" onerror="this.onerror=null; this.src='logo_blancoNegro.jpg';">
            </div>
            <div class="card-producto__cuerpo">
                <div class="card-producto__categoria-caja">
                    <span class="badge-categoria badge-categoria--${claseBadge}">${producto.categoria}</span>
                </div>
                <h3 class="card-producto__titulo">${producto.nombre}</h3>
                <p class="card-producto__descripcion">${producto.descripcion}</p>
                <div class="card-producto__precio-caja">
                    <p class="card-producto__precio">${formatearPrecio(producto.precio)}</p>
                </div>
                <div class="card-producto__acciones-caja">
                    <button type="button" class="btn-agregar-carrito" data-id="${producto.id}">
                        <span aria-hidden="true">🛒</span>
                        <span>Agregar al carrito</span>
                    </button>
                </div>
            </div>
        `;

        grillaProductos.appendChild(card);
    });
}

/**
 * Filtra y ordena los productos en tiempo real según el estado de los controles
 */
function aplicarFiltrosYOrden() {
    const texto = inputBusqueda.value.trim().toLowerCase();
    const categoria = selectCategoria.value;
    const orden = selectOrden.value;

    let resultado = catalogoProductos.filter((prod) => {
        const coincideNombre = prod.nombre.toLowerCase().includes(texto);
        const coincideDesc = prod.descripcion.toLowerCase().includes(texto);
        const coincideCatTexto = prod.categoria.toLowerCase().includes(texto);
        const coincideTexto = coincideNombre || coincideDesc || coincideCatTexto;
        const coincideCat = categoria === "todas" || prod.categoria.toLowerCase() === categoria.toLowerCase();
        return coincideTexto && coincideCat;
    });

    // Ordenamiento dinámico
    if (orden === "precio-menor") {
        resultado.sort((a, b) => a.precio - b.precio);
    } else if (orden === "precio-mayor") {
        resultado.sort((a, b) => b.precio - a.precio);
    } else if (orden === "nombre-az") {
        resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    renderizarCatalogo(resultado);
}

/* ==========================================================================
   7. Lógica y Operaciones del Carrito de Compras
   ========================================================================== */
/**
 * Agrega un producto al carrito o incrementa su cantidad si ya existe
 * @param {string|number} idProducto 
 */
function agregarAlCarrito(idProducto) {
    const idStr = String(idProducto);
    const productoExistente = carrito.find((item) => String(item.id) === idStr);

    if (productoExistente) {
        productoExistente.cantidad += 1;
        mostrarToast(`Se sumó otra unidad de "${productoExistente.nombre}"`, "exito");
    } else {
        const productoCatalogo = catalogoProductos.find((p) => String(p.id) === idStr);
        if (!productoCatalogo) return;

        carrito.push({
            id: productoCatalogo.id,
            nombre: productoCatalogo.nombre,
            precio: productoCatalogo.precio,
            imagen: productoCatalogo.imagen,
            cantidad: 1
        });

        mostrarToast(`"${productoCatalogo.nombre}" agregado al carrito`, "exito");
    }

    guardarCarritoEnStorage();
    actualizarCarritoUI();
}

/**
 * Modifica la cantidad de un ítem del carrito (+1 o -1)
 * @param {string|number} idProducto 
 * @param {number} variacion (+1 o -1)
 */
function modificarCantidad(idProducto, variacion) {
    const idStr = String(idProducto);
    const item = carrito.find((p) => String(p.id) === idStr);
    if (!item) return;

    item.cantidad += variacion;

    if (item.cantidad <= 0) {
        eliminarDelCarrito(idProducto);
        return;
    }

    guardarCarritoEnStorage();
    actualizarCarritoUI();
}

/**
 * Elimina un producto específico del carrito
 * @param {string|number} idProducto 
 */
function eliminarDelCarrito(idProducto) {
    const idStr = String(idProducto);
    const productoAEliminar = carrito.find((p) => String(p.id) === idStr);
    carrito = carrito.filter((item) => String(item.id) !== idStr);

    guardarCarritoEnStorage();
    actualizarCarritoUI();

    if (productoAEliminar) {
        mostrarToast(`"${productoAEliminar.nombre}" eliminado del carrito`, "peligro");
    }
}

/**
 * Vacía completamente el carrito de compras
 */
function vaciarCarrito() {
    if (carrito.length === 0) return;

    if (confirm("¿Estás seguro de que querés vaciar todos los productos del carrito?")) {
        carrito = [];
        guardarCarritoEnStorage();
        actualizarCarritoUI();
        mostrarToast("El carrito fue vaciado", "peligro");
    }
}

/**
 * Calcula los totales y subtotales monetarios y cantidad de artículos
 * @returns {Object} { totalItems, subtotal, total }
 */
function calcularTotales() {
    const totalItems = carrito.reduce((acum, item) => acum + item.cantidad, 0);
    const subtotal = carrito.reduce((acum, item) => acum + item.precio * item.cantidad, 0);
    const total = subtotal; // Envío bonificado

    return { totalItems, subtotal, total };
}

/**
 * Renderiza el estado visual del carrito y sincroniza contadores
 */
function actualizarCarritoUI() {
    const { totalItems, subtotal, total } = calcularTotales();

    // Actualizar badges e indicadores
    contadorCarrito.textContent = totalItems;
    carritoItemsContador.textContent = totalItems;
    carritoSubtotal.textContent = formatearPrecio(subtotal);
    carritoTotal.textContent = formatearPrecio(total);

    // Estados vacío vs con productos
    if (carrito.length === 0) {
        carritoListado.innerHTML = "";
        carritoListado.style.display = "none";
        carritoVacio.style.display = "flex";
        if (carritoAvisoInstagram) {
            carritoAvisoInstagram.style.display = "none";
        }
        btnVaciarCarrito.disabled = true;
        btnFinalizarCompra.disabled = true;
        return;
    }

    carritoVacio.style.display = "none";
    carritoListado.style.display = "flex";
    if (carritoAvisoInstagram) {
        carritoAvisoInstagram.style.display = "flex";
    }
    btnVaciarCarrito.disabled = false;
    btnFinalizarCompra.disabled = false;

    // Renderizado de ítems del carrito
    carritoListado.innerHTML = "";

    carrito.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "carrito-item";

        // Estructura semántica estricta: inline dentro de bloque
        itemDiv.innerHTML = `
            <div class="carrito-item__img-caja">
                <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item__img">
            </div>
            <div class="carrito-item__info">
                <h4 class="carrito-item__titulo">${item.nombre}</h4>
                <p class="carrito-item__precio-unitario">Unitario: ${formatearPrecio(item.precio)}</p>
                <div class="carrito-item__fila-inferior">
                    <div class="carrito-item__controles">
                        <button type="button" class="btn-cantidad btn-decrementar" data-id="${item.id}" aria-label="Restar una unidad">
                            <span aria-hidden="true">-</span>
                        </button>
                        <span class="carrito-item__cantidad-valor">${item.cantidad}</span>
                        <button type="button" class="btn-cantidad btn-incrementar" data-id="${item.id}" aria-label="Sumar una unidad">
                            <span aria-hidden="true">+</span>
                        </button>
                    </div>
                    <div class="carrito-item__subtotal-caja">
                        <p class="carrito-item__subtotal">${formatearPrecio(item.precio * item.cantidad)}</p>
                    </div>
                </div>
            </div>
            <div class="carrito-item__eliminar-caja">
                <button type="button" class="btn-eliminar-item" data-id="${item.id}" aria-label="Eliminar ${item.nombre}">
                    <span aria-hidden="true">🗑️</span>
                </button>
            </div>
        `;

        carritoListado.appendChild(itemDiv);
    });
}

/* ==========================================================================
   8. Apertura, Cierre y Modales
   ========================================================================== */
function abrirCarrito() {
    carritoDrawer.classList.add("abierto");
    carritoDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Previene scroll de fondo
}

function cerrarCarrito() {
    carritoDrawer.classList.remove("abierto");
    carritoDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

async function finalizarCompra() {
    if (carrito.length === 0) return;

    const { totalItems, total } = calcularTotales();
    const nroOrden = Math.floor(100000 + Math.random() * 900000);

    // Generar el mensaje formateado con los productos exactos que se quisieron comprar
    ultimoTextoPedido = generarTextoPedido(carrito, total, nroOrden);

    // Intentar copiar automáticamente al portapapeles
    const copiadoExitoso = await copiarAlPortapapeles(ultimoTextoPedido);

    // Cargar en el textarea del modal para que el usuario pueda verlo y copiarlo
    if (modalTextoPedido) {
        modalTextoPedido.value = ultimoTextoPedido;
    }

    // Generar detalle para el modal de confirmación
    modalResumen.innerHTML = `
        <div class="modal__resumen-fila">
            <p><strong>Artículos en el pedido:</strong> ${totalItems} unidad(es)</p>
        </div>
        <div class="modal__resumen-fila">
            <p><strong>Total estimado:</strong> ${formatearPrecio(total)}</p>
        </div>
        <div class="modal__resumen-fila">
            <p><strong>N° de orden:</strong> #${nroOrden}</p>
        </div>
        <div class="modal__resumen-fila">
            <p><strong>Portapapeles:</strong> ${copiadoExitoso ? "📋 ¡Detalle copiado! Presioná Pegar (Ctrl + V) en el chat." : "⚠️ Copiá el texto del recuadro para enviarlo."}</p>
        </div>
    `;

    // Cerrar drawer y mostrar modal de éxito
    cerrarCarrito();
    modalCheckout.classList.remove("modal--oculto");

    if (copiadoExitoso) {
        mostrarToast("📋 ¡Detalle del pedido copiado al portapapeles!", "exito");
    }

    // Vaciar carrito y limpiar storage tras concretar compra
    carrito = [];
    guardarCarritoEnStorage();
    actualizarCarritoUI();
}

function cerrarModalCheckout() {
    modalCheckout.classList.add("modal--oculto");
}

/**
 * Carga e inicializa el catálogo desde PRODUCTOS o alternativamente desde productos.json
 */
async function cargarCatalogo() {
    if (typeof PRODUCTOS !== "undefined" && Array.isArray(PRODUCTOS) && PRODUCTOS.length > 0) {
        catalogoProductos = normalizarCatalogo(PRODUCTOS);
    } else {
        try {
            const respuesta = await fetch("productos.json");
            if (respuesta.ok) {
                const datos = await respuesta.json();
                catalogoProductos = normalizarCatalogo(datos);
            }
        } catch (error) {
            console.warn("No se pudo cargar productos.json mediante fetch:", error);
        }
    }

    inicializarCategorias(catalogoProductos);
    renderizarCatalogo(catalogoProductos);
}

/* ==========================================================================
   9. Registro de Eventos (Event Listeners)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Cargar persistencia inicial
    cargarCarritoDesdeStorage();

    // 2. Render inicial del catálogo normalizado y del carrito
    await cargarCatalogo();
    actualizarCarritoUI();

    // 3. Apertura y cierre del drawer lateral
    btnAbrirCarrito.addEventListener("click", abrirCarrito);
    btnCerrarCarrito.addEventListener("click", cerrarCarrito);
    carritoOverlay.addEventListener("click", cerrarCarrito);

    // Cerrar drawer con tecla Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (carritoDrawer.classList.contains("abierto")) {
                cerrarCarrito();
            }
            if (!modalCheckout.classList.contains("modal--oculto")) {
                cerrarModalCheckout();
            }
        }
    });

    // 4. Delegación de eventos para agregar productos al carrito desde la grilla
    grillaProductos.addEventListener("click", (e) => {
        const botonAgregar = e.target.closest(".btn-agregar-carrito");
        if (botonAgregar) {
            const id = botonAgregar.dataset.id;
            agregarAlCarrito(id);
        }
    });

    // 5. Delegación de eventos en el carrito (controles de incremento, decremento y eliminar)
    carritoListado.addEventListener("click", (e) => {
        const botonIncrementar = e.target.closest(".btn-incrementar");
        if (botonIncrementar) {
            const id = botonIncrementar.dataset.id;
            modificarCantidad(id, 1);
            return;
        }

        const botonDecrementar = e.target.closest(".btn-decrementar");
        if (botonDecrementar) {
            const id = botonDecrementar.dataset.id;
            modificarCantidad(id, -1);
            return;
        }

        const botonEliminar = e.target.closest(".btn-eliminar-item");
        if (botonEliminar) {
            const id = botonEliminar.dataset.id;
            eliminarDelCarrito(id);
            return;
        }
    });

    // 6. Botones de acción del carrito
    btnVaciarCarrito.addEventListener("click", vaciarCarrito);
    btnFinalizarCompra.addEventListener("click", finalizarCompra);

    // 7. Modal de checkout
    btnCerrarModal.addEventListener("click", cerrarModalCheckout);
    modalOverlay.addEventListener("click", cerrarModalCheckout);

    if (btnCopiarNuevamente) {
        btnCopiarNuevamente.addEventListener("click", async () => {
            if (ultimoTextoPedido) {
                const copiado = await copiarAlPortapapeles(ultimoTextoPedido);
                if (copiado) {
                    mostrarToast("📋 ¡Mensaje del pedido vuelto a copiar!", "exito");
                }
            }
        });
    }

    // 8. Búsqueda y filtrado dinámico
    inputBusqueda.addEventListener("input", aplicarFiltrosYOrden);
    selectCategoria.addEventListener("change", aplicarFiltrosYOrden);
    selectOrden.addEventListener("change", aplicarFiltrosYOrden);

    btnLimpiarFiltros.addEventListener("click", () => {
        inputBusqueda.value = "";
        selectCategoria.value = "todas";
        selectOrden.value = "destacados";
        aplicarFiltrosYOrden();
    });
});
