import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  RefreshControl,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { obtenerPedidos, obtenerClientes, inicializarDatosEjemplo, eliminarPedido, actualizarPedido } from '../storage/storage';
import { sampleClientes } from '../data/sampleData';
import ClienteCard from '../components/ClienteCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import BottomNavBar from '../components/BottomNavBar';

const HomeScreen = ({ navigation }) => {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filtros, setFiltros] = useState({
    abono_pendiente: false,
    no_pagado: false,
    pagado: false,
    por_fecha: false,
    elaborado: false,
    pendiente_elaborar: false,
    entregado: false,
    pendiente_entregar: false,
    instagram: false,
    whatsapp: false,
    facebook: false,
    tiktok: false,
  });

  const cargarClientes = useCallback(async () => {
    // Primero cargar pedidos nuevos
    const pedidos = await obtenerPedidos();
    
    // Luego cargar datos de ejemplo si no hay nada
    if (pedidos.length === 0) {
      await inicializarDatosEjemplo(sampleClientes);
      const clientesEjemplo = await obtenerClientes();
      setClientes(clientesEjemplo);
    } else {
      // Combinar pedidos nuevos con datos de ejemplo
      const clientesEjemplo = await obtenerClientes();
      setClientes([...pedidos, ...clientesEjemplo]);
    }
  }, []);

  // Recargar cuando la pantalla vuelva a tener foco
  useFocusEffect(
    useCallback(() => {
      cargarClientes();
    }, [cargarClientes])
  );

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  // Efecto para filtrar clientes
  useEffect(() => {
    let resultado = [...clientes];

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(cliente => 
        cliente.nombre.toLowerCase().includes(busquedaLower) ||
        (cliente.alias && cliente.alias.toLowerCase().includes(busquedaLower)) ||
        cliente.numeroPedido.toLowerCase().includes(busquedaLower) ||
        (cliente.frasePersonalizada && cliente.frasePersonalizada.toLowerCase().includes(busquedaLower))
      );
    }

    // Filtrar por estado de pago
    const filtrosEstado = ['abono_pendiente', 'no_pagado', 'pagado'];
    const estadosActivos = filtrosEstado.filter(f => filtros[f]);
    if (estadosActivos.length > 0) {
      resultado = resultado.filter(cliente => estadosActivos.includes(cliente.estado));
    }

    // Filtrar por red social
    const redesActivas = ['instagram', 'whatsapp', 'facebook', 'tiktok'].filter(f => filtros[f]);
    if (redesActivas.length > 0) {
      resultado = resultado.filter(cliente => redesActivas.includes(cliente.redSocial));
    }

    // Filtrar por estado de elaboración
    if (filtros.elaborado && !filtros.pendiente_elaborar) {
      resultado = resultado.filter(cliente => cliente.elaborado === true);
    } else if (filtros.pendiente_elaborar && !filtros.elaborado) {
      resultado = resultado.filter(cliente => cliente.elaborado !== true);
    }

    // Filtrar por estado de entrega
    if (filtros.entregado && !filtros.pendiente_entregar) {
      resultado = resultado.filter(cliente => cliente.entregado === true);
    } else if (filtros.pendiente_entregar && !filtros.entregado) {
      resultado = resultado.filter(cliente => cliente.entregado !== true);
    }

    // Ordenar por fecha si está activo
    if (filtros.por_fecha) {
      resultado.sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega));
    }

    setClientesFiltrados(resultado);
  }, [clientes, busqueda, filtros]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargarClientes();
    setRefreshing(false);
  }, [cargarClientes]);

  const toggleFiltro = (key) => {
    setFiltros(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClientePress = (cliente) => {
    // TODO: Navegar a detalle del cliente
    console.log('Cliente seleccionado:', cliente.nombre);
  };

  const handleEditarCliente = (cliente) => {
    // Navegar a pantalla de edición con datos del cliente
    navigation.navigate('NuevoPedido', { pedidoEditar: cliente });
  };

  const handleEliminarCliente = async (cliente) => {
    const resultado = await eliminarPedido(cliente.id);
    if (resultado) {
      Alert.alert('Éxito', 'Pedido eliminado correctamente');
      cargarClientes(); // Recargar lista
    } else {
      Alert.alert('Error', 'No se pudo eliminar el pedido');
    }
  };

  const handleToggleElaborado = async (cliente) => {
    const nuevoEstado = !cliente.elaborado;
    const pedidoActualizado = { ...cliente, elaborado: nuevoEstado };
    const resultado = await actualizarPedido(pedidoActualizado);
    if (resultado) {
      Alert.alert(
        nuevoEstado ? '✅ Elaborado' : '⏳ Pendiente',
        nuevoEstado 
          ? `El pedido de ${cliente.nombre} ha sido marcado como elaborado`
          : `El pedido de ${cliente.nombre} está pendiente de elaborar`
      );
      cargarClientes();
    } else {
      Alert.alert('Error', 'No se pudo actualizar el pedido');
    }
  };

  const handleToggleEntregado = async (cliente) => {
    const nuevoEstado = !cliente.entregado;
    const pedidoActualizado = { ...cliente, entregado: nuevoEstado };
    const resultado = await actualizarPedido(pedidoActualizado);
    if (resultado) {
      Alert.alert(
        nuevoEstado ? '🚚 Entregado' : '📦 No entregado',
        nuevoEstado 
          ? `El pedido de ${cliente.nombre} ha sido marcado como entregado`
          : `El pedido de ${cliente.nombre} está pendiente de entregar`
      );
      cargarClientes();
    } else {
      Alert.alert('Error', 'No se pudo actualizar el pedido');
    }
  };

  const renderCliente = ({ item }) => (
    <ClienteCard 
      cliente={item} 
      onPress={() => handleClientePress(item)}
      onEdit={handleEditarCliente}
      onDelete={handleEliminarCliente}
      onToggleElaborado={handleToggleElaborado}
      onToggleEntregado={handleToggleEntregado}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🌹</Text>
      <Text style={styles.emptyText}>No hay pedidos</Text>
      <Text style={styles.emptySubtext}>Presiona "Nuevo Pedido" para comenzar</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Título de la app */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image
            source={require('../../logo/logo2.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Ramos Buchones</Text>
        </View>
      </View>

      {/* Buscador */}
      <SearchBar
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Filtros */}
      <FilterBar
        filtros={filtros}
        onToggleFiltro={toggleFiltro}
      />

      {/* Contador de resultados */}
      <View style={styles.resultadosHeader}>
        <Text style={styles.resultadosTexto}>
          {clientesFiltrados.length} pedido{clientesFiltrados.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Lista de Clientes */}
      <FlatList
        data={clientesFiltrados}
        renderItem={renderCliente}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* Barra de navegación inferior */}
      <BottomNavBar
        onNuevoPedido={() => navigation.navigate('NuevoPedido')}
        onPlanificar={() => navigation.navigate('Planificar')}
        onProductos={() => navigation.navigate('Productos')}
        onEstadisticas={() => navigation.navigate('Estadisticas')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingTop: 8,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  resultadosHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultadosTexto: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
});

export default HomeScreen;
