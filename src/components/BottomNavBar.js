import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

const BottomNavBar = ({ onNuevoPedido, onPlanificar, onProductos, onEstadisticas, onHome }) => {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {/* Botón Nuevo Pedido */}
        <TouchableOpacity style={styles.navItem} onPress={onNuevoPedido} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.navLabel}>Nuevo</Text>
        </TouchableOpacity>

        {/* Botón Planificar */}
        <TouchableOpacity style={styles.navItem} onPress={onPlanificar} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="calendar-outline" size={24} color={colors.info} />
          </View>
          <Text style={styles.navLabel}>Planificar</Text>
        </TouchableOpacity>

        {/* Logo Central - Navega a Home */}
        <TouchableOpacity style={styles.logoContainer} onPress={onHome} activeOpacity={0.8}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../assets/logosinfondo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        {/* Botón Productos */}
        <TouchableOpacity style={styles.navItem} onPress={onProductos} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="flower-outline" size={24} color={colors.success} />
          </View>
          <Text style={styles.navLabel}>Productos</Text>
        </TouchableOpacity>

        {/* Botón Estadísticas */}
        <TouchableOpacity style={styles.navItem} onPress={onEstadisticas} activeOpacity={0.7}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '15' }]}>
            <Ionicons name="stats-chart-outline" size={24} color={colors.warning} />
          </View>
          <Text style={styles.navLabel}>Stats</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  logoContainer: {
    flex: 1.2,
    alignItems: 'center',
    marginTop: -35,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  logo: {
    width: 55,
    height: 55,
  },
});

export default BottomNavBar;
