import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Image,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import {
  obtenerProductos,
  agregarProducto,
  eliminarProducto,
  actualizarProducto,
  obtenerCategorias,
  agregarCategoria,
  eliminarCategoria,
} from '../storage/storage';
import BottomNavBar from '../components/BottomNavBar';

const ProductosScreen = ({ navigation }) => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalProducto, setModalProducto] = useState(false);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('productos');
  const [productoEditando, setProductoEditando] = useState(null); // null = nuevo, objeto = editando

  // Estado para nuevo producto
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    color: '',
    precio: '',
    cantidad: '',
    descripcion: '',
    imagen: null,
    categoriaId: null,
  });

  // Estado para nueva categoría
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: '',
    detalle: '',
    imagen: null,
  });

  const cargarDatos = useCallback(async () => {
    const prods = await obtenerProductos();
    const cats = await obtenerCategorias();
    setProductos(prods);
    setCategorias(cats);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  const seleccionarImagen = async (tipo, esProducto = true) => {
    // Funcionalidad de imagen deshabilitada por ahora
    Alert.alert(
      'Próximamente',
      'La selección de imágenes estará disponible en una próxima actualización'
    );
  };

  const mostrarOpcionesImagen = (esProducto = true) => {
    seleccionarImagen('galeria', esProducto);
  };

  const abrirModalEditarProducto = (producto) => {
    setProductoEditando(producto);
    setNuevoProducto({
      nombre: producto.nombre || '',
      color: producto.color || '',
      precio: producto.precio?.toString() || '',
      cantidad: producto.cantidad?.toString() || '',
      descripcion: producto.descripcion || '',
      imagen: producto.imagen || null,
      categoriaId: producto.categoriaId || null,
    });
    setModalProducto(true);
  };

  const abrirModalNuevoProducto = () => {
    setProductoEditando(null);
    setNuevoProducto({
      nombre: '',
      color: '',
      precio: '',
      cantidad: '',
      descripcion: '',
      imagen: null,
      categoriaId: null,
    });
    setModalProducto(true);
  };

  const cerrarModalProducto = () => {
    setModalProducto(false);
    setProductoEditando(null);
    setNuevoProducto({
      nombre: '',
      color: '',
      precio: '',
      cantidad: '',
      descripcion: '',
      imagen: null,
      categoriaId: null,
    });
  };

  const guardarProducto = async () => {
    if (!nuevoProducto.nombre.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }
    if (!nuevoProducto.precio.trim()) {
      Alert.alert('Error', 'El precio es obligatorio');
      return;
    }
    if (!nuevoProducto.categoriaId) {
      Alert.alert('Error', 'Debes seleccionar una categoría para el producto');
      return;
    }

    const datosProducto = {
      ...nuevoProducto,
      precio: parseFloat(nuevoProducto.precio) || 0,
      cantidad: parseInt(nuevoProducto.cantidad) || 0,
    };

    let resultado;
    if (productoEditando) {
      // Modo edición
      resultado = await actualizarProducto({
        ...productoEditando,
        ...datosProducto,
      });
      if (resultado) {
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      }
    } else {
      // Modo nuevo
      resultado = await agregarProducto(datosProducto);
      if (resultado) {
        Alert.alert('Éxito', 'Producto agregado correctamente');
      }
    }

    if (resultado) {
      cerrarModalProducto();
      cargarDatos();
    }
  };

  const guardarNuevaCategoria = async () => {
    if (!nuevaCategoria.nombre.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es obligatorio');
      return;
    }

    const resultado = await agregarCategoria(nuevaCategoria);

    if (resultado) {
      Alert.alert('Éxito', 'Categoría agregada correctamente');
      setModalCategoria(false);
      setNuevaCategoria({
        nombre: '',
        detalle: '',
        imagen: null,
      });
      cargarDatos();
    }
  };

  const mostrarOpcionesProducto = (producto) => {
    Alert.alert(
      producto.nombre,
      '¿Qué deseas hacer con este producto?',
      [
        { 
          text: 'Editar', 
          onPress: () => abrirModalEditarProducto(producto)
        },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => confirmarEliminarProducto(producto)
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const confirmarEliminarProducto = (producto) => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de eliminar "${producto.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            await eliminarProducto(producto.id);
            cargarDatos();
          }
        },
      ]
    );
  };

  const confirmarEliminarCategoria = (categoria) => {
    Alert.alert(
      'Eliminar categoría',
      `¿Estás seguro de eliminar "${categoria.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            await eliminarCategoria(categoria.id);
            cargarDatos();
          }
        },
      ]
    );
  };

  const formatearPrecio = (precio) => {
    return precio.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const renderProducto = ({ item }) => (
    <TouchableOpacity 
      style={styles.productoCard}
      onPress={() => abrirModalEditarProducto(item)}
      onLongPress={() => mostrarOpcionesProducto(item)}
    >
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.productoImagen} />
      ) : (
        <View style={[styles.productoImagen, styles.productoSinImagen]}>
          <Ionicons name="flower-outline" size={30} color={colors.textLight} />
        </View>
      )}
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre} numberOfLines={1}>{item.nombre}</Text>
        {item.color && (
          <View style={styles.colorRow}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text style={styles.colorText}>{item.color}</Text>
          </View>
        )}
        <Text style={styles.productoPrecio}>${formatearPrecio(item.precio)}</Text>
      </View>
      <View style={styles.cantidadBadge}>
        <Text style={styles.cantidadText}>{item.cantidad || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoria = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoriaCard}
      onLongPress={() => confirmarEliminarCategoria(item)}
    >
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.categoriaImagen} />
      ) : (
        <View style={[styles.categoriaImagen, styles.categoriaSinImagen]}>
          <Ionicons name="folder-outline" size={24} color={colors.textLight} />
        </View>
      )}
      <Text style={styles.categoriaNombre} numberOfLines={1}>{item.nombre}</Text>
      {item.detalle && (
        <Text style={styles.categoriaDetalle} numberOfLines={2}>{item.detalle}</Text>
      )}
    </TouchableOpacity>
  );

  const coloresPreset = [
    '#E91E63', '#F44336', '#FF9800', '#FFEB3B', 
    '#4CAF50', '#2196F3', '#9C27B0', '#FFFFFF', 
    '#000000', '#795548',
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Productos</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Botones principales */}
      <View style={styles.botonesContainer}>
        <TouchableOpacity 
          style={styles.botonPrincipal}
          onPress={abrirModalNuevoProducto}
        >
          <Ionicons name="add-circle" size={28} color={colors.primary} />
          <Text style={styles.botonTexto}>Añadir Producto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.botonPrincipal}
          onPress={() => setModalCategoria(true)}
        >
          <Ionicons name="folder-open" size={28} color={colors.info} />
          <Text style={styles.botonTexto}>Añadir Categoría</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, vistaActiva === 'productos' && styles.tabActivo]}
          onPress={() => setVistaActiva('productos')}
        >
          <Text style={[styles.tabTexto, vistaActiva === 'productos' && styles.tabTextoActivo]}>
            Productos ({productos.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, vistaActiva === 'categorias' && styles.tabActivo]}
          onPress={() => setVistaActiva('categorias')}
        >
          <Text style={[styles.tabTexto, vistaActiva === 'categorias' && styles.tabTextoActivo]}>
            Categorías ({categorias.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {vistaActiva === 'productos' ? (
        <FlatList
          data={productos}
          renderItem={renderProducto}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listaContainer}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="flower-outline" size={50} color={colors.textLight} />
              <Text style={styles.emptyText}>No hay productos</Text>
              <Text style={styles.emptySubtext}>Presiona "Añadir Producto" para comenzar</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={categorias}
          renderItem={renderCategoria}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listaContainer}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-outline" size={50} color={colors.textLight} />
              <Text style={styles.emptyText}>No hay categorías</Text>
              <Text style={styles.emptySubtext}>Presiona "Añadir Categoría" para comenzar</Text>
            </View>
          }
        />
      )}

      {/* Modal Añadir/Editar Producto */}
      <Modal
        visible={modalProducto}
        animationType="slide"
        transparent={true}
        onRequestClose={cerrarModalProducto}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                {productoEditando ? 'Editar Producto' : 'Añadir Producto'}
              </Text>
              <TouchableOpacity onPress={cerrarModalProducto}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Imagen */}
              <TouchableOpacity 
                style={styles.imagenSelector}
                onPress={() => mostrarOpcionesImagen(true)}
              >
                {nuevoProducto.imagen ? (
                  <Image source={{ uri: nuevoProducto.imagen }} style={styles.imagenPreview} />
                ) : (
                  <>
                    <Ionicons name="camera" size={40} color={colors.textLight} />
                    <Text style={styles.imagenTexto}>Tomar o seleccionar foto</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Nombre */}
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Rosa Roja Premium"
                placeholderTextColor={colors.textLight}
                value={nuevoProducto.nombre}
                onChangeText={(text) => setNuevoProducto(prev => ({ ...prev, nombre: text }))}
              />

              {/* Color */}
              <Text style={styles.inputLabel}>Color</Text>
              <View style={styles.coloresContainer}>
                {coloresPreset.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      nuevoProducto.color === color && styles.colorSelected
                    ]}
                    onPress={() => setNuevoProducto(prev => ({ ...prev, color }))}
                  />
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="O escribe el color"
                placeholderTextColor={colors.textLight}
                value={nuevoProducto.color}
                onChangeText={(text) => setNuevoProducto(prev => ({ ...prev, color: text }))}
              />

              {/* Precio y Cantidad */}
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Precio *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={colors.textLight}
                    value={nuevoProducto.precio}
                    onChangeText={(text) => setNuevoProducto(prev => ({ ...prev, precio: text }))}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Cantidad</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={colors.textLight}
                    value={nuevoProducto.cantidad}
                    onChangeText={(text) => setNuevoProducto(prev => ({ ...prev, cantidad: text }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Descripción */}
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Breve resumen del producto..."
                placeholderTextColor={colors.textLight}
                value={nuevoProducto.descripcion}
                onChangeText={(text) => setNuevoProducto(prev => ({ ...prev, descripcion: text }))}
                multiline
                numberOfLines={3}
              />

              {/* Categoría */}
              <Text style={styles.inputLabel}>Categoría *</Text>
              {categorias.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
                  {categorias.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoriaOption,
                        nuevoProducto.categoriaId === cat.id && styles.categoriaOptionSelected
                      ]}
                      onPress={() => setNuevoProducto(prev => ({ ...prev, categoriaId: cat.id }))}
                    >
                      <Text style={[
                        styles.categoriaOptionText,
                        nuevoProducto.categoriaId === cat.id && styles.categoriaOptionTextSelected
                      ]}>
                        {cat.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.sinCategoriasContainer}>
                  <Text style={styles.sinCategoriasText}>No hay categorías. Crea una primero.</Text>
                  <TouchableOpacity 
                    style={styles.crearCategoriaBtn}
                    onPress={() => {
                      setModalProducto(false);
                      setModalCategoria(true);
                    }}
                  >
                    <Ionicons name="add-circle" size={20} color={colors.info} />
                    <Text style={styles.crearCategoriaBtnText}>Crear Categoría</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Botón Guardar */}
              <TouchableOpacity style={styles.botonGuardar} onPress={guardarProducto}>
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                <Text style={styles.botonGuardarTexto}>
                  {productoEditando ? 'Actualizar Producto' : 'Guardar Producto'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Añadir Categoría */}
      <Modal
        visible={modalCategoria}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalCategoria(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>Añadir Categoría</Text>
              <TouchableOpacity onPress={() => setModalCategoria(false)}>
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Imagen */}
              <TouchableOpacity 
                style={styles.imagenSelector}
                onPress={() => mostrarOpcionesImagen(false)}
              >
                {nuevaCategoria.imagen ? (
                  <Image source={{ uri: nuevaCategoria.imagen }} style={styles.imagenPreview} />
                ) : (
                  <>
                    <Ionicons name="image" size={40} color={colors.textLight} />
                    <Text style={styles.imagenTexto}>Seleccionar imagen</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Nombre */}
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Rosas, Girasoles, Accesorios..."
                placeholderTextColor={colors.textLight}
                value={nuevaCategoria.nombre}
                onChangeText={(text) => setNuevaCategoria(prev => ({ ...prev, nombre: text }))}
              />

              {/* Detalle */}
              <Text style={styles.inputLabel}>Detalle</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Descripción de la categoría..."
                placeholderTextColor={colors.textLight}
                value={nuevaCategoria.detalle}
                onChangeText={(text) => setNuevaCategoria(prev => ({ ...prev, detalle: text }))}
                multiline
                numberOfLines={3}
              />

              {/* Botón Guardar */}
              <TouchableOpacity style={[styles.botonGuardar, { backgroundColor: colors.info }]} onPress={guardarNuevaCategoria}>
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                <Text style={styles.botonGuardarTexto}>Guardar Categoría</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNavBar
        onNuevoPedido={() => navigation.navigate('NuevoPedido')}
        onPlanificar={() => navigation.navigate('Planificar')}
        onProductos={() => {}}
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
  botonesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  botonPrincipal: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    ...shadows.small,
  },
  botonTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActivo: {
    backgroundColor: colors.primary,
  },
  tabTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextoActivo: {
    color: '#FFF',
  },
  listaContainer: {
    padding: 16,
    paddingTop: 4,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productoCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.small,
  },
  productoImagen: {
    width: '100%',
    height: 120,
  },
  productoSinImagen: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productoInfo: {
    padding: 12,
  },
  productoNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  productoPrecio: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  cantidadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cantidadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoriaCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    ...shadows.small,
  },
  categoriaImagen: {
    width: '100%',
    height: 100,
  },
  categoriaSinImagen: {
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriaNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 12,
    paddingBottom: 4,
  },
  categoriaDetalle: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  imagenSelector: {
    height: 150,
    backgroundColor: colors.background,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagenPreview: {
    width: '100%',
    height: '100%',
  },
  imagenTexto: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  coloresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
  },
  colorSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  botonGuardar: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  botonGuardarTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  categoriasScroll: {
    marginBottom: 12,
  },
  categoriaOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoriaOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoriaOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoriaOptionTextSelected: {
    color: '#FFF',
  },
  sinCategoriasContainer: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  sinCategoriasText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  crearCategoriaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crearCategoriaBtnText: {
    fontSize: 14,
    color: colors.info,
    fontWeight: '600',
  },
});

export default ProductosScreen;
