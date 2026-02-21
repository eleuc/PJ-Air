'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Layers, Users, Truck, Bell, Settings, LogOut } from 'lucide-react';

const MENU_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Productos', icon: ShoppingBag, href: '/admin/products' },
    { name: 'Categorías', icon: Layers, href: '/admin/categories' },
    { name: 'Usuarios', icon: Users, href: '/admin/users' },
    { name: 'Rutas', icon: Truck, href: '/admin/routes' },
    { name: 'Notificaciones', icon: Bell, href: '/admin/notifications' },
    { name: 'Configuración', icon: Settings, href: '/admin/settings' },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-card border-r border-border flex flex-col h-screen h-full sticky top-0">
            <div className="p-6 border-b border-border">
                <Link href="/admin" className="text-xl font-bold text-primary flex items-center gap-2">
                    <span className="bg-primary text-white p-1 rounded-lg">PJ</span>
                    <span>Admin Panel</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {MENU_ITEMS.map(item => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-secondary hover:text-primary'}`}
                        >
                            <Icon size={20} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={20} />
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
}
