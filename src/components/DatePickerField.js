import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const DatePickerField = ({ label, value, onChange, placeholder = 'Seleccionar fecha' }) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const formatDate = (date) => {
    if (!date) return '';
    // Agregar hora fija para evitar problemas de zona horaria
    const d = new Date(date + 'T12:00:00');
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const año = d.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const handlePress = () => {
    // Para simplificar, usamos un prompt de fecha nativo
    // En producción se usaría @react-native-community/datetimepicker
    const today = new Date();
    onChange(today.toISOString().split('T')[0]);
  };

  const incrementDay = () => {
    // Agregar T12:00:00 para evitar problemas de zona horaria
    const current = value ? new Date(value + 'T12:00:00') : new Date();
    current.setDate(current.getDate() + 1);
    onChange(current.toISOString().split('T')[0]);
  };

  const decrementDay = () => {
    // Agregar T12:00:00 para evitar problemas de zona horaria
    const current = value ? new Date(value + 'T12:00:00') : new Date();
    current.setDate(current.getDate() - 1);
    onChange(current.toISOString().split('T')[0]);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.arrowBtn} onPress={decrementDay}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.dateDisplay} onPress={handlePress}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text style={styles.dateText}>
            {value ? formatDate(value) : placeholder}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.arrowBtn} onPress={incrementDay}>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  arrowBtn: {
    padding: 14,
    backgroundColor: 'transparent',
  },
  dateDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  dateText: {
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

export default DatePickerField;
