import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { obtenerPedidos, obtenerProductos, obtenerCategorias } from '../storage/storage';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');

const EstadisticasScreen = ({ navigation }) => {
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState('mes');
  const [stats, setStats] = useState({});

  const cargarDatos = useCallback(async () => {
    const peds = await obtenerPedidos();
    const prods = await obtenerProductos();
    const cats = await obtenerCategorias();
    setPedidos(peds);
    setProductos(prods);
    setCategorias(cats);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  useEffect(() => {
    calcularEstadisticas();
  }, [pedidos, productos, periodoActivo]);

  const calcularEstadisticas = () => {
    const ahora = new Date();
    let fechaInicio;

    switch (periodoActivo) {
      case 'semana':
        fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        break;
      case 'trimestre':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth() - 2, 1);
        break;
      case 'año':
        fechaInicio = new Date(ahora.getFullYear(), 0, 1);
        break;
      default:
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    }

    // Filtrar pedidos del período
    const pedidosPeriodo = pedidos.filter(p => {
      const fecha = new Date(p.fechaCreacion || p.fechaEntrega);
      return fecha >= fechaInicio;
    });

    // Calcular estadísticas generales
    const totalVentas = pedidosPeriodo.reduce((sum, p) => sum + (p.montoTotal || 0), 0);
    const totalAbonado = pedidosPeriodo.reduce((sum, p) => sum + (p.montoAbonado || 0), 0);
    const totalPendiente = pedidosPeriodo.reduce((sum, p) => sum + ((p.montoTotal || 0) - (p.montoAbonado || 0)), 0);
    const cantidadPedidos = pedidosPeriodo.length;
    const promedioVenta = cantidadPedidos > 0 ? totalVentas / cantidadPedidos : 0;

    // Pedidos elaborados vs pendientes
    const elaborados = pedidosPeriodo.filter(p => p.elaborado === true).length;
    const porElaborar = cantidadPedidos - elaborados;

    // Estados de pago
    const pagados = pedidosPeriodo.filter(p => p.estado === 'pagado').length;
    const abonoPendiente = pedidosPeriodo.filter(p => p.estado === 'abono_pendiente').length;
    const noPagados = pedidosPeriodo.filter(p => p.estado === 'no_pagado').length;

    // Por plataforma
    const porPlataforma = {};
    pedidosPeriodo.forEach(p => {
      const plat = p.plataforma || p.redSocial || 'otro';
      if (!porPlataforma[plat]) porPlataforma[plat] = { cantidad: 0, total: 0 };
      porPlataforma[plat].cantidad++;
      porPlataforma[plat].total += p.montoTotal || 0;
    });

    // Por día de la semana
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const porDia = [0, 0, 0, 0, 0, 0, 0];
    pedidosPeriodo.forEach(p => {
      const fecha = new Date(p.fechaEntrega || p.fechaCreacion);
      if (!isNaN(fecha.getDay())) {
        porDia[fecha.getDay()]++;
      }
    });

    // Por color (de productos)
    const porColor = {};
    productos.forEach(prod => {
      if (prod.color) {
        if (!porColor[prod.color]) porColor[prod.color] = 0;
        porColor[prod.color]++;
      }
    });

    // Inventario total
    const inventarioTotal = productos.reduce((sum, p) => sum + (p.cantidad || 0), 0);
    const valorInventario = productos.reduce((sum, p) => sum + ((p.precio || 0) * (p.cantidad || 0)), 0);

    // Ventas por mes (últimos 6 meses)
    const ventasPorMes = [];
    for (let i = 5; i >= 0; i--) {
      const mes = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mesNombre = mes.toLocaleDateString('es-ES', { month: 'short' });
      const pedidosMes = pedidos.filter(p => {
        const fecha = new Date(p.fechaCreacion || p.fechaEntrega);
        return fecha.getMonth() === mes.getMonth() && fecha.getFullYear() === mes.getFullYear();
      });
      const totalMes = pedidosMes.reduce((sum, p) => sum + (p.montoTotal || 0), 0);
      ventasPorMes.push({ mes: mesNombre, total: totalMes, cantidad: pedidosMes.length });
    }

    setStats({
      totalVentas,
      totalAbonado,
      totalPendiente,
      cantidadPedidos,
      promedioVenta,
      elaborados,
      porElaborar,
      pagados,
      abonoPendiente,
      noPagados,
      porPlataforma,
      porDia,
      diasSemana,
      porColor,
      inventarioTotal,
      valorInventario,
      ventasPorMes,
      totalProductos: productos.length,
      totalCategorias: categorias.length,
    });
  };

  const formatearMonto = (monto) => {
    return Math.round(monto).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getPlataformaIcon = (plat) => {
    const icons = {
      whatsapp: 'logo-whatsapp',
      instagram: 'logo-instagram',
      facebook: 'logo-facebook',
      tiktok: 'musical-notes',
      publicidad: 'megaphone-outline',
    };
    return icons[plat] || 'ellipsis-horizontal';
  };

  const getPlataformaColor = (plat) => {
    const colores = {
      whatsapp: '#25D366',
      instagram: '#E4405F',
      facebook: '#1877F2',
      tiktok: '#000000',
      publicidad: '#9C27B0',
    };
    return colores[plat] || colors.textSecondary;
  };

  const maxVentaMes = Math.max(...(stats.ventasPorMes?.map(v => v.total) || [1]));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Estadísticas</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Selector de Período */}
      <View style={styles.periodoContainer}>
        {['semana', 'mes', 'trimestre', 'año'].map((periodo) => (
          <TouchableOpacity
            key={periodo}
            style={[styles.periodoBtn, periodoActivo === periodo && styles.periodoBtnActivo]}
            onPress={() => setPeriodoActivo(periodo)}
          >
            <Text style={[styles.periodoText, periodoActivo === periodo && styles.periodoTextActivo]}>
              {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Tarjetas principales */}
        <View style={styles.cardRow}>
          <View style={[styles.statCard, styles.cardPrimary]}>
            <Text style={styles.cardLabel}>Ventas Totales</Text>
            <Text style={styles.cardValueBig}>${formatearMonto(stats.totalVentas || 0)}</Text>
            <Text style={styles.cardSubtext}>{stats.cantidadPedidos || 0} pedidos</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.statCard, styles.cardSmall]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.smallCardValue}>${formatearMonto(stats.totalAbonado || 0)}</Text>
            <Text style={styles.smallCardLabel}>Cobrado</Text>
          </View>
          <View style={[styles.statCard, styles.cardSmall]}>
            <Ionicons name="time-outline" size={24} color={colors.warning} />
            <Text style={styles.smallCardValue}>${formatearMonto(stats.totalPendiente || 0)}</Text>
            <Text style={styles.smallCardLabel}>Por Cobrar</Text>
          </View>
          <View style={[styles.statCard, styles.cardSmall]}>
            <Ionicons name="calculator-outline" size={24} color={colors.info} />
            <Text style={styles.smallCardValue}>${formatearMonto(stats.promedioVenta || 0)}</Text>
            <Text style={styles.smallCardLabel}>Promedio</Text>
          </View>
        </View>

        {/* Estado de Elaboración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de Elaboración</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: stats.cantidadPedidos > 0 
                      ? `${(stats.elaborados / stats.cantidadPedidos) * 100}%` 
                      : '0%',
                    backgroundColor: colors.success 
                  }
                ]} 
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                ✅ Elaborados: {stats.elaborados || 0}
              </Text>
              <Text style={styles.progressText}>
                ⏳ Pendientes: {stats.porElaborar || 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Estado de Pagos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de Pagos</Text>
          <View style={styles.estadosPagoRow}>
            <View style={[styles.estadoPago, { borderLeftColor: colors.success }]}>
              <Text style={styles.estadoPagoNum}>{stats.pagados || 0}</Text>
              <Text style={styles.estadoPagoLabel}>Pagados</Text>
            </View>
            <View style={[styles.estadoPago, { borderLeftColor: colors.warning }]}>
              <Text style={styles.estadoPagoNum}>{stats.abonoPendiente || 0}</Text>
              <Text style={styles.estadoPagoLabel}>Con Abono</Text>
            </View>
            <View style={[styles.estadoPago, { borderLeftColor: colors.error }]}>
              <Text style={styles.estadoPagoNum}>{stats.noPagados || 0}</Text>
              <Text style={styles.estadoPagoLabel}>Sin Pago</Text>
            </View>
          </View>
        </View>

        {/* Ventas por Mes (Gráfico de barras) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ventas Últimos 6 Meses</Text>
          <View style={styles.chartContainer}>
            {stats.ventasPorMes?.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <Text style={styles.barValue}>
                  {item.total > 0 ? `$${formatearMonto(item.total)}` : '-'}
                </Text>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: maxVentaMes > 0 ? (item.total / maxVentaMes) * 100 : 0,
                        backgroundColor: index === 5 ? colors.primary : colors.primaryLight 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barLabel}>{item.mes}</Text>
                <Text style={styles.barCount}>{item.cantidad}p</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pedidos por Día de la Semana */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entregas por Día</Text>
          <View style={styles.diasContainer}>
            {stats.diasSemana?.map((dia, index) => {
              const maxDia = Math.max(...(stats.porDia || [1]));
              const porcentaje = maxDia > 0 ? (stats.porDia[index] / maxDia) * 100 : 0;
              return (
                <View key={dia} style={styles.diaItem}>
                  <Text style={styles.diaLabel}>{dia}</Text>
                  <View style={styles.diaBarWrapper}>
                    <View style={[styles.diaBar, { width: `${porcentaje}%` }]} />
                  </View>
                  <Text style={styles.diaCount}>{stats.porDia?.[index] || 0}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Por Plataforma */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ventas por Plataforma</Text>
          {Object.entries(stats.porPlataforma || {}).map(([plat, data]) => (
            <View key={plat} style={styles.plataformaRow}>
              <View style={[styles.plataformaIcon, { backgroundColor: getPlataformaColor(plat) + '20' }]}>
                <Ionicons name={getPlataformaIcon(plat)} size={20} color={getPlataformaColor(plat)} />
              </View>
              <Text style={styles.plataformaNombre}>{plat}</Text>
              <View style={styles.plataformaStats}>
                <Text style={styles.plataformaCantidad}>{data.cantidad} pedidos</Text>
                <Text style={styles.plataformaTotal}>${formatearMonto(data.total)}</Text>
              </View>
            </View>
          ))}
          {Object.keys(stats.porPlataforma || {}).length === 0 && (
            <Text style={styles.emptyText}>Sin datos de plataformas</Text>
          )}
        </View>

        {/* Inventario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Inventario</Text>
          <View style={styles.inventarioRow}>
            <View style={styles.inventarioCard}>
              <Ionicons name="cube-outline" size={28} color={colors.primary} />
              <Text style={styles.inventarioNum}>{stats.totalProductos || 0}</Text>
              <Text style={styles.inventarioLabel}>Productos</Text>
            </View>
            <View style={styles.inventarioCard}>
              <Ionicons name="layers-outline" size={28} color={colors.info} />
              <Text style={styles.inventarioNum}>{stats.inventarioTotal || 0}</Text>
              <Text style={styles.inventarioLabel}>Unidades</Text>
            </View>
            <View style={styles.inventarioCard}>
              <Ionicons name="pricetag-outline" size={28} color={colors.success} />
              <Text style={styles.inventarioNum}>${formatearMonto(stats.valorInventario || 0)}</Text>
              <Text style={styles.inventarioLabel}>Valor</Text>
            </View>
          </View>
        </View>

        {/* Colores de Productos */}
        {Object.keys(stats.porColor || {}).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 Productos por Color</Text>
            <View style={styles.coloresContainer}>
              {Object.entries(stats.porColor || {}).map(([color, cantidad]) => (
                <View key={color} style={styles.colorItem}>
                  <View style={[styles.colorDot, { backgroundColor: color }]} />
                  <Text style={styles.colorNombre}>{color}</Text>
                  <Text style={styles.colorCantidad}>{cantidad}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📁 Categorías: {stats.totalCategorias || 0}</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <BottomNavBar
        onNuevoPedido={() => navigation.navigate('NuevoPedido')}
        onPlanificar={() => navigation.navigate('Planificar')}
        onProductos={() => navigation.navigate('Productos')}
        onEstadisticas={() => {}}
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
  periodoContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodoBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodoBtnActivo: {
    backgroundColor: colors.primary,
  },
  periodoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodoTextActivo: {
    color: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    ...shadows.small,
  },
  cardPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  cardSmall: {
    flex: 1,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  cardValueBig: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  cardSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  smallCardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  smallCardLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...shadows.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  estadosPagoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  estadoPago: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  estadoPagoNum: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  estadoPagoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: 9,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  barWrapper: {
    height: 100,
    width: 24,
    backgroundColor: colors.background,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  barCount: {
    fontSize: 10,
    color: colors.textLight,
  },
  diasContainer: {
    gap: 8,
  },
  diaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diaLabel: {
    width: 30,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  diaBarWrapper: {
    flex: 1,
    height: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  diaBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  diaCount: {
    width: 24,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  plataformaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  plataformaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  plataformaNombre: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  plataformaStats: {
    alignItems: 'flex-end',
  },
  plataformaCantidad: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  plataformaTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: 20,
  },
  inventarioRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inventarioCard: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  inventarioNum: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
  },
  inventarioLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  coloresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorNombre: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  colorCantidad: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default EstadisticasScreen;
