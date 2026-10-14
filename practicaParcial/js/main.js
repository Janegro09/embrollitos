/**
 * ============================================================================
 * Práctica Parcial - Tienda de Frutas (UTN Div 131)
 * Funcionalidad: Catálogo, Búsqueda, Carrito dinámico, Cálculo de Total
 * Reglas de implementación: Todas las etiquetas inline dentro de bloques
 * ============================================================================
 */

/* ==========================================================================
   1. Datos del Catálogo (Base de Frutas)
   Coincide exactamente con la imagen de referencia (precios e imágenes locales)
   ========================================================================== */
const FRUTAS = [
    { id: 1, nombre: "arandano", precio: 5000, img: "img/arandano.jpg" },
    { id: 2, nombre: "banana", precio: 1000, img: "img/banana.jpg" },
    { id: 3, nombre: "frambuesa", precio: 4000, img: "img/frambuesa.png" },
    { id: 4, nombre: "frutilla", precio: 3000, img: "img/frutilla.jpg" },
    { id: 5, nombre: "kiwi", precio: 2000, img: "img/kiwi.jpg" },
    { id: 6, nombre: "mandarina", precio: 800, img: "img/mandarina.jpg" },
    { id: 7, nombre: "manzana", precio: 1500, img: "img/manzana.jpg" },
    { id: 8, nombre: "naranja", precio: 9000, img: "img/naranja.jpg" },
    { id: 9, nombre: "pera", precio: 2500, img: "img/pera.jpg" },
    { id: 10, nombre: "anana", precio: 3000, img: "img/anana.jpg" },
    { id: 11, nombre: "pomelo-amarillo", precio: 2000, img: "img/pomelo-amarillo.jpg" },
    { id: 12, nombre: "pomelo-rojo", precio: 2000, img: "img/pomelo-rojo.jpg" }
];

/* ==========================================================================
   2. Estado del Carrito y Persistencia Local
   ========================================================================== */
const STORAGE_KEY = "carritoFrutas";
let carrito = [];

/* ==========================================================================
   3. Referencias a Elementos del DOM
   ========================================================================== */
const contenedorFrutas = document.getElementById("contenedor-frutas");
const contenedorCarritoLista = document.getElementById("contenedor-carrito-lista");
const headerCarritoContador = document.getElementById("header-carrito-contador");
const carritoTotalTexto = document.getElementById("carrito-total-texto");
const inputBuscar = document.getElementById("input-buscar");

/* ==========================================================================
   4. Funciones de Persistencia
   ========================================================================== */
function guardarCarritoStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
    } catch (e) {
        console.error("Error al guardar carrito:", e);
    }
}

function cargarCarritoStorage() {
    try {
        const guardado = localStorage.getItem(STORAGE_KEY);
        if (guardado) {
            carrito = JSON.parse(guardado);
        } else {
            carrito = [];
        }
    } catch (e) {
        console.error("Error al leer carrito:", e);
        carrito = [];
    }
}

/* ==========================================================================
   5. Renderizado del Catálogo de Frutas
   Regla UTN: Todos los elementos inline (img, button) contenidos en bloques (div)
   ========================================================================== */
function renderizarFrutas(lista) {
    contenedorFrutas.innerHTML = "";

    lista.forEach((fruta) => {
        const card = document.createElement("div");
        card.className = "card-fruta";

        card.innerHTML = `
            <div class="card-fruta__img-caja">
                <img src="${fruta.img}" alt="${fruta.nombre}" class="card-fruta__img">
            </div>
            <div class="card-fruta__info">
                <p class="card-fruta__nombre">${fruta.nombre}</p>
                <p class="card-fruta__precio">$${fruta.precio}</p>
            </div>
            <div class="card-fruta__btn-caja">
                <button type="button" class="btn-agregar" data-id="${fruta.id}">Agregar a carrito</button>
            </div>
        `;

        contenedorFrutas.appendChild(card);
    });
}

/* ==========================================================================
   6. Renderizado del Carrito y Totales
   ========================================================================== */
function renderizarCarrito() {
    contenedorCarritoLista.innerHTML = "";

    carrito.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "carrito-item";

        itemDiv.innerHTML = `
            <div class="carrito-item__info">
                <p>${item.nombre} - $${item.precio}</p>
            </div>
            <div class="carrito-item__btn-caja">
                <button type="button" class="btn-eliminar" data-id-unico="${item.idUnico}">Eliminar</button>
            </div>
        `;

        contenedorCarritoLista.appendChild(itemDiv);
    });

    // Cálculo dinámico del total
    const total = carrito.reduce((acumulado, item) => acumulado + item.precio, 0);

    // Actualización de textos en pantalla
    carritoTotalTexto.textContent = `Total: $${total}`;
    headerCarritoContador.textContent = `Carrito: ${carrito.length} productos`;
}

/* ==========================================================================
   7. Operaciones del Carrito (Agregar y Eliminar)
   ========================================================================== */
function agregarAlCarrito(idFruta) {
    const frutaSeleccionada = FRUTAS.find((f) => f.id === idFruta);
    if (!frutaSeleccionada) return;

    // Cada item agregado tiene un identificador único para eliminación precisa
    const itemCarrito = {
        idUnico: Date.now() + Math.random(),
        id: frutaSeleccionada.id,
        nombre: frutaSeleccionada.nombre,
        precio: frutaSeleccionada.precio
    };

    carrito.push(itemCarrito);
    guardarCarritoStorage();
    renderizarCarrito();
}

function eliminarDelCarrito(idUnico) {
    carrito = carrito.filter((item) => item.idUnico !== Number(idUnico));
    guardarCarritoStorage();
    renderizarCarrito();
}

/* ==========================================================================
   8. Filtrado por Búsqueda
   ========================================================================== */
function filtrarFrutas() {
    const termino = inputBuscar.value.trim().toLowerCase();
    const filtradas = FRUTAS.filter((fruta) =>
        fruta.nombre.toLowerCase().includes(termino)
    );
    renderizarFrutas(filtradas);
}

/* ==========================================================================
   9. Inicialización y Event Listeners
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar persistencia
    cargarCarritoStorage();

    // 2. Renderizar vistas iniciales
    renderizarFrutas(FRUTAS);
    renderizarCarrito();

    // 3. Delegación de eventos para agregar fruta al carrito
    contenedorFrutas.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-agregar");
        if (btn) {
            const id = Number(btn.dataset.id);
            agregarAlCarrito(id);
        }
    });

    // 4. Delegación de eventos para eliminar del carrito
    contenedorCarritoLista.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-eliminar");
        if (btn) {
            const idUnico = btn.dataset.idUnico;
            eliminarDelCarrito(idUnico);
        }
    });

    // 5. Búsqueda reactiva en tiempo real
    inputBuscar.addEventListener("input", filtrarFrutas);
});
