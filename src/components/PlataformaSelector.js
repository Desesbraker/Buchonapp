import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const plataformas = [
  { id: 'whatsapp', nombre: 'WhatsApp', icon: 'logo-whatsapp', color: '#25D366' },
  { id: 'instagram', nombre: 'Instagram', icon: 'logo-instagram', color: '#E4405F' },
  { id: 'facebook', nombre: 'Facebook', icon: 'logo-facebook', color: '#1877F2' },
  { id: 'tiktok', nombre: 'logo-tiktok', icon: 'musical-notes', color: '#000000' },
  { id: 'otro', nombre: 'Otro', icon: 'ellipsis-horizontal', color: '#666666' },
];

const PlataformaSelector = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Plataforma de origen</Text>
      <View style={styles.plataformasRow}>
        {plataformas.map((plat) => (
          <TouchableOpacity
            key={plat.id}
            style={[
              styles.plataformaBtn,
              selected === plat.id && { backgroundColor: plat.color + '20', borderColor: plat.color }
            ]}
            onPress={() => onSelect(plat.id)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={plat.icon} 
              size={24} 
              color={selected === plat.id ? plat.color : colors.textSecondary} 
            />
          </TouchableOpacity>
        ))}
      </View>
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
  plataformasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  plataformaBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlataformaSelector;
