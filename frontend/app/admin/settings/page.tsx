'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { 
    Bell, Save, Loader2, CheckCircle2, AlertCircle, 
    Clock, Zap, Calendar, Globe
} from 'lucide-react';
import { useLanguage, type Locale } from '@/context/LanguageContext';

export default function AdminSettingsPage() {
    const { t, setDefaultLocale, defaultLocale } = useLanguage();
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [settings, setSettings] = useState({
        pushNewOrder: true,
        pushDelivered: true,
        pushPaid: true,
        type: 'realtime',
        consolidatedTime: '20:00'
    });
    const [selectedDefault, setSelectedDefault] = useState<Locale>(defaultLocale);

    useEffect(() => {
        const saved = localStorage.getItem('admin_notification_settings');
        if (saved) setSettings(JSON.parse(saved));
    }, []);

    // Keep selectedDefault in sync if defaultLocale changes externally
    useEffect(() => {
        setSelectedDefault(defaultLocale);
    }, [defaultLocale]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            localStorage.setItem('admin_notification_settings', JSON.stringify(settings));
            // Apply the chosen default language for all users
            setDefaultLocale(selectedDefault);
            await new Promise(r => setTimeout(r, 600));
            showToast(t.adminSettings.savedOk);
        } catch {
            showToast(t.adminSettings.savedError, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-muted/30 font-sans">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-black mb-1 text-slate-800">{t.adminSettings.title}</h1>
                    <p className="text-muted-foreground font-medium">{t.adminSettings.subtitle}</p>
                </header>

                <div className="max-w-4xl space-y-8">

                    {/* ── Language Section ───────────────────────────────────── */}
                    <section className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-border bg-slate-50/50 flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h2 className="font-black text-slate-800 text-xl leading-none mb-1">{t.adminSettings.language}</h2>
                                <p className="text-sm text-muted-foreground">{t.adminSettings.languageDesc}</p>
                            </div>
                        </div>

                        <div className="p-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">{t.adminSettings.defaultLanguage}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {(['en', 'es'] as Locale[]).map(loc => {
                                    const label = loc === 'en' ? `🇺🇸 ${t.adminSettings.english}` : `🇪🇸 ${t.adminSettings.spanish}`;
                                    const isSelected = selectedDefault === loc;
                                    return (
                                        <button
                                            key={loc}
                                            onClick={() => setSelectedDefault(loc)}
                                            className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-start gap-3 ${
                                                isSelected
                                                    ? 'bg-primary/5 border-primary shadow-xl shadow-primary/10'
                                                    : 'bg-white border-slate-100 hover:border-slate-200'
                                            }`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${isSelected ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-100'}`}>
                                                {loc === 'en' ? '🇺🇸' : '🇪🇸'}
                                            </div>
                                            <div>
                                                <p className={`font-black uppercase tracking-widest text-[10px] mb-1 ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                                                    {loc === 'en' ? 'Default' : 'Predeterminado'}
                                                </p>
                                                <p className="font-bold text-slate-800 text-lg">{loc === 'en' ? t.adminSettings.english : t.adminSettings.spanish}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* ── Notifications Section ──────────────────────────────── */}
                    <section className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-border bg-slate-50/50 flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h2 className="font-black text-slate-800 text-xl leading-none mb-1">{t.adminSettings.notifications}</h2>
                                <p className="text-sm text-muted-foreground">{t.adminSettings.notificationsDesc}</p>
                            </div>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.adminSettings.alertEvents}</h3>
                                
                                <label className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl cursor-pointer group hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <Zap size={18} className="text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{t.adminSettings.newOrders}</p>
                                            <p className="text-xs text-muted-foreground">{t.adminSettings.newOrdersDesc}</p>
                                        </div>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.pushNewOrder}
                                        onChange={e => setSettings({...settings, pushNewOrder: e.target.checked})}
                                        className="w-6 h-6 rounded-lg border-slate-300 text-primary focus:ring-primary accent-primary"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl cursor-pointer group hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <CheckCircle2 size={18} className="text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{t.adminSettings.delivered}</p>
                                            <p className="text-xs text-muted-foreground">{t.adminSettings.deliveredDesc}</p>
                                        </div>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.pushDelivered}
                                        onChange={e => setSettings({...settings, pushDelivered: e.target.checked})}
                                        className="w-6 h-6 rounded-lg border-slate-300 text-primary focus:ring-primary accent-primary"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl cursor-pointer group hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <Calendar size={18} className="text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{t.adminSettings.paid}</p>
                                            <p className="text-xs text-muted-foreground">{t.adminSettings.paidDesc}</p>
                                        </div>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.pushPaid}
                                        onChange={e => setSettings({...settings, pushPaid: e.target.checked})}
                                        className="w-6 h-6 rounded-lg border-slate-300 text-primary focus:ring-primary accent-primary"
                                    />
                                </label>
                            </div>

                            <div className="pt-10 border-t border-slate-100 space-y-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t.adminSettings.frequency}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setSettings({...settings, type: 'realtime'})}
                                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-start gap-4 ${settings.type === 'realtime' ? 'bg-primary/5 border-primary shadow-xl shadow-primary/10' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${settings.type === 'realtime' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400'}`}>
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <p className={`font-black uppercase tracking-widest text-[10px] ${settings.type === 'realtime' ? 'text-primary' : 'text-slate-400'}`}>{t.adminSettings.realtimeLabel}</p>
                                            <p className="font-bold text-slate-800 text-lg">{t.adminSettings.realtime}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{t.adminSettings.realtimeDesc}</p>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => setSettings({...settings, type: 'consolidated'})}
                                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-start gap-4 ${settings.type === 'consolidated' ? 'bg-amber-500/5 border-amber-500 shadow-xl shadow-amber-500/10' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${settings.type === 'consolidated' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-100 text-slate-400'}`}>
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <p className={`font-black uppercase tracking-widest text-[10px] ${settings.type === 'consolidated' ? 'text-amber-600' : 'text-slate-400'}`}>{t.adminSettings.consolidatedLabel}</p>
                                            <p className="font-bold text-slate-800 text-lg">{t.adminSettings.consolidated}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{t.adminSettings.consolidatedDesc}</p>
                                        </div>
                                    </button>
                                </div>

                                {settings.type === 'consolidated' && (
                                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 animate-in zoom-in-95 duration-300">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
                                            <Clock size={12} /> {t.adminSettings.scheduledTime}
                                        </p>
                                        <input 
                                            type="time" 
                                            value={settings.consolidatedTime}
                                            onChange={e => setSettings({...settings, consolidatedTime: e.target.value})}
                                            className="bg-white border-2 border-amber-200 rounded-2xl px-6 py-3 text-lg font-black text-slate-800 outline-none focus:border-amber-500 transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-border flex justify-end">
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="px-10 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/30 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saving ? t.adminSettings.saving : t.adminSettings.save}
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {/* Notification Toast */}
            {toast && (
                <div className={`fixed bottom-10 right-10 z-[100] flex items-center gap-4 px-6 py-5 rounded-[2rem] shadow-2xl text-white font-black tracking-tight text-sm animate-in slide-in-from-bottom duration-300 ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/20' : 'bg-green-500 shadow-green-500/20'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
