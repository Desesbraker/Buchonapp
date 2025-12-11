# BuchonApp 🌹

Aplicación para gestionar pedidos de ramos buchones personalizados.

## Características

- ✅ Registro de clientes y pedidos
- ✅ Control de pagos (pagado, abono pendiente, no pagado)
- ✅ Búsqueda por nombre, alias, número de pedido o frase personalizada
- ✅ Filtros por estado de pago y red social
- ✅ Botones de contacto directo (WhatsApp y llamada)
- ✅ Interfaz moderna con colores claros
- ✅ Control de inventario de productos

## Descargar APK

📱 **[Descargar última versión](./lanzamientos/)**

## Estructura de la App

### Pantalla Principal
- Logo en la parte superior
- 4 botones de acción: Nuevo Pedido, Planificar Entregas, Productos, Estadísticas
- Buscador de clientes
- Filtros horizontales con casillas
- Listado de clientes en tarjetas

### Tarjetas de Cliente
- Nombre del cliente
- Dirección
- Monto abonado y lo que debe
- Fecha de entrega
- Botones de WhatsApp y llamada

## Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# Compilar APK localmente (requiere EAS CLI)
npx eas build -p android --profile preview --local
```

## Tecnologías

- React Native + Expo
- AsyncStorage para persistencia local
- React Navigation para navegación
- Expo Vector Icons para íconos

---
*Desarrollado con ❤️ para emprendedores de ramos buchones*
