import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { obtenerPedidos, obtenerClientes, inicializarDatosEjemplo } from '../storage/storage';
import { sampleClientes } from '../data/sampleData';
import ClienteCard from '../components/ClienteCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ActionButtons from '../components/ActionButtons';

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

  const renderCliente = ({ item }) => (
    <ClienteCard 
      cliente={item} 
      onPress={() => handleClientePress(item)} 
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header con Logo */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Botones de Acción */}
      <ActionButtons
        onNuevoPedido={() => navigation.navigate('NuevoPedido')}
        onPlanificar={() => navigation.navigate('Planificar')}
        onProductos={() => navigation.navigate('Productos')}
        onEstadisticas={() => navigation.navigate('Estadisticas')}
      />

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  logo: {
    width: 150,
    height: 60,
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
