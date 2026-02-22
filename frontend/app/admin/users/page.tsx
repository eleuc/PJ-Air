'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { Users, Search, Loader2, AlertCircle, Shield, User, Mail, Phone } from 'lucide-react';
import { api } from '@/lib/api';

interface UserRecord {
    id: string;
    email: string;
    role: string;
    profile?: {
        full_name?: string;
        username?: string;
        phone?: string;
        avatar_url?: string;
    };
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/users')
            .then((data: any) => setUsers(Array.isArray(data) ? data : []))
            .catch((err: any) => setError(err.message || 'No se pudieron cargar los usuarios'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.profile?.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                        <p className="text-muted-foreground">{loading ? 'Cargando...' : `${users.length} usuarios registrados`}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-card p-4 rounded-2xl border border-border mb-6">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por email o nombre..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                        <Loader2 size={24} className="animate-spin text-primary" />
                        <span>Cargando usuarios...</span>
                    </div>
                )}

                {error && !loading && (
                    <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600">
                        <AlertCircle size={20} />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {!loading && !error && (
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Teléfono</th>
                                    <th className="px-6 py-4">Rol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {u.profile?.avatar_url ? (
                                                    <img src={u.profile.avatar_url} className="w-9 h-9 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                                        <User size={16} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-sm">{u.profile?.full_name || u.profile?.username || '—'}</p>
                                                    <p className="text-xs text-muted-foreground">{u.profile?.username || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail size={14} className="text-muted-foreground" />
                                                {u.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {u.profile?.phone ? (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} />
                                                    {u.profile.phone}
                                                </div>
                                            ) : '—'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                {u.role === 'admin' && <Shield size={12} />}
                                                {u.role || 'client'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">Sin resultados</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
