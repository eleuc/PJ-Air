'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { User, MapPin, Mail, Phone, BadgeCheck, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        phone: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                const userData = await api.get(`/users/${user.id}`);
                setProfile(userData.profile);
                setAddresses(userData.addresses || []);
                setFormData({
                    full_name: userData.profile?.full_name || '',
                    username: userData.profile?.username || '',
                    phone: userData.profile?.phone || ''
                });
            } catch (err) {
                console.error('Error fetching user data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user, router]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/${user.id}/avatar`, {
                method: 'POST',
                body: uploadData,
            });
            
            if (response.ok) {
                const updatedProfile = await response.json();
                setProfile(updatedProfile);
                setMessage({ type: 'success', text: 'Imagen de perfil actualizada' });
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Upload failed:', response.status, errorData);
                throw new Error(errorData.message || `Error ${response.status} al subir la imagen`);
            }
        } catch (err) {
            console.error('Error uploading avatar:', err);
            setMessage({ type: 'error', text: 'Error al subir la imagen' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await api.patch(`/users/${user.id}/profile`, formData);
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta dirección?')) return;
        try {
            await api.delete(`/addresses/${id}`);
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error deleting address:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-primary mb-4" size={40} />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cargando tu perfil...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card rounded-[32px] border border-border overflow-hidden shadow-sm">
                            <div className="jhoanes-gradient p-8 text-white flex flex-col items-center">
                                <div 
                                    className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 mb-4 backdrop-blur-md overflow-hidden cursor-pointer relative group"
                                    onClick={() => document.getElementById('avatar-input')?.click()}
                                >
                                    {profile?.avatar_url ? (
                                        <img 
                                            src={profile.avatar_url} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={48} />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus size={24} />
                                    </div>
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Loader2 size={24} className="animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <input 
                                    id="avatar-input"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                                <h2 className="text-xl font-bold font-serif">{formData.full_name || 'Usuario'}</h2>
                                <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Cliente Miembro</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Mail size={16} className="text-primary" />
                                    <span className="truncate">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <BadgeCheck size={16} className="text-primary" />
                                    <span>Cuenta Verificada</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => router.push('/profile/addresses/new')}
                            className="w-full premium-button bg-white text-primary border-2 border-primary/10 py-4 hover:bg-primary/5 shadow-none flex items-center justify-center gap-2 group"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Agregar Dirección
                        </button>
                    </div>

                    {/* Editor Section */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Editor */}
                        <div className="bg-card rounded-[32px] border border-border p-8 shadow-sm">
                            <h3 className="text-xl font-bold font-serif mb-8 flex items-center gap-2">
                                <User className="text-primary" size={24} /> Editar Información
                            </h3>

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                {message.text && (
                                    <div className={`p-4 rounded-2xl text-xs font-bold text-center animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                        {message.text}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-widest">Nombre Completo</label>
                                        <input 
                                            type="text"
                                            className="premium-input px-6 h-14 font-bold"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-widest">Nombre de Usuario</label>
                                        <input 
                                            type="text"
                                            className="premium-input px-6 h-14 font-bold"
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-widest">Teléfono de Contacto</label>
                                    <div className="relative">
                                        <input 
                                            type="tel"
                                            className="premium-input px-6 h-14 font-bold pl-12"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            required
                                        />
                                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    </div>
                                </div>

                                <button 
                                    disabled={isSaving}
                                    className="w-full premium-button jhoanes-gradient text-white py-4 shadow-xl flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Guardar Cambios</>}
                                </button>
                            </form>
                        </div>

                        {/* Saved Addresses */}
                        <div className="bg-card rounded-[32px] border border-border p-8 shadow-sm">
                            <h3 className="text-xl font-bold font-serif mb-8 flex items-center gap-2">
                                <MapPin className="text-primary" size={24} /> Mis Direcciones Guardadas
                            </h3>

                            <div className="space-y-4">
                                {addresses.length > 0 ? (
                                    addresses.map((addr) => (
                                        <div key={addr.id} className="p-6 bg-white border border-border rounded-2xl flex justify-between items-start hover:border-primary/30 hover:shadow-md transition-all group">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                    <MapPin size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm uppercase tracking-tight mb-1">{addr.alias}</h4>
                                                    <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">{addr.address}</p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-[8px] font-black uppercase tracking-widest bg-secondary text-primary px-2 py-0.5 rounded-full">Zona {addr.zone}</span>
                                                        {addr.is_default && <span className="text-[8px] font-black uppercase tracking-widest bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">Predeterminada</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                title="Eliminar dirección"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center bg-muted/20 rounded-3xl border border-dashed border-border/40">
                                        <p className="text-sm text-muted-foreground">No tienes direcciones guardadas todavía.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
