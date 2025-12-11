import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const ToggleOption = ({ label, value, onValueChange, description }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.option, value === 'envio' && styles.optionActive]}
            onPress={() => onValueChange('envio')}
          >
            <Ionicons 
              name="car-outline" 
              size={18} 
              color={value === 'envio' ? colors.textOnPrimary : colors.textSecondary} 
            />
            <Text style={[styles.optionText, value === 'envio' && styles.optionTextActive]}>
              Envío
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.option, value === 'retiro' && styles.optionActive]}
            onPress={() => onValueChange('retiro')}
          >
            <Ionicons 
              name="storefront-outline" 
              size={18} 
              color={value === 'retiro' ? colors.textOnPrimary : colors.textSecondary} 
            />
            <Text style={[styles.optionText, value === 'retiro' && styles.optionTextActive]}>
              Retiro
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  description: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 10,
    padding: 3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  optionActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.textOnPrimary,
  },
});

export default ToggleOption;
