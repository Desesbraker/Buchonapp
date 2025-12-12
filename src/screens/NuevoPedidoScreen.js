import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { guardarPedido, obtenerSiguienteNumeroPedido, obtenerProductos, guardarProductos, actualizarPedido } from '../storage/storage';
import { sampleProductos } from '../data/sampleData';

// Componentes
import InputField from '../components/InputField';
import DatePickerField from '../components/DatePickerField';
import PlataformaSelector from '../components/PlataformaSelector';
import ProductoSelector from '../components/ProductoSelector';
import ImageSelector from '../components/ImageSelector';
import ToggleOption from '../components/ToggleOption';

const NuevoPedidoScreen = ({ navigation, route }) => {
  // Verificar si estamos editando un pedido existente
  const pedidoEditar = route.params?.pedidoEditar || null;
  const esEdicion = pedidoEditar !== null;

  // Estado del formulario
  const [numeroPedido, setNumeroPedido] = useState('');
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [fechaReserva, setFechaReserva] = useState(new Date().toISOString().split('T')[0]);
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const [telefono, setTelefono] = useState('+56 9 ');
  const [tipoEntrega, setTipoEntrega] = useState('envio');
  const [direccion, setDireccion] = useState('');
  const [detalles, setDetalles] = useState('');
  const [abono, setAbono] = useState('');
  const [medioPago, setMedioPago] = useState('');
  const [comprobantes, setComprobantes] = useState([]);
  const [imagenesAdicionales, setImagenesAdicionales] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [frasePersonalizada, setFrasePersonalizada] = useState('');
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [totalManual, setTotalManual] = useState('');

  // Calcular totales
  const total = totalManual ? (parseInt(totalManual) || 0) : 0;
  const abonoNum = parseInt(abono) || 0;
  const pendiente = total - abonoNum;

  // Cargar número de pedido y productos al iniciar
  useEffect(() => {
    const inicializar = async () => {
      // Cargar productos o inicializar con datos de ejemplo
      let productos = await obtenerProductos();
      if (productos.length === 0) {
        await guardarProductos(sampleProductos);
        productos = sampleProductos;
      }
      setProductosDisponibles(productos);

      if (esEdicion && pedidoEditar) {
        // Modo edición: cargar datos del pedido existente
        setNumeroPedido(pedidoEditar.numeroPedido || '');
        setNombre(pedidoEditar.nombre || '');
        setAlias(pedidoEditar.alias || '');
        setFechaReserva(pedidoEditar.fechaReserva || new Date().toISOString().split('T')[0]);
        setFechaEntrega(pedidoEditar.fechaEntrega || '');
        setPlataforma(pedidoEditar.plataforma || pedidoEditar.redSocial || '');
        setTelefono(pedidoEditar.telefono || '+56 9 ');
        setTipoEntrega(pedidoEditar.tipoEntrega || 'envio');
        setDireccion(pedidoEditar.direccion || '');
        setDetalles(pedidoEditar.detalles || '');
        setAbono(pedidoEditar.montoAbonado?.toString() || '');
        setMedioPago(pedidoEditar.medioPago || '');
        setComprobantes(pedidoEditar.comprobantes || []);
        setImagenesAdicionales(pedidoEditar.imagenesAdicionales || []);
        setProductosSeleccionados(pedidoEditar.productos || []);
        setFrasePersonalizada(pedidoEditar.frasePersonalizada || '');
        setTotalManual(pedidoEditar.montoTotal?.toString() || '');
      } else {
        // Modo nuevo: obtener siguiente número de pedido
        const numero = await obtenerSiguienteNumeroPedido();
        setNumeroPedido(numero);
      }
    };
    inicializar();
  }, [esEdicion, pedidoEditar]);

  const abrirMaps = () => {
    if (direccion) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
      Linking.openURL(url);
    } else {
      const url = 'https://www.google.com/maps';
      Linking.openURL(url);
    }
  };

  const validarFormulario = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del cliente es obligatorio');
      return false;
    }
    if (!telefono.trim()) {
      Alert.alert('Error', 'El número de contacto es obligatorio');
      return false;
    }
    if (!fechaEntrega) {
      Alert.alert('Error', 'La fecha de entrega es obligatoria');
      return false;
    }
    if (tipoEntrega === 'envio' && !direccion.trim()) {
      Alert.alert('Error', 'La dirección es obligatoria para envío');
      return false;
    }
    if (!totalManual || parseInt(totalManual) <= 0) {
      Alert.alert('Error', 'Debe ingresar el total del pedido');
      return false;
    }
    return true;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);

    try {
      const estado = abonoNum === 0 ? 'no_pagado' : (abonoNum >= total ? 'pagado' : 'abono_pendiente');

      const pedido = {
        numeroPedido,
        nombre: nombre.trim(),
        alias: alias.trim(),
        fechaReserva,
        fechaEntrega,
        plataforma,
        telefono: telefono.trim(),
        tipoEntrega,
        direccion: tipoEntrega === 'envio' ? direccion.trim() : '',
        detalles: detalles.trim(),
        montoAbonado: abonoNum,
        montoTotal: total,
        montoPendiente: pendiente,
        medioPago,
        comprobantes,
        imagenesAdicionales,
        productos: productosSeleccionados,
        frasePersonalizada: frasePersonalizada.trim(),
        estado,
        redSocial: plataforma, // Para compatibilidad con el listado
        horaEntrega: pedidoEditar?.horaEntrega || '12:00', // Mantener hora si editando
      };

      let resultado;
      
      if (esEdicion && pedidoEditar) {
        // Modo edición: actualizar pedido existente
        const pedidoActualizado = {
          ...pedidoEditar,
          ...pedido,
          id: pedidoEditar.id, // Mantener el ID original
        };
        resultado = await actualizarPedido(pedidoActualizado);
        
        if (resultado) {
          Alert.alert(
            '¡Pedido Actualizado!',
            `Pedido ${numeroPedido} actualizado exitosamente`,
            [
              {
                text: 'Aceptar',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        } else {
          Alert.alert('Error', 'No se pudo actualizar el pedido');
        }
      } else {
        // Modo nuevo: guardar nuevo pedido
        resultado = await guardarPedido(pedido);

        if (resultado) {
          Alert.alert(
            '¡Pedido Guardado!',
            `Pedido ${numeroPedido} guardado exitosamente`,
            [
              {
                text: 'Crear otro',
                onPress: async () => {
                  // Resetear formulario
                  const nuevoNumero = await obtenerSiguienteNumeroPedido();
                  setNumeroPedido(nuevoNumero);
                  setNombre('');
                  setAlias('');
                  setFechaReserva(new Date().toISOString().split('T')[0]);
                  setFechaEntrega('');
                  setPlataforma('');
                  setTelefono('');
                  setTipoEntrega('envio');
                  setDireccion('');
                  setDetalles('');
                  setAbono('');
                  setMedioPago('');
                  setComprobantes([]);
                  setImagenesAdicionales([]);
                  setProductosSeleccionados([]);
                  setFrasePersonalizada('');
                  setTotalManual('');
                },
              },
              {
                text: 'Ir al inicio',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        } else {
          Alert.alert('Error', 'No se pudo guardar el pedido');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar');
      console.error(error);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{esEdicion ? 'Editar Pedido' : 'Nuevo Pedido'}</Text>
            <View style={styles.numeroPedidoBadge}>
              <Text style={styles.numeroPedidoText}>{numeroPedido}</Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* SECCIÓN: DATOS DEL CLIENTE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-outline" size={18} color={colors.primary} /> Datos del Cliente
            </Text>

            <InputField
              label="Nombre del cliente *"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre completo"
            />

            <InputField
              label="Alias"
              value={alias}
              onChangeText={setAlias}
              placeholder="Apodo o nombre corto"
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <DatePickerField
                  label="Fecha de reserva"
                  value={fechaReserva}
                  onChange={setFechaReserva}
                />
              </View>
              <View style={styles.halfField}>
                <DatePickerField
                  label="Fecha de entrega *"
                  value={fechaEntrega}
                  onChange={setFechaEntrega}
                  placeholder="Seleccionar"
                />
              </View>
            </View>

            <PlataformaSelector
              selected={plataforma}
              onSelect={setPlataforma}
            />

            <InputField
              label="Número de contacto *"
              value={telefono}
              onChangeText={setTelefono}
              placeholder="+56 9 1234 5678"
              keyboardType="phone-pad"
            />

            <ToggleOption
              label="¿Envío o retiro?"
              value={tipoEntrega}
              onValueChange={setTipoEntrega}
            />

            {tipoEntrega === 'envio' && (
              <View>
                <InputField
                  label="Dirección de entrega *"
                  value={direccion}
                  onChangeText={setDireccion}
                  placeholder="Calle, número, comuna..."
                />
                <TouchableOpacity style={styles.mapsBtn} onPress={abrirMaps}>
                  <Ionicons name="location" size={18} color={colors.primary} />
                  <Text style={styles.mapsBtnText}>Buscar en Google Maps</Text>
                </TouchableOpacity>
              </View>
            )}

            <InputField
              label="Detalles del pedido"
              value={detalles}
              onChangeText={setDetalles}
              placeholder="Observaciones, instrucciones especiales..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* SECCIÓN: PAGOS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="wallet-outline" size={18} color={colors.primary} /> Información de Pago
            </Text>

            <View style={styles.row}>
              <View style={styles.thirdField}>
                <InputField
                  label="Total *"
                  value={totalManual}
                  onChangeText={setTotalManual}
                  placeholder="0"
                  keyboardType="numeric"
                  prefix="$"
                />
              </View>
              <View style={styles.thirdField}>
                <InputField
                  label="Abono"
                  value={abono}
                  onChangeText={setAbono}
                  placeholder="0"
                  keyboardType="numeric"
                  prefix="$"
                />
              </View>
              <View style={styles.thirdField}>
                <InputField
                  label="Pendiente"
                  value={pendiente.toLocaleString()}
                  editable={false}
                  prefix="$"
                />
              </View>
            </View>

            <InputField
              label="Medio de pago"
              value={medioPago}
              onChangeText={setMedioPago}
              placeholder="Transferencia, efectivo, etc."
            />

            <ImageSelector
              label="Comprobante de pago"
              images={comprobantes}
              onImagesChange={setComprobantes}
              maxImages={3}
            />

            <ImageSelector
              label="Imágenes adicionales del pedido"
              images={imagenesAdicionales}
              onImagesChange={setImagenesAdicionales}
              maxImages={5}
            />
          </View>

          {/* SECCIÓN: REQUISITOS DEL PEDIDO */}
          <View style={styles.section}>
            <ProductoSelector
              productosSeleccionados={productosSeleccionados}
              onProductosChange={setProductosSeleccionados}
              productosDisponibles={productosDisponibles}
            />

            <InputField
              label="🎀 Frase para cinta personalizada"
              value={frasePersonalizada}
              onChangeText={setFrasePersonalizada}
              placeholder="Escribe aquí la frase para la cinta..."
              multiline
              numberOfLines={2}
            />
          </View>

          {/* RESUMEN */}
          <View style={styles.resumenContainer}>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Productos:</Text>
              <Text style={styles.resumenValor}>{productosSeleccionados.length}</Text>
            </View>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Total:</Text>
              <Text style={styles.resumenTotal}>${total.toLocaleString()}</Text>
            </View>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Abonado:</Text>
              <Text style={[styles.resumenValor, { color: colors.success }]}>${abonoNum.toLocaleString()}</Text>
            </View>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Pendiente:</Text>
              <Text style={[styles.resumenValor, { color: pendiente > 0 ? colors.error : colors.success }]}>
                ${pendiente.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* BOTÓN GUARDAR */}
          <TouchableOpacity 
            style={[styles.guardarBtn, guardando && styles.guardarBtnDisabled]}
            onPress={handleGuardar}
            disabled={guardando}
          >
            <Ionicons name="save-outline" size={22} color={colors.textOnPrimary} />
            <Text style={styles.guardarBtnText}>
              {guardando ? 'Guardando...' : (esEdicion ? 'Actualizar Pedido' : 'Guardar Pedido')}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  numeroPedidoBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  numeroPedidoText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...shadows.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  thirdField: {
    flex: 1,
  },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    marginTop: -8,
    marginBottom: 16,
    gap: 8,
  },
  mapsBtnText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  resumenContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...shadows.small,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resumenLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  resumenValor: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  resumenTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  guardarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    ...shadows.medium,
  },
  guardarBtnDisabled: {
    opacity: 0.6,
  },
  guardarBtnText: {
    color: colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default NuevoPedidoScreen;
