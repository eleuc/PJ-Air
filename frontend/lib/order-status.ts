export const ORDER_STATUSES = [
  'pending', 'production', 'ready', 'shipping', 'delivering', 'delivered', 'cancelled'
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

// This is language related. Should be closer to LanguageContext or wherever language stuff is.
export const STATUS_LABELS: Record<string, string> = {
  pending:    'Pedido',
  production: 'En Producción',
  ready:      'Finalizado',
  shipping:   'En camino',
  delivering: 'En Entrega',
  delivered:  'Entregado',
  cancelled:  'Cancelado',
};

// These are class styles. Should be in a stylesheet?
export const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-blue-50 text-blue-600 border-blue-100',
  production: 'bg-violet-50 text-violet-600 border-violet-100',
  ready:      'bg-teal-50 text-teal-600 border-teal-100',
  shipping:   'bg-orange-50 text-orange-600 border-orange-100',
  delivering: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  delivered:  'bg-green-50 text-green-600 border-green-100',
  cancelled:  'bg-red-50 text-red-600 border-red-100',
};

export const DEFAULT_STATUS_COLOR = 'bg-slate-50 text-slate-600 border-slate-100';

export const statusLabel = (status: string): string =>
  STATUS_LABELS[status] ?? `"${status}"`;
