let listaProductos = [];
let carrito = obtenerDeStorage("carritoHardware") || [];

const contenedorProductos = document.getElementById("contenedorProductos");
const itemsCarrito = document.getElementById("itemsCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");
const precioTotal = document.getElementById("precioTotal");
const inputBusqueda = document.getElementById("inputBusqueda");
const btnVaciarCarrito = document.getElementById("btnVaciarCarrito");
const btnFinalizarCompra = document.getElementById("btnFinalizarCompra");

// Cargar productos usando fetch con async/await, try/catch y finally
const cargarProductos = async () => {
    try {
        const respuesta = await fetch("assets/json/productos.json");
        
        if (!respuesta.ok) {
            throw new Error("Error al conectar con el archivo de productos.");
        }

        listaProductos = await respuesta.json();
        mostrarProductos(listaProductos);
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudieron cargar los productos.",
        });
    } finally {
        console.log("Carga de catálogo finalizada.");
    }
};

// Renderizar productos en el DOM (Función de orden superior: forEach)
const mostrarProductos = (productosAMostrar) => {
    contenedorProductos.innerHTML = "";

    productosAMostrar.forEach(({ id, nombre, precio, imagen }) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "col";
        tarjeta.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${imagen}" class="card-img-top" alt="${nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title fs-6 fw-bold">${nombre}</h5>
                    <p class="card-text text-success fw-bold fs-5 mt-auto">$${precio.toLocaleString()}</p>
                    <button class="btn btn-dark btn-sm mt-2 w-100" onclick="agregarAlCarrito(${id})">Agregar al Carrito</button>
                </div>
            </div>
        `;
        contenedorProductos.appendChild(tarjeta);
    });
};

// Agregar producto al carrito
const agregarAlCarrito = (idProducto) => {
    const productoEncontrado = listaProductos.find(prod => prod.id === idProducto);
    const itemEnCarrito = carrito.find(prod => prod.id === idProducto);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...productoEncontrado, cantidad: 1 });
    }

    guardarEnStorage("carritoHardware", carrito);
    actualizarCarritoVisual();

    Toastify({
        text: `Agregaste ${productoEncontrado.nombre}`,
        duration: 2000,
        gravity: "bottom",
        position: "right",
        style: { background: "#212529" }
    }).showToast();
};

// Actualizar vista del carrito
const actualizarCarritoVisual = () => {
    itemsCarrito.innerHTML = "";

    carrito.forEach(({ id, nombre, precio, cantidad }) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${nombre}</td>
            <td>$${precio.toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-outline-secondary px-1 py-0" onclick="cambiarCantidad(${id}, -1)">-</button>
                <span class="mx-2">${cantidad}</span>
                <button class="btn btn-sm btn-outline-secondary px-1 py-0" onclick="cambiarCantidad(${id}, 1)">+</button>
            </td>
            <td>$${(precio * cantidad).toLocaleString()}</td>
            <td><button class="btn btn-danger btn-sm" onclick="eliminarItem(${id})">X</button></td>
        `;
        itemsCarrito.appendChild(fila);
    });

    // Función de orden superior: reduce
    const totalAcumulado = carrito.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);
    precioTotal.innerText = totalAcumulado.toLocaleString();

    const totalItems = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
    contadorCarrito.innerText = totalItems;
};

// Modificar cantidad de un producto
const cambiarCantidad = (idProducto, cambio) => {
    const item = carrito.find(prod => prod.id === idProducto);
    if (item) {
        item.cantidad += cambio;
        if (item.cantidad <= 0) {
            carrito = carrito.filter(prod => prod.id !== idProducto);
        }
    }
    guardarEnStorage("carritoHardware", carrito);
    actualizarCarritoVisual();
};

// Eliminar item individual (Función de orden superior: filter)
const eliminarItem = (idProducto) => {
    carrito = carrito.filter(prod => prod.id !== idProducto);
    guardarEnStorage("carritoHardware", carrito);
    actualizarCarritoVisual();
};

// Vaciar todo el carrito
btnVaciarCarrito.addEventListener("click", () => {
    carrito = [];
    limpiarStorage("carritoHardware");
    actualizarCarritoVisual();
    
    Toastify({
        text: "Vaciaste el carrito",
        duration: 2000,
        gravity: "bottom",
        position: "right",
        style: { background: "#dc3545" }
    }).showToast();
});

// Filtrar productos en tiempo real (Función de orden superior: filter)
inputBusqueda.addEventListener("input", (e) => {
    const textoBuscado = e.target.value.toLowerCase();
    const productosFiltrados = listaProductos.filter(prod => 
        prod.nombre.toLowerCase().includes(textoBuscado)
    );
    mostrarProductos(productosFiltrados);
});

// Finalizar compra y limpiar storage
btnFinalizarCompra.addEventListener("click", () => {
    if (carrito.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Carrito vacío",
            text: "Agregá productos antes de confirmar.",
        });
        return;
    }

    Swal.fire({
        title: "¡Compra confirmada!",
        text: "Gracias por tu compra.",
        icon: "success",
        confirmButtonText: "Ok"
    });

    carrito = [];
    limpiarStorage("carritoHardware");
    actualizarCarritoVisual();
    
    const modalElement = document.getElementById("modalCarrito");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
});

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    actualizarCarritoVisual();
});