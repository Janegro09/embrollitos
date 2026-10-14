/**
 * ============================================================================
 * UTN - Programación III - División 131
 * Trabajo Práctico: Funcionalidad Integral de Carrito de Compras
 * Alumno: Javier Sosa
 * Stack: HTML5 Semántico + CSS3 Responsivo + Vanilla JavaScript / DOM API
 * ============================================================================
 */

/* ==========================================================================
   1. Catálogo de Productos (Array de Objetos)
   Rutas relativas estrictas y mapeo exacto de los archivos en ./productos
   ========================================================================== */
const PRODUCTOS = [
    {
        id: 1,
        nombre: "Azucarera Cerámica",
        categoria: "Bazar",
        precio: 8500,
        imagen: "productos/azucarera.png",
        descripcion: "Azucarera de cerámica esmaltada con tapa hermética y excelente acabado."
    },
    {
        id: 2,
        nombre: "Taza Interior Color",
        categoria: "Tazas",
        precio: 7200,
        imagen: "productos/interiorColor.png",
        descripcion: "Taza de cerámica blanca sublimable con interior y asa de color combinados."
    },
    {
        id: 3,
        nombre: "Lunchera Térmica",
        categoria: "Accesorios",
        precio: 14500,
        imagen: "productos/lunchera.png",
        descripcion: "Lunchera térmica acolchada ideal para viandas, bebidas y colaciones."
    },
    {
        id: 4,
        nombre: "Pad Mouse Gamer",
        categoria: "Accesorios",
        precio: 6800,
        imagen: "productos/padMouse.png",
        descripcion: "Superficie de deslizamiento suave con base antideslizante para oficina o gaming."
    },
    {
        id: 5,
        nombre: "Portacelulares de Mesa",
        categoria: "Accesorios",
        precio: 4900,
        imagen: "productos/portacelulares.png",
        descripcion: "Soporte ergonómico de escritorio con espacio pasacable para carga continua."
    },
    {
        id: 6,
        nombre: "Set de Portavasos",
        categoria: "Bazar",
        precio: 3800,
        imagen: "productos/portaVasos.png",
        descripcion: "Juego de posavasos resistentes a la humedad, protege mesas y escritorios."
    },
    {
        id: 7,
        nombre: "Set de Mate Completo",
        categoria: "Bazar",
        precio: 18900,
        imagen: "productos/setMate.png",
        descripcion: "Mate térmico sublimable con bombilla de acero inoxidable y base estable."
    },
    {
        id: 8,
        nombre: "Taza Blanca Clásica",
        categoria: "Tazas",
        precio: 6500,
        imagen: "productos/tazaBlanca.png",
        descripcion: "Taza de porcelana blanca premium con recubrimiento de polímero brillante."
    },
    {
        id: 9,
        nombre: "Taza Cónica",
        categoria: "Tazas",
        precio: 7000,
        imagen: "productos/tazaConica.png",
        descripcion: "Diseño cónico moderno y ergonómico, óptima para capuchinos e infusiones."
    },
    {
        id: 10,
        nombre: "Taza Glitter Brillante",
        categoria: "Tazas",
        precio: 8900,
        imagen: "productos/tazaGlitter.png",
        descripcion: "Acabado glitter metalizado con destellos brillantes de alta resistencia."
    },
    {
        id: 11,
        nombre: "Taza Mágica Térmica",
        categoria: "Tazas",
        precio: 9500,
        imagen: "productos/tazaMagica.png",
        descripcion: "Revela la estampa personalizada al contacto con líquidos calientes."
    },
    {
        id: 12,
        nombre: "Taza Negra Satinada",
        categoria: "Tazas",
        precio: 7800,
        imagen: "productos/tazaNegra.png",
        descripcion: "Taza de cerámica con acabado exterior negro satinado mate de estilo elegante."
    },
    {
        id: 13,
        nombre: "Taza Térmica Workat",
        categoria: "Tazas",
        precio: 12500,
        imagen: "productos/tazaWorkat.png",
        descripcion: "Vaso térmico hermético apto para traslados, mantiene temperatura por horas."
    },
    {
        id: 14,
        nombre: "Yerbero Hermético",
        categoria: "Bazar",
        precio: 8200,
        imagen: "productos/yerbero.png",
        descripcion: "Contenedor hermético con pico vertedor plástico dosificador para yerba mate."
    }
];

/* ==========================================================================
   2. Estado de la Aplicación (State Management)
   ========================================================================== */
const CLAVE_STORAGE = "carrito";
let carrito = [];

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
   4. Funciones de Utilidad y Formateo
   ========================================================================== */
/**
 * Da formato de moneda en pesos argentinos (ARS)
 * @param {number} valor 
 * @returns {string} Ejemplo: "$ 8.500"
 */
function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
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
            carrito = JSON.parse(datosStorage);
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

    if (listaProductos.length === 0) {
        sinResultados.classList.remove("mensaje-aviso--oculto");
        return;
    }

    sinResultados.classList.add("mensaje-aviso--oculto");

    listaProductos.forEach((producto) => {
        // Elemento de bloque contenedor
        const card = document.createElement("article");
        card.className = "card-producto";

        // Estructura HTML con riguroso respeto semántico y elementos en línea encapsulados
        card.innerHTML = `
            <div class="card-producto__imagen-caja">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="card-producto__imagen" loading="lazy">
            </div>
            <div class="card-producto__cuerpo">
                <div class="card-producto__categoria-caja">
                    <span class="badge-categoria badge-categoria--${producto.categoria.toLowerCase()}">${producto.categoria}</span>
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

    let resultado = PRODUCTOS.filter((prod) => {
        const coincideNombre = prod.nombre.toLowerCase().includes(texto);
        const coincideDesc = prod.descripcion.toLowerCase().includes(texto);
        const coincideTexto = coincideNombre || coincideDesc;
        const coincideCat = categoria === "todas" || prod.categoria === categoria;
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
 * @param {number} idProducto 
 */
function agregarAlCarrito(idProducto) {
    const productoExistente = carrito.find((item) => item.id === idProducto);

    if (productoExistente) {
        productoExistente.cantidad += 1;
        mostrarToast(`Se sumó otra unidad de "${productoExistente.nombre}"`, "exito");
    } else {
        const productoCatalogo = PRODUCTOS.find((p) => p.id === idProducto);
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
 * @param {number} idProducto 
 * @param {number} variacion (+1 o -1)
 */
function modificarCantidad(idProducto, variacion) {
    const item = carrito.find((p) => p.id === idProducto);
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
 * @param {number} idProducto 
 */
function eliminarDelCarrito(idProducto) {
    const productoAEliminar = carrito.find((p) => p.id === idProducto);
    carrito = carrito.filter((item) => item.id !== idProducto);

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
        mostrarToast("📋 ¡Detalle copiado! Abrimos Instagram para enviar el pedido", "exito");
    }

    // Abrir Instagram Direct del comercio
    try {
        window.open("https://ig.me/m/embrollitos.malu", "_blank");
    } catch (e) {
        console.warn("No se pudo abrir automáticamente la ventana de Instagram:", e);
    }

    // Vaciar carrito y limpiar storage tras concretar compra
    carrito = [];
    guardarCarritoEnStorage();
    actualizarCarritoUI();
}

function cerrarModalCheckout() {
    modalCheckout.classList.add("modal--oculto");
}

/* ==========================================================================
   9. Registro de Eventos (Event Listeners)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar persistencia inicial
    cargarCarritoDesdeStorage();

    // 2. Render inicial del catálogo y del carrito
    renderizarCatalogo(PRODUCTOS);
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
            const id = Number(botonAgregar.dataset.id);
            agregarAlCarrito(id);
        }
    });

    // 5. Delegación de eventos en el carrito (controles de incremento, decremento y eliminar)
    carritoListado.addEventListener("click", (e) => {
        const botonIncrementar = e.target.closest(".btn-incrementar");
        if (botonIncrementar) {
            const id = Number(botonIncrementar.dataset.id);
            modificarCantidad(id, 1);
            return;
        }

        const botonDecrementar = e.target.closest(".btn-decrementar");
        if (botonDecrementar) {
            const id = Number(botonDecrementar.dataset.id);
            modificarCantidad(id, -1);
            return;
        }

        const botonEliminar = e.target.closest(".btn-eliminar-item");
        if (botonEliminar) {
            const id = Number(botonEliminar.dataset.id);
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
