const en = {
  // ── Navbar ──────────────────────────────────────────────────────────────────
  nav: {
    catalog: 'Catalog',
    orders: 'Orders',
    map: 'Map',
    myOrders: 'My Orders',
    myProfile: 'My Profile',
    zoneMap: 'Zone Map',
    login: 'Sign In',
    register: 'Sign Up',
    logout: 'Sign Out',
    menu: 'Menu',
    general: 'General',
    administration: 'Administration',
    adminPanel: 'Admin Panel',
    products: 'Products',
    categories: 'Categories',
    adminOrders: 'Admin Orders',
    users: 'Users',
    deliveries: 'Deliveries',
    orderSystem: 'Order System',
  },

  // ── Home / Catalog ──────────────────────────────────────────────────────────
  catalog: {
    loading: 'Loading delights...',
    searchPlaceholder: 'Search product...',
    allCategories: 'All',
    addToOrder: 'Add to Order',
    added: 'Added!',
    inCart: 'In Cart',
    price: 'Price',
    quantity: 'Qty',
    noProducts: 'No products found.',
  },

  // ── Product Card / Detail ───────────────────────────────────────────────────
  product: {
    addToOrder: 'Add to Order',
    added: 'Added!',
    inCart: 'In Cart',
    price: 'Price',
    quantity: 'Qty',
  },

  // ── Auth – Login ────────────────────────────────────────────────────────────
  login: {
    title: 'Welcome Back',
    subtitle: 'Fresh delights are waiting for you',
    emailOrUser: 'Email or Username',
    password: 'Password',
    submit: 'Sign In',
    loading: 'Signing in...',
    noAccount: "Don't have an account yet?",
    registerNow: 'Sign up now',
    forgotPassword: 'Forgot your password?',
    errorDefault: 'Error signing in',
  },

  // ── Auth – Register ─────────────────────────────────────────────────────────
  register: {
    title: 'Join Jhoanes',
    subtitle: 'Create your account to manage your custom orders',
    fullName: 'Full Name',
    username: 'Username',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    submit: 'Create Account',
    loading: 'Creating account...',
    alreadyMember: 'Already a member?',
    loginHere: 'Sign in here',
    forgotPassword: 'Forgot your password?',
    passwordMismatch: 'Passwords do not match',
    invalidEmail: 'Please enter a valid email address (e.g. user@example.com)',
    errorDefault: 'Error creating account',
  },

  // ── Auth – Forgot Password ──────────────────────────────────────────────────
  forgotPassword: {
    title: 'Recover Access',
    subtitle: 'Enter your email or username and we will send your password to your email.',
    emailOrUser: 'Email or Username',
    submit: 'Send Password',
    loading: 'Sending...',
    backToLogin: 'Back to Login',
    successLink: 'Back to Home',
  },

  // ── Profile ─────────────────────────────────────────────────────────────────
  profile: {
    title: 'My Profile',
    subtitle: 'Manage your personal information',
    fullName: 'Full Name',
    username: 'Username',
    phone: 'Phone',
    email: 'Email (read only)',
    save: 'Save Changes',
    saving: 'Saving...',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    updatePassword: 'Update Password',
    addresses: 'My Addresses',
    addAddress: 'Add Address',
    savedSuccess: 'Profile updated successfully',
    passwordSuccess: 'Password updated successfully',
    passwordMismatch: 'New passwords do not match',
    passwordError: 'Error updating password',
  },

  // ── Orders ──────────────────────────────────────────────────────────────────
  orders: {
    title: 'My Orders',
    subtitle: 'Track and manage your orders',
    empty: 'You have no orders yet',
    status: 'Status',
    date: 'Date',
    total: 'Total',
    items: 'Items',
    viewDetail: 'View Detail',
    pending: 'Pending',
    preparing: 'Preparing',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  },

  // ── Checkout ────────────────────────────────────────────────────────────────
  checkout: {
    title: 'Your Order',
    empty: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    total: 'Total',
    placeOrder: 'Place Order',
    placing: 'Placing order...',
    selectAddress: 'Select delivery address',
    notes: 'Order notes (optional)',
    successTitle: 'Order placed!',
    successMsg: 'Your order has been received successfully.',
  },

  // ── Admin – Dashboard ───────────────────────────────────────────────────────
  admin: {
    dashboardTitle: 'Administration Panel',
    dashboardSubtitle: 'Welcome to the Jhoanes Bakery control panel.',
    products: 'Products',
    categories: 'Categories',
    users: 'Users',
    orders: 'Orders',
    quickAccess: 'Quick Access',
    addProduct: 'Add new product',
    viewCategories: 'View categories',
    manageUsers: 'Manage users',
    statsComingSoon: 'Statistics coming soon',
    statsDesc: 'Real-time sales metrics will be available here.',
  },

  // ── Admin – Settings ────────────────────────────────────────────────────────
  adminSettings: {
    title: 'Settings',
    subtitle: 'Manage administrative panel preferences',
    notifications: 'Push Notifications',
    notificationsDesc: 'Define which events trigger alerts on your devices',
    alertEvents: 'Alert Events',
    newOrders: 'New Orders',
    newOrdersDesc: 'Notify instantly when a purchase is received',
    delivered: 'Delivered Orders',
    deliveredDesc: 'Delivery confirmation from the courier',
    paid: 'Paid Orders',
    paidDesc: 'Alert when an order payment is confirmed',
    frequency: 'Send Frequency',
    realtime: 'Real Time',
    realtimeLabel: 'Lightning Mode',
    realtimeDesc: 'Instant notifications for every registered event.',
    consolidated: 'Daily Summary',
    consolidatedLabel: 'Summary Mode',
    consolidatedDesc: 'Receive a single daily report with all orders.',
    scheduledTime: 'Scheduled send time',
    save: 'Save Preferences',
    saving: 'Saving...',
    savedOk: '✅ Settings saved successfully',
    savedError: '❌ Error saving settings',
    language: 'Language',
    languageDesc: 'Set the default language for all users',
    defaultLanguage: 'Default Language',
    english: 'English',
    spanish: 'Spanish',
  },

  // ── Admin – Sidebar ─────────────────────────────────────────────────────────
  adminSidebar: {
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    users: 'Users',
    routes: 'Routes',
    orders: 'Orders',
    settings: 'Settings',
    logout: 'Sign Out',
  },

  // ── Map ──────────────────────────────────────────────────────────────────────
  map: {
    title: 'Delivery Zone Map',
    subtitle: 'Check if we deliver to your area',
  },

  // ── Common ───────────────────────────────────────────────────────────────────
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    back: 'Back',
    close: 'Close',
    search: 'Search',
    language: 'Language',
  },
};

export default en;
export type Translations = typeof en;
