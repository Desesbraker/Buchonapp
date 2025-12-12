/**
 * ALMACENAMIENTO - BuchonApp v2.0
 * 
 * Re-exporta todas las funciones desde el módulo con soporte Firebase.
 * Para sincronización entre dispositivos, configura Firebase en:
 * src/config/firebase.js
 */

export {
  // Pedidos
  obtenerSiguienteNumeroPedido,
  guardarPedido,
  obtenerPedidos,
  actualizarPedido,
  eliminarPedido,
  suscribirPedidos,
  
  // Productos
  guardarProductos,
  obtenerProductos,
  agregarProducto,
  actualizarProducto,
  eliminarProducto,
  
  // Categorías
  guardarCategorias,
  obtenerCategorias,
  agregarCategoria,
  eliminarCategoria,
  
  // Gastos
  guardarGasto,
  obtenerGastos,
  eliminarGasto,
  suscribirGastos,
  
  // Clientes (legacy)
  guardarClientes,
  obtenerClientes,
  
  // Orden de entregas
  guardarOrdenEntregas,
  obtenerOrdenEntregas,
  obtenerTodasLasOrdenesEntregas,
  
  // Inventario
  guardarInventario,
  obtenerInventario,
  
  // Inicialización
  inicializarDatosEjemplo,
  
  // Utilidades
  getSyncStatus,
  limpiarDatosLocales,
} from './storageFirebase';
