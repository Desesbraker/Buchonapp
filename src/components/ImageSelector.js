import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const ImageSelector = ({ images, onImagesChange, maxImages = 5, label = 'Imágenes' }) => {
  
  const handleAddImage = () => {
    // En producción usaríamos expo-image-picker
    // Por ahora simulamos añadiendo una imagen placeholder
    Alert.alert(
      'Añadir Imagen',
      'Selecciona una opción',
      [
        { text: 'Cámara', onPress: () => addPlaceholderImage('camera') },
        { text: 'Galería', onPress: () => addPlaceholderImage('gallery') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const addPlaceholderImage = (source) => {
    if (images.length >= maxImages) {
      Alert.alert('Límite alcanzado', `Máximo ${maxImages} imágenes permitidas`);
      return;
    }
    const newImage = {
      id: Date.now().toString(),
      uri: `placeholder_${source}_${images.length + 1}`,
      source,
    };
    onImagesChange([...images, newImage]);
  };

  const handleRemoveImage = (imageId) => {
    Alert.alert(
      'Eliminar imagen',
      '¿Estás seguro de eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => onImagesChange(images.filter(img => img.id !== imageId))
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.imagesRow}>
          {images.map((image) => (
            <View key={image.id} style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <Ionicons 
                  name={image.source === 'camera' ? 'camera' : 'image'} 
                  size={30} 
                  color={colors.primary} 
                />
              </View>
              <TouchableOpacity 
                style={styles.removeBtn}
                onPress={() => handleRemoveImage(image.id)}
              >
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          
          {images.length < maxImages && (
            <TouchableOpacity style={styles.addBtn} onPress={handleAddImage}>
              <Ionicons name="add" size={30} color={colors.primary} />
              <Text style={styles.addText}>Añadir</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scrollView: {
    marginHorizontal: -4,
  },
  imagesRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  imageContainer: {
    marginRight: 10,
    position: 'relative',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  addBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
  },
});

export default ImageSelector;
