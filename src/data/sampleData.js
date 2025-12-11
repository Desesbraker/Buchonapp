// Datos de ejemplo para mostrar en la app
export const sampleClientes = [
  {
    id: '1',
    nombre: 'María García',
    alias: 'Mari',
    telefono: '+56912345678',
    direccion: 'Av. Libertador 1234, Santiago',
    redSocial: 'instagram',
    numeroPedido: 'P001',
    frasePersonalizada: 'Para mi madre con amor',
    fechaEntrega: '2025-12-15',
    horaEntrega: '14:00',
    montoTotal: 45000,
    montoAbonado: 20000,
    estado: 'abono_pendiente', // pagado, no_pagado, abono_pendiente
    productos: [
      { nombre: 'Ramo Buchón Grande', cantidad: 1, rosasUsadas: 50 }
    ],
    notas: 'Entregar en portería'
  },
  {
    id: '2',
    nombre: 'Juan Pérez',
    alias: 'Juanito',
    telefono: '+56987654321',
    direccion: 'Calle Los Robles 567, Providencia',
    redSocial: 'whatsapp',
    numeroPedido: 'P002',
    frasePersonalizada: 'Feliz aniversario amor mío',
    fechaEntrega: '2025-12-14',
    horaEntrega: '10:00',
    montoTotal: 35000,
    montoAbonado: 35000,
    estado: 'pagado',
    productos: [
      { nombre: 'Ramo Buchón Mediano', cantidad: 1, rosasUsadas: 30 }
    ],
    notas: ''
  },
  {
    id: '3',
    nombre: 'Carolina Soto',
    alias: 'Caro',
    telefono: '+56955555555',
    direccion: 'Pasaje Las Flores 89, Ñuñoa',
    redSocial: 'facebook',
    numeroPedido: 'P003',
    frasePersonalizada: 'Te amo infinito',
    fechaEntrega: '2025-12-16',
    horaEntrega: '18:00',
    montoTotal: 55000,
    montoAbonado: 0,
    estado: 'no_pagado',
    productos: [
      { nombre: 'Ramo Buchón Premium', cantidad: 1, rosasUsadas: 75 }
    ],
    notas: 'Cliente frecuente'
  },
  {
    id: '4',
    nombre: 'Pedro Martínez',
    alias: '',
    telefono: '+56911111111',
    direccion: 'Av. Providencia 2345, Las Condes',
    redSocial: 'tiktok',
    numeroPedido: 'P004',
    frasePersonalizada: 'Gracias por todo mamá',
    fechaEntrega: '2025-12-13',
    horaEntrega: '09:00',
    montoTotal: 40000,
    montoAbonado: 15000,
    estado: 'abono_pendiente',
    productos: [
      { nombre: 'Ramo Buchón Grande', cantidad: 1, rosasUsadas: 50 }
    ],
    notas: 'Pago el resto contra entrega'
  },
  {
    id: '5',
    nombre: 'Ana López',
    alias: 'Anita',
    telefono: '+56922222222',
    direccion: 'Calle Nueva 456, Vitacura',
    redSocial: 'instagram',
    numeroPedido: 'P005',
    frasePersonalizada: 'Eres mi persona favorita',
    fechaEntrega: '2025-12-17',
    horaEntrega: '16:00',
    montoTotal: 60000,
    montoAbonado: 60000,
    estado: 'pagado',
    productos: [
      { nombre: 'Ramo Buchón Premium', cantidad: 1, rosasUsadas: 75 },
      { nombre: 'Peluche', cantidad: 1, rosasUsadas: 0 }
    ],
    notas: 'Incluye tarjeta personalizada'
  }
];

export const redesSociales = [
  { id: 'whatsapp', nombre: 'WhatsApp', color: '#25D366' },
  { id: 'instagram', nombre: 'Instagram', color: '#E4405F' },
  { id: 'facebook', nombre: 'Facebook', color: '#1877F2' },
  { id: 'tiktok', nombre: 'TikTok', color: '#000000' },
  { id: 'otro', nombre: 'Otro', color: '#666666' },
];
