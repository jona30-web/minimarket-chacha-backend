// Importar las librerías necesarias
const express = require('express');
const cors = require('cors'); // Para permitir peticiones desde tu frontend
const bodyParser = require('body-parser'); // Para parsear el cuerpo de las peticiones JSON

// Inicializar la aplicación Express
const app = express();
const port = 3000; // El puerto en el que correrá tu servidor

// --- Configuración de Middlewares ---

// Usar CORS: Permite que tu frontend (que está en un dominio diferente, el de Replit para tu frontend)
// pueda hacer peticiones a este backend.
app.use(cors());

// Usar body-parser para parsear el cuerpo de las pet peticiones como JSON
app.use(bodyParser.json());

// --- Base de Datos en Memoria (para el ejemplo) ---
// En un proyecto real, esto sería una base de datos como MongoDB, PostgreSQL, MySQL, etc.
// Usamos un array simple para almacenar los productos.
let productos = [
    { id: 'prod001', codigo: 'ABC001', nombre: 'Azúcar (1kg)', categoria: 'Abarrotes', stock: 50, precio: 1.25 },
    { id: 'prod002', codigo: 'ABC002', nombre: 'Aceite Vegetal (1L)', categoria: 'Abarrotes', stock: 30, precio: 3.50 },
    { id: 'prod003', codigo: 'XYZ003', nombre: 'Leche Entera (1L)', categoria: 'Lácteos', stock: 20, precio: 1.10 },
    { id: 'prod004', codigo: 'PQR004', nombre: 'Pan de Molde', categoria: 'Panadería', stock: 5, precio: 2.00 }, // Ejemplo de stock bajo
    { id: 'prod005', codigo: 'QWE005', nombre: 'Gaseosa Coca-Cola (2.5L)', categoria: 'Bebidas', stock: 0, precio: 2.75 }, // Ejemplo sin stock
    { id: 'prod006', codigo: 'MNB006', nombre: 'Galletas Chispas (paq)', categoria: 'Snacks', stock: 40, precio: 1.70 },
    { id: 'prod007', codigo: 'JKL007', nombre: 'Jugo de Naranja (1L)', categoria: 'Bebidas', stock: 25, precio: 2.15 },
    { id: 'prod008', codigo: 'FGH008', nombre: 'Arroz (5kg)', categoria: 'Abarrotes', stock: 15, precio: 6.00 }
];

// Función para generar un ID único simple (para productos nuevos)
const generateId = () => {
    return 'prod' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
};

// --- Rutas de la API (Endpoints) ---

// 1. GET /api/productos - Obtener todos los productos
app.get('/api/productos', (req, res) => {
    console.log('GET /api/productos - Solicitud recibida');
    // Simular un pequeño retraso para emular una API real (opcional)
    setTimeout(() => {
        res.status(200).json({
            message: 'success',
            data: productos
        });
    }, 500); // Retraso de 500ms
});

// 2. GET /api/productos/:id - Obtener un producto por ID
app.get('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    console.log(`GET /api/productos/${id} - Solicitud recibida`);
    const producto = productos.find(p => p.id === id);

    if (producto) {
        res.status(200).json({
            message: 'success',
            data: producto
        });
    } else {
        res.status(404).json({
            message: 'error',
            error: 'Producto no encontrado'
        });
    }
});

// 3. POST /api/productos - Agregar un nuevo producto
app.post('/api/productos', (req, res) => {
    const nuevoProducto = req.body;
    console.log('POST /api/productos - Solicitud recibida con datos:', nuevoProducto);

    // Validaciones básicas
    if (!nuevoProducto.codigo || !nuevoProducto.nombre || !nuevoProducto.stock || !nuevoProducto.precio) {
        return res.status(400).json({
            message: 'error',
            error: 'Faltan campos obligatorios (codigo, nombre, stock, precio).'
        });
    }
    if (productos.some(p => p.codigo === nuevoProducto.codigo)) {
        return res.status(409).json({ // 409 Conflict
            message: 'error',
            error: `El producto con código '${nuevoProducto.codigo}' ya existe.`
        });
    }

    nuevoProducto.id = generateId(); // Asignar un ID único
    nuevoProducto.stock = parseInt(nuevoProducto.stock); // Asegurar que stock sea número
    nuevoProducto.precio = parseFloat(nuevoProducto.precio); // Asegurar que precio sea número
    if (isNaN(nuevoProducto.stock) || isNaN(nuevoProducto.precio) || nuevoProducto.stock < 0 || nuevoProducto.precio < 0) {
        return res.status(400).json({
            message: 'error',
            error: 'Stock y Precio deben ser números válidos y no negativos.'
        });
    }

    productos.push(nuevoProducto);
    res.status(201).json({ // 201 Created
        message: 'Producto agregado exitosamente',
        data: nuevoProducto
    });
});

// 4. PUT /api/productos/:id - Actualizar un producto existente
app.put('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const datosActualizados = req.body;
    console.log(`PUT /api/productos/${id} - Solicitud recibida con datos:`, datosActualizados);

    const index = productos.findIndex(p => p.id === id);

    if (index !== -1) {
        // Validaciones básicas para los campos actualizados
        if (datosActualizados.nombre === undefined || datosActualizados.stock === undefined || datosActualizados.precio === undefined) {
             return res.status(400).json({
                message: 'error',
                error: 'Faltan campos obligatorios para actualizar (nombre, stock, precio).'
            });
        }
        datosActualizados.stock = parseInt(datosActualizados.stock);
        datosActualizados.precio = parseFloat(datosActualizados.precio);

        if (isNaN(datosActualizados.stock) || isNaN(datosActualizados.precio) || datosActualizados.stock < 0 || datosActualizados.precio < 0) {
            return res.status(400).json({
                message: 'error',
                error: 'Stock y Precio deben ser números válidos y no negativos.'
            });
        }

        // Actualizar solo los campos que vienen en la petición (excluyendo el id y codigo si no se deben cambiar)
        productos[index] = {
            ...productos[index], // Mantener campos existentes como el codigo
            nombre: datosActualizados.nombre,
            categoria: datosActualizados.categoria || productos[index].categoria, // Mantener categoría si no se envía
            stock: datosActualizados.stock,
            precio: datosActualizados.precio
        };

        res.status(200).json({
            message: 'Producto actualizado exitosamente',
            data: productos[index]
        });
    } else {
        res.status(404).json({
            message: 'error',
            error: 'Producto no encontrado'
        });
    }
});

// 5. DELETE /api/productos/:id - Eliminar un producto
app.delete('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /api/productos/${id} - Solicitud recibida`);

    const initialLength = productos.length;
    productos = productos.filter(p => p.id !== id);

    if (productos.length < initialLength) {
        res.status(200).json({
            message: 'Producto eliminado exitosamente',
            data: { id: id }
        });
    } else {
        res.status(404).json({
            message: 'error',
            error: 'Producto no encontrado'
        });
    }
});

// --- Inicio del Servidor ---
app.listen(port, () => {
    console.log(`Servidor backend de Minimarket Chacha corriendo en el puerto ${port}`);
    console.log(`Accede a la API en: http://localhost:${port}/api/productos (desde Replit)`);
    console.log(`Asegúrate de actualizar la BASE_URL en tu frontend con la URL pública de Replit.`);
});
