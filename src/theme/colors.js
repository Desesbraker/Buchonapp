// Colores de la aplicación - Tonos claros y modernos
export const colors = {
  // Colores principales
  primary: '#E91E63',        // Rosa principal
  primaryLight: '#F8BBD9',   // Rosa claro
  primaryDark: '#C2185B',    // Rosa oscuro
  
  // Fondos
  background: '#FFF5F5',     // Fondo rosa muy suave
  surface: '#FFFFFF',        // Superficies blancas
  card: '#FFFFFF',           // Tarjetas
  
  // Texto
  textPrimary: '#333333',    // Texto principal
  textSecondary: '#666666',  // Texto secundario
  textLight: '#999999',      // Texto claro
  textOnPrimary: '#FFFFFF',  // Texto sobre fondo rosa
  
  // Estados
  success: '#4CAF50',        // Verde - Pagado
  warning: '#FF9800',        // Naranja - Abono pendiente
  error: '#F44336',          // Rojo - No pagado
  info: '#2196F3',           // Azul - Información
  
  // Bordes y sombras
  border: '#E0E0E0',
  shadow: '#00000020',
  
  // Redes sociales
  whatsapp: '#25D366',
  instagram: '#E4405F',
  facebook: '#1877F2',
  tiktok: '#000000',
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
