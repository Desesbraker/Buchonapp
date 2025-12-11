import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

const ActionButton = ({ icon, label, onPress, color = colors.primary }) => (
  <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.label} numberOfLines={2}>{label}</Text>
  </TouchableOpacity>
);

const ActionButtons = ({ onNuevoPedido, onPlanificar, onProductos, onEstadisticas }) => {
  return (
    <View style={styles.container}>
      <ActionButton
        icon="add-circle-outline"
        label="Nuevo Pedido"
        onPress={onNuevoPedido}
        color={colors.primary}
      />
      <ActionButton
        icon="calendar-outline"
        label="Planificar Entregas"
        onPress={onPlanificar}
        color={colors.info}
      />
      <ActionButton
        icon="flower-outline"
        label="Productos"
        onPress={onProductos}
        color={colors.success}
      />
      <ActionButton
        icon="stats-chart-outline"
        label="Estadísticas"
        onPress={onEstadisticas}
        color={colors.warning}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    ...shadows.small,
  },
  button: {
    alignItems: 'center',
    width: 75,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ActionButtons;
