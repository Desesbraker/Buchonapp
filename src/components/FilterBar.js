import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

const FilterChip = ({ label, selected, onPress, color }) => (
  <TouchableOpacity
    style={[
      styles.chip,
      selected && { backgroundColor: color || colors.primary, borderColor: color || colors.primary }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const FilterBar = ({ filtros, onToggleFiltro }) => {
  const filtrosConfig = [
    { key: 'elaborado', label: '✅ Elaborado', color: colors.success },
    { key: 'pendiente_elaborar', label: '⏳ Por elaborar', color: '#9E9E9E' },
    { key: 'abono_pendiente', label: 'Abono Pendiente', color: colors.warning },
    { key: 'no_pagado', label: 'No Pagado', color: colors.error },
    { key: 'pagado', label: 'Pagado', color: colors.success },
    { key: 'por_fecha', label: 'Por Fecha', color: colors.info },
    { key: 'instagram', label: 'Instagram', color: '#E4405F' },
    { key: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
    { key: 'facebook', label: 'Facebook', color: '#1877F2' },
    { key: 'tiktok', label: 'TikTok', color: '#000000' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Filtros:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filtrosConfig.map((filtro) => (
          <FilterChip
            key={filtro.key}
            label={filtro.label}
            selected={filtros[filtro.key]}
            onPress={() => onToggleFiltro(filtro.key)}
            color={filtro.color}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  titulo: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 16,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginHorizontal: 4,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: colors.textOnPrimary,
  },
});

export default FilterBar;
