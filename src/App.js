import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import NuevoPedidoScreen from './screens/NuevoPedidoScreen';
import PlanificarScreen from './screens/PlanificarScreen';
import ProductosScreen from './screens/ProductosScreen';
import EstadisticasScreen from './screens/EstadisticasScreen';
import { colors } from './theme/colors';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="NuevoPedido" component={NuevoPedidoScreen} />
          <Stack.Screen name="Planificar" component={PlanificarScreen} />
          <Stack.Screen name="Productos" component={ProductosScreen} />
          <Stack.Screen name="Estadisticas" component={EstadisticasScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
