import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

const ProductoItem = ({ producto, cantidad, onCantidadChange, onRemove }) => {
  return (
    <View style={styles.productoItem}>
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre}>{producto.nombre}</Text>
        <Text style={styles.productoDetalle}>
          {producto.rosasBase} rosas base • ${producto.precio?.toLocaleString() || 0}
        </Text>
      </View>
      <View style={styles.cantidadContainer}>
        <TouchableOpacity 
          style={styles.cantidadBtn}
          onPress={() => onCantidadChange(Math.max(1, cantidad - 1))}
        >
          <Ionicons name="remove" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.cantidadText}>{cantidad}</Text>
        <TouchableOpacity 
          style={styles.cantidadBtn}
          onPress={() => onCantidadChange(cantidad + 1)}
        >
          <Ionicons name="add" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
};

const ProductoSelector = ({ productosSeleccionados, onProductosChange, productosDisponibles }) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const agregarProducto = (producto) => {
    const existe = productosSeleccionados.find(p => p.producto.id === producto.id);
    if (existe) {
      Alert.alert('Producto ya agregado', 'Este producto ya está en la lista');
      return;
    }
    onProductosChange([...productosSeleccionados, { producto, cantidad: 1 }]);
    setModalVisible(false);
  };

  const actualizarCantidad = (index, cantidad) => {
    const nuevos = [...productosSeleccionados];
    nuevos[index].cantidad = cantidad;
    onProductosChange(nuevos);
  };

  const eliminarProducto = (index) => {
    const nuevos = productosSeleccionados.filter((_, i) => i !== index);
    onProductosChange(nuevos);
  };

  const renderProductoDisponible = ({ item }) => (
    <TouchableOpacity 
      style={styles.productoDisponible}
      onPress={() => agregarProducto(item)}
    >
      <View style={styles.productoIconContainer}>
        <Ionicons name="flower-outline" size={24} color={colors.primary} />
      </View>
      <View style={styles.productoDisponibleInfo}>
        <Text style={styles.productoNombre}>{item.nombre}</Text>
        <Text style={styles.productoDetalle}>
          {item.rosasBase} rosas • ${item.precio?.toLocaleString() || 0}
        </Text>
      </View>
      <Ionicons name="add-circle" size={28} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Requisitos del Pedido</Text>
      
      {productosSeleccionados.map((item, index) => (
        <ProductoItem
          key={`${item.producto.id}-${index}`}
          producto={item.producto}
          cantidad={item.cantidad}
          onCantidadChange={(cant) => actualizarCantidad(index, cant)}
          onRemove={() => eliminarProducto(index)}
        />
      ))}

      <TouchableOpacity 
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
        <Text style={styles.addBtnText}>Añadir Producto</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Producto</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={productosDisponibles}
              renderItem={renderProductoDisponible}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyText}>No hay productos disponibles</Text>
                  <Text style={styles.emptySubtext}>Agrega productos desde la sección Productos</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  productoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  productoDetalle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  cantidadBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  productoDisponible: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  productoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productoDisponibleInfo: {
    flex: 1,
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
});

export default ProductoSelector;
