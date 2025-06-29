// index.js (Backend)

// 1. Importar las librerías necesarias
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Para procesar el cuerpo de las peticiones JSON

// 2. Inicializar la aplicación Express
const app = express();
const port = process.env.PORT || 3000; // Usa el puerto de Render o el 3000

// 3. Configuración de Middlewares
// CORS: Permite que tu frontend (desde cualquier origen) haga peticiones a tu backend
app.use(cors());
// Body Parser: Para parsear el cuerpo de las peticiones JSON
app.use(bodyParser.json());

// 4. Base de Datos en Memoria (para simular el almacenamiento de datos)
//    ¡Estos arreglos se reinician si el servidor se reinicia!

let productos = [
    { id: 'prod001', nombre: 'Azucar (1kg)', categoria: 'Abarrotes', stock: 20, precio: 1.25 },
    { id: 'prod002', nombre: 'Sal (1kg)', categoria: 'Abarrotes', stock: 15, precio: 0.80 },
    { id: 'prod003', nombre: 'Pan de Molde', categoria: 'Panadería', stock: 10, precio: 2.50 },
    { id: 'prod004', nombre: 'Gaseosa Coca-Cola (2.5L)', categoria: 'Bebidas', stock: 30, precio: 2.75 },
    { id: 'prod005', nombre: 'Galletas Oreo', categoria: 'Snacks', stock: 25, precio: 1.70 },
    { id: 'prod006', nombre: 'Jugo de Naranja (1L)', categoria: 'Bebidas', stock: 18, precio: 2.00 },
    { id: 'prod007', nombre: 'Leche (1L)', categoria: 'Lácteos', stock: 12, precio: 1.10 },
    { id: 'prod008', nombre: 'Arroz (5kg)', categoria: 'Abarrotes', stock: 15, precio: 6.00 }
];

let clientes = [
    { id: 'cli001', nombre: 'Juan Pérez', email: 'juan.perez@example.com', telefono: '0987654321' },
    { id: 'cli002', nombre: 'Ana Gómez', email: 'ana.gomez@example.com', telefono: '0912345678' }
];

let ventas = [
    { id: 'vent001', fecha: '2025-06-28', clienteId: 'cli001', productos: [{ prodId: 'prod001', cantidad: 2 }], total: 2.50 },
    { id: 'vent002', fecha: '2025-06-28', clienteId: 'cli002', productos: [{ prodId: 'prod004', cantidad: 1 }, { prodId: 'prod005', cantidad: 3 }], total: 7.85 }
];

// 5. Función auxiliar para generar un ID único simple
function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

// 6. Rutas de la API (Endpoints)

// --- Endpoints de Productos ---

// GET /api/productos - Obtener todos los productos
app.get('/api/productos', (req, res) => {
    console.log('GET /api/productos - Solicitud de productos');
    res.json(productos);
});

// GET /api/productos/:id - Obtener un producto por ID
app.get('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    const producto = productos.find(p => p.id === id);
    if (producto) {
        res.json(producto);
    } else {
        res.status(404).json({ message: 'Producto no encontrado' });
    }
});

// POST /api/productos - Agregar un nuevo producto
app.post('/api/productos', (req, res) => {
    const nuevoProducto = req.body;
    if (!nuevoProducto.nombre || !nuevoProducto.precio || nuevoProducto.stock === undefined) {
        return res.status(400).json({ message: 'Faltan datos obligatorios para el producto (nombre, precio, stock).' });
    }
    nuevoProducto.id = generateId(); // Asigna un ID único
    productos.push(nuevoProducto);
    console.log('Producto agregado:', nuevoProducto);
    res.status(201).json({ message: 'Producto agregado exitosamente', producto: nuevoProducto });
});

// PUT /api/productos/:id - Actualizar un producto existente
app.put('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    const datosActualizados = req.body;
    const index = productos.findIndex(p => p.id === id);

    if (index !== -1) {
        productos[index] = { ...productos[index], ...datosActualizados, id: id }; // Asegura que el ID no cambie
        console.log('Producto actualizado:', productos[index]);
        res.json({ message: 'Producto actualizado exitosamente', producto: productos[index] });
    } else {
        res.status(404).json({ message: 'Producto no encontrado para actualizar' });
    }
});

// DELETE /api/productos/:id - Eliminar un producto
app.delete('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    const longitudInicial = productos.length;
    productos = productos.filter(p => p.id !== id);
    if (productos.length < longitudInicial) {
        console.log('Producto eliminado, ID:', id);
        res.status(204).send(); // 204 No Content para eliminación exitosa
    } else {
        res.status(404).json({ message: 'Producto no encontrado para eliminar' });
    }
});


// --- Endpoints de Clientes ---

// GET /api/clientes - Obtener todos los clientes
app.get('/api/clientes', (req, res) => {
    console.log('GET /api/clientes - Solicitud de clientes');
    res.json(clientes);
});

// POST /api/clientes - Agregar un nuevo cliente
app.post('/api/clientes', (req, res) => {
    const nuevoCliente = req.body;
    if (!nuevoCliente.nombre || !nuevoCliente.email) {
        return res.status(400).json({ message: 'Faltan datos obligatorios para el cliente (nombre, email).' });
    }
    nuevoCliente.id = generateId();
    clientes.push(nuevoCliente);
    console.log('Cliente agregado:', nuevoCliente);
    res.status(201).json({ message: 'Cliente agregado exitosamente', cliente: nuevoCliente });
});

// --- Endpoints de Ventas ---

// GET /api/ventas - Obtener todas las ventas
app.get('/api/ventas', (req, res) => {
    console.log('GET /api/ventas - Solicitud de ventas');
    res.json(ventas);
});

// POST /api/ventas - Registrar una nueva venta
app.post('/api/ventas', (req, res) => {
    const nuevaVenta = req.body;
    if (!nuevaVenta.clienteId || !nuevaVenta.productos || !Array.isArray(nuevaVenta.productos) || nuevaVenta.productos.length === 0) {
        return res.status(400).json({ message: 'Faltan datos obligatorios para la venta (clienteId, productos).' });
    }

    // Calcular el total de la venta y ajustar el stock de los productos
    let totalVenta = 0;
    const productosVendidos = [];
    const productosNoEncontrados = [];

    nuevaVenta.productos.forEach(itemVenta => {
        const productoEnStock = productos.find(p => p.id === itemVenta.prodId);
        if (productoEnStock && productoEnStock.stock >= itemVenta.cantidad) {
            totalVenta += productoEnStock.precio * itemVenta.cantidad;
            productoEnStock.stock -= itemVenta.cantidad; // Reduce el stock
            productosVendidos.push({
                prodId: itemVenta.prodId,
                nombre: productoEnStock.nombre,
                cantidad: itemVenta.cantidad,
                precioUnitario: productoEnStock.precio
            });
        } else {
            productosNoEncontrados.push(itemVenta.prodId);
        }
    });

    if (productosNoEncontrados.length > 0) {
        return res.status(400).json({ message: `Algunos productos no están disponibles o no hay suficiente stock: ${productosNoEncontrados.join(', ')}` });
    }

    nuevaVenta.id = generateId();
    nuevaVenta.fecha = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    nuevaVenta.total = totalVenta;
    nuevaVenta.productos = productosVendidos; // Guarda los detalles de los productos vendidos

    ventas.push(nuevaVenta);
    console.log('Venta registrada:', nuevaVenta);
    res.status(201).json({ message: 'Venta registrada exitosamente', venta: nuevaVenta });
});


// 7. Iniciar el servidor
app.listen(port, () => {
    console.log(`Backend de Minimarket corriendo en el puerto ${port}`);
    console.log(`Accede a la API de Productos en: http://localhost:${port}/api/productos`);
    // Asegúrate de actualizar la BASE_URL en tu frontend con la URL pública de Render.
});
