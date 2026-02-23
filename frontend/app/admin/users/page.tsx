'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import {
    Users, Search, Loader2, AlertCircle, Shield, User, Mail, Phone,
    CheckCircle2, X, MapPin, ShoppingBag, ChevronRight, Package, Clock
} from 'lucide-react';
import { api } from '@/lib/api';

interface Address { id: string; address: string; city: string; state?: string; zip_code?: string; country?: string; is_default?: boolean; }
interface OrderItem { 
    id: string; 
    quantity: number; 
    price_at_time: number; 
    product?: { name: string; description?: string; };
}
interface Order { id: string; total: number; status: string; created_at: string; delivery_date?: string; items?: OrderItem[]; }
interface UserRecord {
    id: string; email: string; role: string;
    profile?: { full_name?: string; username?: string; phone?: string; avatar_url?: string; };
    addresses?: Address[];
    orders?: Order[];
}

const ROLES = ['client', 'admin', 'delivery', 'produccion'];

const ROLE_STYLES: Record<string, string> = {
    admin:      'bg-primary/10 text-primary border-primary/20',
    delivery:   'bg-amber-50 text-amber-700 border-amber-200',
    produccion: 'bg-violet-50 text-violet-700 border-violet-200',
    client:     'bg-muted text-muted-foreground border-border',
};

const STATUS_COLORS: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [updatingRole, setUpdatingRole] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => { fetchUsers(); }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const fetchUsers = async () => {
        try {
            setLoading(true); setError(null);
            const data = await api.get('/users');
            setUsers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || 'No se pudieron cargar los usuarios');
        } finally { setLoading(false); }
    };

    const openUserDetail = async (user: UserRecord) => {
        setSelectedUser(user);
        // Reload full detail (includes orders and addresses)
        try {
            setLoadingDetail(true);
            const detail = await api.get(`/users/${user.id}`);
            setSelectedUser(detail);
        } catch { /* keep what we have */ }
        finally { setLoadingDetail(false); }
    };

    const handleRoleChange = async (userId: string, newRole: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setUpdatingRole(userId);
        try {
            await api.patch(`/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, role: newRole } : prev);
            showToast(`✅ Rol actualizado a "${newRole}"`);
        } catch (err: any) { showToast(`❌ ${err.message}`); }
        finally { setUpdatingRole(null); }
    };

    const filtered = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.profile?.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-muted/30">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                        <p className="text-muted-foreground">
                            {loading ? 'Cargando...' : `${users.length} usuario${users.length !== 1 ? 's' : ''} registrado${users.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-card p-4 rounded-2xl border border-border mb-6">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input type="text" placeholder="Buscar por email, nombre o usuario..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
                        <Loader2 size={24} className="animate-spin text-primary" /><span>Cargando usuarios...</span>
                    </div>
                )}
                {error && !loading && (
                    <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600">
                        <AlertCircle size={20} /><span className="font-medium">{error}</span>
                    </div>
                )}
                {!loading && !error && users.length === 0 && (
                    <div className="text-center py-20 bg-card rounded-2xl border border-border">
                        <Users size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                        <p className="font-medium text-muted-foreground">No hay usuarios registrados</p>
                    </div>
                )}

                {!loading && !error && users.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted text-muted-foreground text-xs uppercase font-bold">
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Teléfono</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Actividad</th>
                                    <th className="px-6 py-4 text-right">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => openUserDetail(u)}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {u.profile?.avatar_url ? (
                                                    <img src={u.profile.avatar_url} className="w-9 h-9 rounded-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"><User size={16} /></div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-sm">{u.profile?.full_name || u.profile?.username || '—'}</p>
                                                    <p className="text-xs text-muted-foreground">@{u.profile?.username || 'sin usuario'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail size={14} className="text-muted-foreground shrink-0" />{u.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {u.profile?.phone ? (
                                                <div className="flex items-center gap-2"><Phone size={14} />{u.profile.phone}</div>
                                            ) : '—'}
                                        </td>
                                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center gap-2">
                                                {updatingRole === u.id
                                                    ? <Loader2 size={16} className="animate-spin text-primary" />
                                                    : <Shield size={14} className={u.role === 'admin' ? 'text-primary' : 'text-muted-foreground'} />}
                                                <select
                                                    value={u.role || 'client'}
                                                    disabled={updatingRole === u.id}
                                                    onChange={e => handleRoleChange(u.id, e.target.value, e as any)}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-all disabled:opacity-60 ${ROLE_STYLES[u.role] || ROLE_STYLES.client}`}
                                                >
                                                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4 text-xs font-bold">
                                                <div className="flex items-center gap-1.5 text-slate-500" title="Direcciones">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    {u.addresses?.length || 0}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500" title="Pedidos">
                                                    <ShoppingBag size={14} className="text-slate-400" />
                                                    {u.orders?.length || 0}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight size={18} className="ml-auto text-muted-foreground" />
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Sin resultados para "{search}"</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Detail slide-over */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
                    {/* Panel */}
                    <aside className="w-full max-w-lg bg-background shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                {selectedUser.profile?.avatar_url ? (
                                    <img src={selectedUser.profile.avatar_url} className="w-12 h-12 rounded-full object-cover" alt="" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                                        {(selectedUser.profile?.full_name || selectedUser.email)?.[0]?.toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-lg leading-tight">{selectedUser.profile?.full_name || selectedUser.profile?.username || 'Sin nombre'}</p>
                                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-muted rounded-full"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {loadingDetail && (
                                <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary" /></div>
                            )}

                            {/* Profile info */}
                            <section>
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Información Personal</h3>
                                <div className="bg-muted/40 rounded-2xl p-5 space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-mono text-xs">{selectedUser.id.slice(0, 16)}…</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{selectedUser.email}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Usuario</span><span>@{selectedUser.profile?.username || '—'}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">Teléfono</span><span>{selectedUser.profile?.phone || '—'}</span></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Rol</span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${ROLE_STYLES[selectedUser.role] || ROLE_STYLES.client}`}>
                                            {selectedUser.role?.charAt(0).toUpperCase()}{selectedUser.role?.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Addresses */}
                            <section>
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                    <MapPin size={14} />Direcciones ({selectedUser.addresses?.length || 0})
                                </h3>
                                {!selectedUser.addresses?.length ? (
                                    <p className="text-sm text-muted-foreground italic">Sin direcciones guardadas.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedUser.addresses.map(addr => (
                                            <div key={addr.id} className="bg-muted/40 rounded-2xl p-4 text-sm">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-semibold">{addr.address}</p>
                                                    {addr.is_default && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Principal</span>}
                                                </div>
                                                <p className="text-muted-foreground">{[addr.city, addr.state, addr.zip_code, addr.country].filter(Boolean).join(', ')}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Orders */}
                            <section>
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                    <ShoppingBag size={14} />Pedidos ({selectedUser.orders?.length || 0})
                                </h3>
                                {!selectedUser.orders?.length ? (
                                    <p className="text-sm text-muted-foreground italic">Sin pedidos registrados.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedUser.orders.slice().reverse().map(order => (
                                            <div key={order.id} className="bg-muted/40 rounded-2xl p-4 text-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                                        <Clock size={12} />
                                                        <span className="text-xs">{new Date(order.created_at).toLocaleDateString('es')}</span>
                                                    </div>
                                                    <span className="font-bold text-primary">${Number(order.total || 0).toFixed(2)}</span>
                                                </div>
                                                {order.items && order.items.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                                                        {order.items.map(item => (
                                                            <div key={item.id} className="flex flex-col gap-1 py-1 border-b border-border/10 last:border-0">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex flex-col flex-1">
                                                                        <span className="font-semibold text-foreground text-xs">{item.quantity} x {item.product?.name || 'Producto'}</span>
                                                                        {item.product?.description && (
                                                                            <span className="text-[10px] text-muted-foreground italic line-clamp-2 mt-0.5 leading-tight">{item.product.description}</span>
                                                                        )}
                                                                    </div>
                                                                    <span className="font-bold text-primary text-xs ml-4">
                                                                        ${((Number(item.price_at_time) || 0) * (Number(item.quantity) || 0)).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>
                    </aside>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl bg-green-600 text-white font-semibold text-sm animate-fade-in">
                    <CheckCircle2 size={20} />{toast}
                </div>
            )}
        </div>
    );
}
