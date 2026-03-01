import type { Translations } from './en';

const es: Translations = {
  // ── Navbar ──────────────────────────────────────────────────────────────────
  nav: {
    catalog: 'Catálogo',
    orders: 'Pedidos',
    map: 'Mapa',
    myOrders: 'Mis Pedidos',
    myProfile: 'Mi Perfil',
    zoneMap: 'Mapa de Zonas',
    login: 'Ingresar',
    register: 'Registro',
    logout: 'Cerrar Sesión',
    menu: 'Menú',
    general: 'General',
    administration: 'Administración',
    adminPanel: 'Panel Admin',
    products: 'Productos',
    categories: 'Categorías',
    adminOrders: 'Pedidos Admin',
    users: 'Usuarios',
    deliveries: 'Deliveries',
    orderSystem: 'Sistema de Pedidos',
  },

  // ── Home / Catalog ──────────────────────────────────────────────────────────
  catalog: {
    loading: 'Cargando delicias...',
    searchPlaceholder: 'Buscar producto...',
    allCategories: 'Todos',
    addToOrder: 'Añadir al Pedido',
    added: '¡Agregado!',
    inCart: 'En Carrito',
    price: 'Precio',
    quantity: 'Cantidad',
    noProducts: 'No se encontraron productos.',
  },

  // ── Product Card / Detail ───────────────────────────────────────────────────
  product: {
    addToOrder: 'Añadir al Pedido',
    added: '¡Agregado!',
    inCart: 'En Carrito',
    price: 'Precio',
    quantity: 'Cantidad',
  },

  // ── Auth – Login ────────────────────────────────────────────────────────────
  login: {
    title: 'Bienvenido de nuevo',
    subtitle: 'Delicias frescas te están esperando',
    emailOrUser: 'Email o Usuario',
    password: 'Contraseña',
    submit: 'Iniciar Sesión',
    loading: 'Ingresando...',
    noAccount: '¿No tienes cuenta aún?',
    registerNow: 'Regístrate ahora',
    forgotPassword: '¿Olvidaste tu contraseña?',
    errorDefault: 'Error al iniciar sesión',
  },

  // ── Auth – Register ─────────────────────────────────────────────────────────
  register: {
    title: 'Únete a Jhoanes',
    subtitle: 'Crea tu cuenta para gestionar tus pedidos personalizados',
    fullName: 'Nombre Completo',
    username: 'Nombre de Usuario',
    email: 'Correo Electrónico',
    phone: 'Teléfono',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    submit: 'Crear Cuenta',
    loading: 'Creando cuenta...',
    alreadyMember: '¿Ya eres parte de Jhoanes?',
    loginHere: 'Inicia sesión aquí',
    forgotPassword: '¿Olvidaste tu contraseña?',
    passwordMismatch: 'Las contraseñas no coinciden',
    invalidEmail: 'Por favor, ingresa un correo electrónico válido (ej: usuario@ejemplo.com)',
    errorDefault: 'Error al crear la cuenta',
  },

  // ── Auth – Forgot Password ──────────────────────────────────────────────────
  forgotPassword: {
    title: 'Recuperar Acceso',
    subtitle: 'Ingresa tu correo o nombre de usuario y te enviaremos tu clave directamente a tu email.',
    emailOrUser: 'Email o Usuario',
    submit: 'Enviar Contraseña',
    loading: 'Enviando...',
    backToLogin: 'Regresar al Login',
    successLink: 'Volver al Inicio',
  },

  // ── Profile ─────────────────────────────────────────────────────────────────
  profile: {
    title: 'Mi Perfil',
    subtitle: 'Gestiona tu información personal',
    fullName: 'Nombre Completo',
    username: 'Nombre de Usuario',
    phone: 'Teléfono',
    email: 'Email (solo lectura)',
    save: 'Guardar Cambios',
    saving: 'Guardando...',
    changePassword: 'Cambiar Contraseña',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    confirmPassword: 'Confirmar Nueva Contraseña',
    updatePassword: 'Actualizar Contraseña',
    addresses: 'Mis Direcciones',
    addAddress: 'Agregar Dirección',
    savedSuccess: 'Perfil actualizado correctamente',
    passwordSuccess: 'Contraseña actualizada correctamente',
    passwordMismatch: 'Las nuevas contraseñas no coinciden',
    passwordError: 'Error al actualizar la contraseña',
  },

  // ── Orders ──────────────────────────────────────────────────────────────────
  orders: {
    title: 'Mis Pedidos',
    subtitle: 'Rastrea y gestiona tus pedidos',
    empty: 'Aún no tienes pedidos',
    status: 'Estado',
    date: 'Fecha',
    total: 'Total',
    items: 'Artículos',
    viewDetail: 'Ver Detalle',
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  },

  // ── Checkout ────────────────────────────────────────────────────────────────
  checkout: {
    title: 'Tu Pedido',
    empty: 'Tu carrito está vacío',
    continueShopping: 'Continuar Comprando',
    subtotal: 'Subtotal',
    delivery: 'Entrega',
    total: 'Total',
    placeOrder: 'Realizar Pedido',
    placing: 'Realizando pedido...',
    selectAddress: 'Seleccionar dirección de entrega',
    notes: 'Notas del pedido (opcional)',
    successTitle: '¡Pedido realizado!',
    successMsg: 'Tu pedido ha sido recibido correctamente.',
  },

  // ── Admin – Dashboard ───────────────────────────────────────────────────────
  admin: {
    dashboardTitle: 'Panel de Administración',
    dashboardSubtitle: 'Bienvenido al panel de control de Panadería Jhoanes.',
    products: 'Productos',
    categories: 'Categorías',
    users: 'Usuarios',
    orders: 'Pedidos',
    quickAccess: 'Accesos Rápidos',
    addProduct: 'Añadir nuevo producto',
    viewCategories: 'Ver categorías',
    manageUsers: 'Gestionar usuarios',
    statsComingSoon: 'Estadísticas próximamente',
    statsDesc: 'Las métricas de ventas y pedidos en tiempo real estarán disponibles aquí.',
  },

  // ── Admin – Settings ────────────────────────────────────────────────────────
  adminSettings: {
    title: 'Configuración',
    subtitle: 'Gestiona las preferencias del panel administrativo',
    notifications: 'Notificaciones Push',
    notificationsDesc: 'Define qué eventos disparan alertas en tus dispositivos',
    alertEvents: 'Eventos de Alerta',
    newOrders: 'Nuevos Pedidos',
    newOrdersDesc: 'Notificar instantáneamente al recibir una compra',
    delivered: 'Pedidos Entregados',
    deliveredDesc: 'Confirmación de entrega por parte del repartidor',
    paid: 'Pedidos Pagados',
    paidDesc: 'Aviso cuando se confirma el pago de una orden',
    frequency: 'Frecuencia de Envío',
    realtime: 'Tiempo Real',
    realtimeLabel: 'Modo Rayo',
    realtimeDesc: 'Notificaciones instantáneas por cada evento registrado.',
    consolidated: 'Consolidado Diario',
    consolidatedLabel: 'Modo Resumen',
    consolidatedDesc: 'Recibe un reporte único con todos los pedidos del día.',
    scheduledTime: 'Hora del envío programado',
    save: 'Guardar Preferencias',
    saving: 'Guardando...',
    savedOk: '✅ Configuración guardada correctamente',
    savedError: '❌ Error al guardar la configuración',
    language: 'Idioma',
    languageDesc: 'Establece el idioma predeterminado para todos los usuarios',
    defaultLanguage: 'Idioma Predeterminado',
    english: 'Inglés',
    spanish: 'Español',
  },

  // ── Admin – Sidebar ─────────────────────────────────────────────────────────
  adminSidebar: {
    dashboard: 'Dashboard',
    products: 'Productos',
    categories: 'Categorías',
    users: 'Usuarios',
    routes: 'Rutas',
    orders: 'Pedidos',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
  },

  // ── Map ──────────────────────────────────────────────────────────────────────
  map: {
    title: 'Mapa de Zonas de Entrega',
    subtitle: 'Consulta si realizamos entregas en tu área',
  },

  // ── Common ───────────────────────────────────────────────────────────────────
  common: {
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    confirm: 'Confirmar',
    back: 'Volver',
    close: 'Cerrar',
    search: 'Buscar',
    language: 'Idioma',
  },
};

export default es;
