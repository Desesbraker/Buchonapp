import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

const ClienteCard = ({ cliente, onPress, onEdit, onDelete, onToggleElaborado, onToggleEntregado }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  
  const handleLongPress = () => {
    setMenuVisible(true);
  };

  const cerrarMenu = () => {
    setMenuVisible(false);
  };

  const handleEditar = () => {
    cerrarMenu();
    onEdit && onEdit(cliente);
  };

  const handleToggleElaborado = () => {
    cerrarMenu();
    onToggleElaborado && onToggleElaborado(cliente);
  };

  const handleToggleEntregado = () => {
    cerrarMenu();
    onToggleEntregado && onToggleEntregado(cliente);
  };

  const handleEliminar = () => {
    cerrarMenu();
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar el pedido de ${cliente.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => onDelete && onDelete(cliente),
        },
      ]
    );
  };

  const esElaborado = cliente.elaborado === true;
  const esEntregado = cliente.entregado === true;
  const getEstadoColor = () => {
    switch (cliente.estado) {
      case 'pagado':
        return colors.success;
      case 'no_pagado':
        return colors.error;
      case 'abono_pendiente':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getEstadoTexto = () => {
    switch (cliente.estado) {
      case 'pagado':
        return 'Pagado';
      case 'no_pagado':
        return 'No Pagado';
      case 'abono_pendiente':
        return 'Abono Pendiente';
      default:
        return '';
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const dia = date.getDate();
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const mes = meses[date.getMonth()];
    return `${dia} ${mes}`;
  };

  const formatearMonto = (monto) => {
    return monto.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const llamar = () => {
    Linking.openURL(`tel:${cliente.telefono}`);
  };

  const abrirWhatsApp = () => {
    const numero = cliente.telefono.replace(/[^0-9]/g, '');
    Linking.openURL(`whatsapp://send?phone=${numero}`);
  };

  const abrirUbicacion = () => {
    const direccion = encodeURIComponent(cliente.direccion);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${direccion}`);
  };

  const montoDebe = cliente.montoTotal - cliente.montoAbonado;

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        cliente.elaborado && styles.cardElaborado,
        cliente.entregado && styles.cardEntregado
      ]} 
      onPress={onPress} 
      onLongPress={handleLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      {/* Badges de estado */}
      <View style={styles.badgesContainer}>
        {cliente.elaborado && (
          <View style={styles.elaboradoBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#FFF" />
            <Text style={styles.elaboradoText}>Elaborado</Text>
          </View>
        )}
        {cliente.entregado && (
          <View style={styles.entregadoBadge}>
            <Ionicons name="car" size={14} color="#FFF" />
            <Text style={styles.entregadoText}>Entregado</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        {/* Información principal */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.nombre}>{cliente.nombre}</Text>
            <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor() + '20' }]}>
              <Text style={[styles.estadoTexto, { color: getEstadoColor() }]}>
                {getEstadoTexto()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.direccion} numberOfLines={1}>
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
            {' '}{cliente.direccion}
          </Text>
          
          <View style={styles.montosRow}>
            <View style={styles.montoItem}>
              <Text style={styles.montoLabel}>Abonado:</Text>
              <Text style={[styles.montoValor, { color: colors.success }]}>
                ${formatearMonto(cliente.montoAbonado)}
              </Text>
            </View>
            <View style={styles.montoItem}>
              <Text style={styles.montoLabel}>Debe:</Text>
              <Text style={[styles.montoValor, { color: montoDebe > 0 ? colors.error : colors.success }]}>
                ${formatearMonto(montoDebe)}
              </Text>
            </View>
          </View>
        </View>

        {/* Columna derecha con fecha */}
        <View style={styles.rightColumn}>
          <View style={styles.fechaContainer}>
            <Ionicons name="calendar-outline" size={14} color={colors.primary} />
            <Text style={styles.fechaTexto}>{formatearFecha(cliente.fechaEntrega)}</Text>
          </View>
          <Text style={styles.horaTexto}>{cliente.horaEntrega}</Text>
        </View>
      </View>

      {/* Número de pedido, frase y botones de contacto */}
      <View style={styles.pedidoRow}>
        <Text style={styles.pedidoNumero}>#{cliente.numeroPedido}</Text>
        {cliente.frasePersonalizada && (
          <Text style={styles.frase} numberOfLines={1}>
            "{cliente.frasePersonalizada}"
          </Text>
        )}
        <View style={styles.botonesContacto}>
          <TouchableOpacity 
            style={[styles.botonContacto, { backgroundColor: colors.info }]} 
            onPress={abrirUbicacion}
          >
            <Ionicons name="location" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.botonContacto, { backgroundColor: colors.whatsapp }]} 
            onPress={abrirWhatsApp}
          >
            <Ionicons name="logo-whatsapp" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.botonContacto, { backgroundColor: colors.primary }]} 
            onPress={llamar}
          >
            <Ionicons name="call" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de opciones */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cerrarMenu}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={cerrarMenu}
        >
          <View style={styles.modalContent}>
            {/* Botón X para cerrar */}
            <TouchableOpacity style={styles.closeBtn} onPress={cerrarMenu}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Título */}
            <Text style={styles.modalTitle}>Pedido #{cliente.numeroPedido}</Text>
            <Text style={styles.modalSubtitle}>{cliente.nombre}</Text>
            <View style={styles.modalBadges}>
              <View style={[styles.modalBadge, { backgroundColor: esElaborado ? colors.success : colors.textLight }]}>
                <Text style={styles.modalBadgeText}>{esElaborado ? '✅ Elaborado' : '⏳ Por elaborar'}</Text>
              </View>
              <View style={[styles.modalBadge, { backgroundColor: esEntregado ? colors.info : colors.textLight }]}>
                <Text style={styles.modalBadgeText}>{esEntregado ? '🚚 Entregado' : '📦 Por entregar'}</Text>
              </View>
            </View>

            {/* Opciones */}
            <View style={styles.modalOptions}>
              <TouchableOpacity style={styles.modalOption} onPress={handleEditar}>
                <Ionicons name="create-outline" size={22} color={colors.primary} />
                <Text style={styles.modalOptionText}>Editar pedido</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={handleToggleElaborado}>
                <Ionicons name={esElaborado ? "time-outline" : "checkmark-circle-outline"} size={22} color={colors.success} />
                <Text style={styles.modalOptionText}>
                  {esElaborado ? 'Marcar pendiente de elaborar' : 'Marcar como elaborado'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={handleToggleEntregado}>
                <Ionicons name={esEntregado ? "cube-outline" : "car-outline"} size={22} color={colors.info} />
                <Text style={styles.modalOptionText}>
                  {esEntregado ? 'Marcar no entregado' : 'Marcar como entregado'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalOption, styles.modalOptionDanger]} onPress={handleEliminar}>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
                <Text style={[styles.modalOptionText, { color: colors.error }]}>Eliminar pedido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    ...shadows.medium,
  },
  cardElaborado: {
    borderWidth: 2,
    borderColor: colors.success,
  },
  cardEntregado: {
    borderWidth: 2,
    borderColor: colors.info,
    opacity: 0.85,
  },
  badgesContainer: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    gap: 6,
    zIndex: 1,
  },
  elaboradoBadge: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  elaboradoText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  entregadoBadge: {
    backgroundColor: colors.info,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  entregadoText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flexDirection: 'row',
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  nombre: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoTexto: {
    fontSize: 10,
    fontWeight: '600',
  },
  direccion: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  montosRow: {
    flexDirection: 'row',
    gap: 16,
  },
  montoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  montoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  montoValor: {
    fontSize: 14,
    fontWeight: '600',
  },
  rightColumn: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fechaTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  horaTexto: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  botonesContacto: {
    flexDirection: 'row',
    gap: 6,
  },
  botonContacto: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pedidoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  pedidoNumero: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  frase: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
    flex: 1,
  },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 10,
  },
  modalSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  modalBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  modalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  modalBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  modalOptions: {
    gap: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  modalOptionDanger: {
    backgroundColor: colors.error + '10',
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});

export default ClienteCard;
