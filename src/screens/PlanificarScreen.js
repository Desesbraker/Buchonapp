import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { obtenerPedidos, obtenerClientes, guardarOrdenEntregas, obtenerOrdenEntregas, eliminarPedido, actualizarPedido } from '../storage/storage';
import ClienteCard from '../components/ClienteCard';
import BottomNavBar from '../components/BottomNavBar';

const PlanificarScreen = ({ navigation }) => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [todosPedidos, setTodosPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const formatearFechaDisplay = (fecha) => {
    const date = new Date(fecha + 'T12:00:00');
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${dias[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`;
  };

  const cargarPedidos = useCallback(async () => {
    const pedidos = await obtenerPedidos();
    const clientes = await obtenerClientes();
    const todos = [...pedidos, ...clientes];
    setTodosPedidos(todos);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarPedidos();
    }, [cargarPedidos])
  );

  useEffect(() => {
    const filtrarYOrdenar = async () => {
      const filtrados = todosPedidos.filter(pedido => {
        if (!pedido.fechaEntrega) return false;
        // Normalizar ambas fechas para comparación correcta
        const fechaPedidoStr = pedido.fechaEntrega.split('T')[0];
        return fechaPedidoStr === fechaSeleccionada;
      });

      const ordenGuardado = await obtenerOrdenEntregas(fechaSeleccionada);
      
      if (ordenGuardado.length > 0) {
        const pedidosOrdenados = [];
        ordenGuardado.forEach(id => {
          const pedido = filtrados.find(p => p.id === id);
          if (pedido) pedidosOrdenados.push(pedido);
        });
        filtrados.forEach(pedido => {
          if (!ordenGuardado.includes(pedido.id)) {
            pedidosOrdenados.push(pedido);
          }
        });
        setPedidosFiltrados(pedidosOrdenados);
      } else {
        filtrados.sort((a, b) => {
          const horaA = a.horaEntrega || '00:00';
          const horaB = b.horaEntrega || '00:00';
          return horaA.localeCompare(horaB);
        });
        setPedidosFiltrados(filtrados);
      }
    };

    filtrarYOrdenar();
  }, [todosPedidos, fechaSeleccionada]);

  const crearRutaGoogleMaps = () => {
    // Filtrar pedidos que tienen dirección y son tipo "envio"
    const pedidosConDireccion = pedidosFiltrados.filter(
      pedido => pedido.tipoEntrega === 'envio' && pedido.direccion?.trim()
    );

    if (pedidosConDireccion.length === 0) {
      Alert.alert(
        'Sin direcciones',
        'No hay pedidos con direcciones de envío para crear una ruta.\n\nAsegúrate de que los pedidos tengan la opción "Envío" seleccionada y una dirección ingresada.'
      );
      return;
    }

    // Construir URL de Google Maps con múltiples destinos
    // Formato: https://www.google.com/maps/dir/origen/destino1/destino2/...
    const direcciones = pedidosConDireccion.map(p => encodeURIComponent(p.direccion));
    
    // La primera dirección es el destino principal, las siguientes son waypoints
    let googleMapsUrl;
    
    if (direcciones.length === 1) {
      // Solo un destino
      googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${direcciones[0]}`;
    } else {
      // Múltiples destinos: usar el primer destino como origin y los demás como waypoints
      const destino = direcciones[direcciones.length - 1];
      const waypoints = direcciones.slice(0, -1).join('%7C');
      googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destino}&waypoints=${waypoints}`;
    }

    Alert.alert(
      'Abrir ruta en Google Maps',
      `Se abrirá una ruta con ${pedidosConDireccion.length} destino${pedidosConDireccion.length > 1 ? 's' : ''}:\n\n${pedidosConDireccion.map((p, i) => `${i + 1}. ${p.nombre}: ${p.direccion}`).join('\n')}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir Maps',
          onPress: () => Linking.openURL(googleMapsUrl)
        }
      ]
    );
  };

  const cambiarFecha = (dias) => {
    const fecha = new Date(fechaSeleccionada + 'T12:00:00');
    fecha.setDate(fecha.getDate() + dias);
    setFechaSeleccionada(fecha.toISOString().split('T')[0]);
    setPedidoSeleccionado(null);
  };

  const moverPedido = async (direccion) => {
    if (!pedidoSeleccionado) return;

    const index = pedidosFiltrados.findIndex(p => p.id === pedidoSeleccionado);
    if (index === -1) return;

    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;
    if (nuevoIndex < 0 || nuevoIndex >= pedidosFiltrados.length) return;

    const nuevosOrdenados = [...pedidosFiltrados];
    const [removed] = nuevosOrdenados.splice(index, 1);
    nuevosOrdenados.splice(nuevoIndex, 0, removed);

    setPedidosFiltrados(nuevosOrdenados);
    
    const ordenIds = nuevosOrdenados.map(p => p.id);
    await guardarOrdenEntregas(fechaSeleccionada, ordenIds);
  };

  const seleccionarPedido = (pedido) => {
    if (pedidoSeleccionado === pedido.id) {
      setPedidoSeleccionado(null);
    } else {
      setPedidoSeleccionado(pedido.id);
    }
  };

  const handleEditarPedido = (pedido) => {
    navigation.navigate('NuevoPedido', { pedidoEditar: pedido });
  };

  const handleEliminarPedido = async (pedido) => {
    const resultado = await eliminarPedido(pedido.id);
    if (resultado) {
      Alert.alert('Éxito', 'Pedido eliminado correctamente');
      cargarPedidos();
    } else {
      Alert.alert('Error', 'No se pudo eliminar el pedido');
    }
  };

  const handleToggleElaborado = async (pedido) => {
    const nuevoEstado = !pedido.elaborado;
    const pedidoActualizado = { ...pedido, elaborado: nuevoEstado };
    const resultado = await actualizarPedido(pedidoActualizado);
    if (resultado) {
      Alert.alert(
        nuevoEstado ? '✅ Elaborado' : '⏳ Pendiente',
        nuevoEstado 
          ? `El pedido de ${pedido.nombre} ha sido marcado como elaborado`
          : `El pedido de ${pedido.nombre} está pendiente de elaborar`
      );
      cargarPedidos();
    } else {
      Alert.alert('Error', 'No se pudo actualizar el pedido');
    }
  };

  const renderPedido = ({ item, index }) => {
    const estaSeleccionado = pedidoSeleccionado === item.id;
    return (
      <View style={styles.pedidoWrapper}>
        <View style={styles.ordenNumero}>
          <Text style={styles.ordenNumeroText}>{index + 1}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.pedidoContainer,
            estaSeleccionado && styles.pedidoSeleccionado
          ]}
          onPress={() => seleccionarPedido(item)}
          activeOpacity={0.8}
        >
          <ClienteCard
            cliente={item}
            onPress={() => seleccionarPedido(item)}
            onEdit={handleEditarPedido}
            onDelete={handleEliminarPedido}
            onToggleElaborado={handleToggleElaborado}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={60} color={colors.textLight} />
      <Text style={styles.emptyText}>No hay entregas para este día</Text>
      <Text style={styles.emptySubtext}>Usa las flechas para cambiar de fecha</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planificar Entregas</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.fechaSelector}>
        <TouchableOpacity style={styles.fechaArrow} onPress={() => cambiarFecha(-1)}>
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.fechaDisplay}>
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={styles.fechaText}>{formatearFechaDisplay(fechaSeleccionada)}</Text>
        </View>
        
        <TouchableOpacity style={styles.fechaArrow} onPress={() => cambiarFecha(1)}>
          <Ionicons name="chevron-forward" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.contadorContainer}>
        <Text style={styles.contadorText}>
          {pedidosFiltrados.length} entrega{pedidosFiltrados.length !== 1 ? 's' : ''} programada{pedidosFiltrados.length !== 1 ? 's' : ''}
        </Text>
        {pedidosFiltrados.length > 0 && (
          <TouchableOpacity 
            style={styles.botonRuta} 
            onPress={crearRutaGoogleMaps}
            activeOpacity={0.7}
          >
            <Ionicons name="navigate" size={18} color="#FFF" />
            <Text style={styles.botonRutaText}>Crear Ruta</Text>
          </TouchableOpacity>
        )}
      </View>

      {pedidoSeleccionado && (
        <View style={styles.instrucciones}>
          <Ionicons name="information-circle" size={16} color={colors.info} />
          <Text style={styles.instruccionesText}>
            Usa las flechas para mover el pedido seleccionado
          </Text>
        </View>
      )}

      {pedidoSeleccionado && (
        <View style={styles.botonesOrden}>
          <TouchableOpacity
            style={[styles.botonMover, pedidosFiltrados.findIndex(p => p.id === pedidoSeleccionado) === 0 && styles.botonDisabled]}
            onPress={() => moverPedido('arriba')}
            disabled={pedidosFiltrados.findIndex(p => p.id === pedidoSeleccionado) === 0}
          >
            <Ionicons name="arrow-up" size={24} color="#FFF" />
            <Text style={styles.botonMoverText}>Subir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.botonMover, pedidosFiltrados.findIndex(p => p.id === pedidoSeleccionado) === pedidosFiltrados.length - 1 && styles.botonDisabled]}
            onPress={() => moverPedido('abajo')}
            disabled={pedidosFiltrados.findIndex(p => p.id === pedidoSeleccionado) === pedidosFiltrados.length - 1}
          >
            <Ionicons name="arrow-down" size={24} color="#FFF" />
            <Text style={styles.botonMoverText}>Bajar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.botonDeseleccionar}
            onPress={() => setPedidoSeleccionado(null)}
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={pedidosFiltrados}
        renderItem={renderPedido}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />

      <BottomNavBar
        onNuevoPedido={() => navigation.navigate('NuevoPedido')}
        onPlanificar={() => {}}
        onProductos={() => navigation.navigate('Productos')}
        onEstadisticas={() => navigation.navigate('Estadisticas')}
        onHome={() => navigation.navigate('Home')}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fechaSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    ...shadows.small,
  },
  fechaArrow: {
    padding: 8,
  },
  fechaDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fechaText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  contadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  contadorText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  botonRuta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  botonRutaText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  instrucciones: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  instruccionesText: {
    fontSize: 12,
    color: colors.info,
  },
  botonesOrden: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  botonMover: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    ...shadows.small,
  },
  botonMoverText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  botonDisabled: {
    backgroundColor: colors.textLight,
  },
  botonDeseleccionar: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  pedidoWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  ordenNumero: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    marginRight: -8,
    zIndex: 1,
  },
  ordenNumeroText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pedidoContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pedidoSeleccionado: {
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 19,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
  },
});

export default PlanificarScreen;
