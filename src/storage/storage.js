import AsyncStorage from '@react-native-async-storage/async-storage';

const CLIENTES_KEY = '@buchonapp_clientes';
const PRODUCTOS_KEY = '@buchonapp_productos';
const INVENTARIO_KEY = '@buchonapp_inventario';

// ============ CLIENTES ============

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

export const agregarCliente = async (cliente) => {
  try {
    const clientes = await obtenerClientes();
    const nuevoCliente = {
      ...cliente,
      id: Date.now().toString(),
      numeroPedido: `P${String(clientes.length + 1).padStart(3, '0')}`,
    };
    clientes.push(nuevoCliente);
    await guardarClientes(clientes);
    return nuevoCliente;
  } catch (error) {
    console.error('Error agregando cliente:', error);
    return null;
  }
};

export const actualizarCliente = async (clienteActualizado) => {
  try {
    const clientes = await obtenerClientes();
    const index = clientes.findIndex(c => c.id === clienteActualizado.id);
    if (index !== -1) {
      clientes[index] = clienteActualizado;
      await guardarClientes(clientes);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    return false;
  }
};

export const eliminarCliente = async (clienteId) => {
  try {
    const clientes = await obtenerClientes();
    const clientesFiltrados = clientes.filter(c => c.id !== clienteId);
    await guardarClientes(clientesFiltrados);
    return true;
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    return false;
  }
};

// ============ PRODUCTOS ============

export const guardarProductos = async (productos) => {
  try {
    await AsyncStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
    return true;
  } catch (error) {
    console.error('Error guardando productos:', error);
    return false;
  }
};

export const obtenerProductos = async () => {
  try {
    const data = await AsyncStorage.getItem(PRODUCTOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return [];
  }
};

// ============ INVENTARIO ============

export const guardarInventario = async (inventario) => {
  try {
    await AsyncStorage.setItem(INVENTARIO_KEY, JSON.stringify(inventario));
    return true;
  } catch (error) {
    console.error('Error guardando inventario:', error);
    return false;
  }
};

export const obtenerInventario = async () => {
  try {
    const data = await AsyncStorage.getItem(INVENTARIO_KEY);
    return data ? JSON.parse(data) : {
      rosasDisponibles: 0,
      cajasCompradas: 0,
      rosasPorCaja: 25,
      rosasUsadas: 0,
    };
  } catch (error) {
    console.error('Error obteniendo inventario:', error);
    return {
      rosasDisponibles: 0,
      cajasCompradas: 0,
      rosasPorCaja: 25,
      rosasUsadas: 0,
    };
  }
};

// ============ INICIALIZAR CON DATOS DE EJEMPLO ============

export const inicializarDatosEjemplo = async (datosEjemplo) => {
  try {
    const clientesExistentes = await obtenerClientes();
    if (clientesExistentes.length === 0) {
      await guardarClientes(datosEjemplo);
    }
    return true;
  } catch (error) {
    console.error('Error inicializando datos:', error);
    return false;
  }
};
