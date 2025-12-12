/**
 * ALMACENAMIENTO HÍBRIDO - BuchonApp v2.0
 * 
 * Este módulo soporta:
 * - Firebase Firestore (sincronización en tiempo real entre dispositivos)
 * - AsyncStorage (almacenamiento local cuando no hay Firebase)
 * 
 * Si Firebase está configurado, los datos se sincronizan automáticamente.
 * Si no, funciona igual que antes con almacenamiento local.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, isFirebaseConfigured } from '../config/firebase';

// Keys para AsyncStorage (fallback)
const PEDIDOS_KEY = '@buchonapp_pedidos';
const PRODUCTOS_KEY = '@buchonapp_productos';
const CATEGORIAS_KEY = '@buchonapp_categorias';
const GASTOS_KEY = '@buchonapp_gastos';
const CONTADOR_KEY = '@buchonapp_contador_pedidos';
const ORDEN_ENTREGAS_KEY = '@buchonapp_orden_entregas';
const INVENTARIO_KEY = '@buchonapp_inventario';
const CLIENTES_KEY = '@buchonapp_clientes';

// Verificar si usar Firebase
const useFirebase = () => {
  return isFirebaseConfigured() && db !== null;
};

// ============ PEDIDOS ============

export const obtenerSiguienteNumeroPedido = async () => {
  try {
    if (useFirebase()) {
      const contadorRef = doc(db, 'config', 'contador');
      const contadorDoc = await getDocs(query(collection(db, 'config')));
      let contador = 0;
      contadorDoc.forEach(doc => {
        if (doc.id === 'contador') contador = doc.data().pedidos || 0;
      });
      contador++;
      await setDoc(contadorRef, { pedidos: contador }, { merge: true });
      return `P${String(contador).padStart(3, '0')}`;
    } else {
      const data = await AsyncStorage.getItem(CONTADOR_KEY);
      const contador = data ? parseInt(data) : 0;
      const nuevoContador = contador + 1;
      await AsyncStorage.setItem(CONTADOR_KEY, nuevoContador.toString());
      return `P${String(nuevoContador).padStart(3, '0')}`;
    }
  } catch (error) {
    console.error('Error obteniendo número de pedido:', error);
    return `P${Date.now()}`;
  }
};

export const guardarPedido = async (pedido) => {
  try {
    const nuevoPedido = {
      ...pedido,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
    };
    
    if (useFirebase()) {
      await setDoc(doc(db, 'pedidos', nuevoPedido.id), nuevoPedido);
    } else {
      const pedidos = await obtenerPedidos();
      pedidos.unshift(nuevoPedido);
      await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos));
    }
    return nuevoPedido;
  } catch (error) {
    console.error('Error guardando pedido:', error);
    return null;
  }
};

export const obtenerPedidos = async () => {
  try {
    if (useFirebase()) {
      const querySnapshot = await getDocs(collection(db, 'pedidos'));
      const pedidos = [];
      querySnapshot.forEach((doc) => {
        pedidos.push({ ...doc.data(), id: doc.id });
      });
      // Ordenar por fecha de creación (más recientes primero)
      return pedidos.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    } else {
      const data = await AsyncStorage.getItem(PEDIDOS_KEY);
      return data ? JSON.parse(data) : [];
    }
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    return [];
  }
};

export const actualizarPedido = async (pedidoActualizado) => {
  try {
    pedidoActualizado.fechaActualizacion = new Date().toISOString();
    
    if (useFirebase()) {
      await updateDoc(doc(db, 'pedidos', pedidoActualizado.id), pedidoActualizado);
    } else {
      const pedidos = await obtenerPedidos();
      const index = pedidos.findIndex(p => p.id === pedidoActualizado.id);
      if (index !== -1) {
        pedidos[index] = pedidoActualizado;
        await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos));
      }
    }
    return true;
  } catch (error) {
    console.error('Error actualizando pedido:', error);
    return false;
  }
};

export const eliminarPedido = async (pedidoId) => {
  try {
    if (useFirebase()) {
      await deleteDoc(doc(db, 'pedidos', pedidoId));
    } else {
      const pedidos = await obtenerPedidos();
      const pedidosFiltrados = pedidos.filter(p => p.id !== pedidoId);
      await AsyncStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidosFiltrados));
    }
    return true;
  } catch (error) {
    console.error('Error eliminando pedido:', error);
    return false;
  }
};

// Listener en tiempo real para pedidos (solo Firebase)
export const suscribirPedidos = (callback) => {
  if (useFirebase()) {
    return onSnapshot(collection(db, 'pedidos'), (snapshot) => {
      const pedidos = [];
      snapshot.forEach((doc) => {
        pedidos.push({ ...doc.data(), id: doc.id });
      });
      pedidos.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
      callback(pedidos);
    });
  }
  return null;
};

// ============ PRODUCTOS ============

export const guardarProductos = async (productos) => {
  try {
    if (useFirebase()) {
      for (const producto of productos) {
        await setDoc(doc(db, 'productos', producto.id), producto);
      }
    } else {
      await AsyncStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
    }
    return true;
  } catch (error) {
    console.error('Error guardando productos:', error);
    return false;
  }
};

export const obtenerProductos = async () => {
  try {
    if (useFirebase()) {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productos = [];
      querySnapshot.forEach((doc) => {
        productos.push({ ...doc.data(), id: doc.id });
      });
      return productos;
    } else {
      const data = await AsyncStorage.getItem(PRODUCTOS_KEY);
      return data ? JSON.parse(data) : [];
    }
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }
};

export const agregarProducto = async (producto) => {
  try {
    const nuevoProducto = {
      ...producto,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
    };
    
    if (useFirebase()) {
      await setDoc(doc(db, 'productos', nuevoProducto.id), nuevoProducto);
    } else {
      const productos = await obtenerProductos();
      productos.unshift(nuevoProducto);
      await guardarProductos(productos);
    }
    return nuevoProducto;
  } catch (error) {
    console.error('Error agregando producto:', error);
    return null;
  }
};

export const actualizarProducto = async (productoActualizado) => {
  try {
    productoActualizado.fechaActualizacion = new Date().toISOString();
    
    if (useFirebase()) {
      await updateDoc(doc(db, 'productos', productoActualizado.id), productoActualizado);
    } else {
      const productos = await obtenerProductos();
      const index = productos.findIndex(p => p.id === productoActualizado.id);
      if (index !== -1) {
        productos[index] = productoActualizado;
        await guardarProductos(productos);
      }
    }
    return true;
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return false;
  }
};

export const eliminarProducto = async (productoId) => {
  try {
    if (useFirebase()) {
      await deleteDoc(doc(db, 'productos', productoId));
    } else {
      const productos = await obtenerProductos();
      const productosFiltrados = productos.filter(p => p.id !== productoId);
      await guardarProductos(productosFiltrados);
    }
    return true;
  } catch (error) {
    console.error('Error eliminando producto:', error);
    return false;
  }
};

// ============ CATEGORÍAS ============

export const guardarCategorias = async (categorias) => {
  try {
    if (useFirebase()) {
      for (const categoria of categorias) {
        await setDoc(doc(db, 'categorias', categoria.id), categoria);
      }
    } else {
      await AsyncStorage.setItem(CATEGORIAS_KEY, JSON.stringify(categorias));
    }
    return true;
  } catch (error) {
    console.error('Error guardando categorías:', error);
    return false;
  }
};

export const obtenerCategorias = async () => {
  try {
    if (useFirebase()) {
      const querySnapshot = await getDocs(collection(db, 'categorias'));
      const categorias = [];
      querySnapshot.forEach((doc) => {
        categorias.push({ ...doc.data(), id: doc.id });
      });
      return categorias;
    } else {
      const data = await AsyncStorage.getItem(CATEGORIAS_KEY);
      return data ? JSON.parse(data) : [];
    }
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return [];
  }
};

export const agregarCategoria = async (categoria) => {
  try {
    const nuevaCategoria = {
      ...categoria,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
    };
    
    if (useFirebase()) {
      await setDoc(doc(db, 'categorias', nuevaCategoria.id), nuevaCategoria);
    } else {
      const categorias = await obtenerCategorias();
      categorias.unshift(nuevaCategoria);
      await guardarCategorias(categorias);
    }
    return nuevaCategoria;
  } catch (error) {
    console.error('Error agregando categoría:', error);
    return null;
  }
};

export const eliminarCategoria = async (categoriaId) => {
  try {
    if (useFirebase()) {
      await deleteDoc(doc(db, 'categorias', categoriaId));
    } else {
      const categorias = await obtenerCategorias();
      const categoriasFiltradas = categorias.filter(c => c.id !== categoriaId);
      await guardarCategorias(categoriasFiltradas);
    }
    return true;
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    return false;
  }
};

// ============ GASTOS ============

export const guardarGasto = async (gasto) => {
  try {
    const nuevoGasto = {
      ...gasto,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
    };
    
    if (useFirebase()) {
      await setDoc(doc(db, 'gastos', nuevoGasto.id), nuevoGasto);
    } else {
      const gastos = await obtenerGastos();
      gastos.unshift(nuevoGasto);
      await AsyncStorage.setItem(GASTOS_KEY, JSON.stringify(gastos));
    }
    return nuevoGasto;
  } catch (error) {
    console.error('Error guardando gasto:', error);
    return null;
  }
};

export const obtenerGastos = async () => {
  try {
    if (useFirebase()) {
      const querySnapshot = await getDocs(collection(db, 'gastos'));
      const gastos = [];
      querySnapshot.forEach((doc) => {
        gastos.push({ ...doc.data(), id: doc.id });
      });
      return gastos.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    } else {
      const data = await AsyncStorage.getItem(GASTOS_KEY);
      return data ? JSON.parse(data) : [];
    }
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    return [];
  }
};

export const eliminarGasto = async (gastoId) => {
  try {
    if (useFirebase()) {
      await deleteDoc(doc(db, 'gastos', gastoId));
    } else {
      const gastos = await obtenerGastos();
      const gastosFiltrados = gastos.filter(g => g.id !== gastoId);
      await AsyncStorage.setItem(GASTOS_KEY, JSON.stringify(gastosFiltrados));
    }
    return true;
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    return false;
  }
};

// Listener en tiempo real para gastos
export const suscribirGastos = (callback) => {
  if (useFirebase()) {
    return onSnapshot(collection(db, 'gastos'), (snapshot) => {
      const gastos = [];
      snapshot.forEach((doc) => {
        gastos.push({ ...doc.data(), id: doc.id });
      });
      gastos.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
      callback(gastos);
    });
  }
  return null;
};

// ============ CLIENTES (legacy) ============

export const guardarClientes = async (clientes) => {
  try {
    await AsyncStorage.setItem(CLIENTES_KEY, JSON.stringify(clientes));
    return true;
  } catch (error) {
    console.error('Error guardando clientes:', error);
    return false;
  }
};

export const obtenerClientes = async () => {
  try {
    const data = await AsyncStorage.getItem(CLIENTES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    return [];
  }
};

// ============ ORDEN DE ENTREGAS ============

export const guardarOrdenEntregas = async (fecha, ordenIds) => {
  try {
    if (useFirebase()) {
      await setDoc(doc(db, 'ordenEntregas', fecha), { orden: ordenIds });
    } else {
      const ordenes = await obtenerTodasLasOrdenesEntregas();
      ordenes[fecha] = ordenIds;
      await AsyncStorage.setItem(ORDEN_ENTREGAS_KEY, JSON.stringify(ordenes));
    }
    return true;
  } catch (error) {
    console.error('Error guardando orden de entregas:', error);
    return false;
  }
};

export const obtenerOrdenEntregas = async (fecha) => {
  try {
    if (useFirebase()) {
      const querySnapshot = await getDocs(collection(db, 'ordenEntregas'));
      let orden = [];
      querySnapshot.forEach((doc) => {
        if (doc.id === fecha) orden = doc.data().orden || [];
      });
      return orden;
    } else {
      const ordenes = await obtenerTodasLasOrdenesEntregas();
      return ordenes[fecha] || [];
    }
  } catch (error) {
    console.error('Error obteniendo orden de entregas:', error);
    return [];
  }
};

export const obtenerTodasLasOrdenesEntregas = async () => {
  try {
    const data = await AsyncStorage.getItem(ORDEN_ENTREGAS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error obteniendo todas las órdenes:', error);
    return {};
  }
};

// ============ INVENTARIO ============

export const guardarInventario = async (inventario) => {
  try {
    if (useFirebase()) {
      await setDoc(doc(db, 'config', 'inventario'), inventario);
    } else {
      await AsyncStorage.setItem(INVENTARIO_KEY, JSON.stringify(inventario));
    }
    return true;
  } catch (error) {
    console.error('Error guardando inventario:', error);
    return false;
  }
};

export const obtenerInventario = async () => {
  try {
    const defaultInventario = {
      rosasDisponibles: 0,
      cajasCompradas: 0,
      rosasPorCaja: 25,
      rosasUsadas: 0,
    };
    
    if (useFirebase()) {
      const querySnapshot = await getDocs(collection(db, 'config'));
      let inventario = defaultInventario;
      querySnapshot.forEach((doc) => {
        if (doc.id === 'inventario') inventario = doc.data();
      });
      return inventario;
    } else {
      const data = await AsyncStorage.getItem(INVENTARIO_KEY);
      return data ? JSON.parse(data) : defaultInventario;
    }
  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    return { rosasDisponibles: 0, cajasCompradas: 0, rosasPorCaja: 25, rosasUsadas: 0 };
  }
};

// ============ INICIALIZAR (sin datos de ejemplo) ============

export const inicializarDatosEjemplo = async () => {
  // Ya no carga datos de ejemplo
  return true;
};

// ============ UTILIDADES ============

// Verificar estado de sincronización
export const getSyncStatus = () => {
  return {
    firebase: useFirebase(),
    message: useFirebase() 
      ? '🔄 Sincronización activa' 
      : '📱 Modo local (sin sincronización)'
  };
};

// Limpiar datos locales (para debugging)
export const limpiarDatosLocales = async () => {
  try {
    await AsyncStorage.multiRemove([
      PEDIDOS_KEY, PRODUCTOS_KEY, CATEGORIAS_KEY, 
      GASTOS_KEY, CONTADOR_KEY, ORDEN_ENTREGAS_KEY, 
      INVENTARIO_KEY, CLIENTES_KEY
    ]);
    return true;
  } catch (error) {
    console.error('Error limpiando datos:', error);
    return false;
  }
};
