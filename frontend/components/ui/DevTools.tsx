'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Terminal, Github, Key, MapPin, Database, Zap, User } from 'lucide-react';

export default function DevTools() {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState<string>('');

    const testPing = async () => {
        setStatus('Pinging backend...');
        try {
            const res = await fetch('http://localhost:3001/api'); // Base backend URL
            if (res.ok) setStatus('Pong! Backend is alive.');
            else setStatus('Error: Backend returned ' + res.status);
        } catch (e) {
            setStatus('Error connecting to backend: ' + (e as any).message);
        }
    };

    const testAuthDebug = async () => {
        setStatus('Checking Supabase Auth...');
        const { data, error } = await supabase.auth.getSession();
        if (error) setStatus('Auth Error: ' + error.message);
        else setStatus('Auth Success: ' + JSON.stringify(data.session?.user?.email || 'No user logged in'));
    };

    const createTestAddress = async () => {
        setStatus('Testing Address Creation...');
        // Mock call
        setStatus('Simulated address creation for testing.');
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-2xl z-50 hover:bg-accent transition-colors"
            >
                <Terminal size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-fade-in">
            {/* Header */}
            <div className="bg-primary p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold">
                    <Terminal size={20} />
                    <span>Dev Tools</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white text-xl">&times;</button>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 overflow-y-auto space-y-6">
                {/* User Status */}
                <section className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <User size={14} /> Usuario Conectado
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold shadow-md">A</div>
                        <div>
                            <p className="text-xs font-bold text-foreground">Admin Jhoanes</p>
                            <p className="text-[10px] text-muted-foreground mt-1 font-medium">Rol: <span className="text-primary">Administrador</span></p>
                        </div>
                    </div>
                </section>

                {/* Session Debugger */}
                <section>
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Zap size={14} /> Session Debugger
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                        <button onClick={testPing} className="flex items-center gap-3 px-4 py-3 bg-muted hover:bg-border rounded-xl text-xs font-bold transition-all border border-transparent hover:border-primary/20 group">
                            <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" /> 🏓 Test Ping (No Auth)
                        </button>
                        <button onClick={testAuthDebug} className="flex items-center gap-3 px-4 py-3 bg-muted hover:bg-border rounded-xl text-xs font-bold transition-all border border-transparent hover:border-primary/20 group">
                            <div className="w-2 h-2 rounded-full bg-orange-500 group-hover:scale-125 transition-transform" /> 🔍 Test Auth Debug
                        </button>
                        <button onClick={createTestAddress} className="flex items-center gap-3 px-4 py-3 bg-muted hover:bg-border rounded-xl text-xs font-bold transition-all border border-transparent hover:border-primary/20 group">
                            <div className="w-2 h-2 rounded-full bg-green-500 group-hover:scale-125 transition-transform" /> 🧪 Test Create Address
                        </button>
                    </div>
                </section>

                {/* Github Commit */}
                <section>
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Github size={14} /> Github Commit
                    </h3>
                    <div className="space-y-2">
                        <input type="text" placeholder="Nombre del Commit..." className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-xs outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium" />
                        <button className="w-full py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors shadow-lg shadow-black/10">Realizar Commit</button>
                    </div>
                </section>

                {/* Console Output */}
                <section>
                    <div className="bg-zinc-950 p-4 rounded-[20px] text-[10px] font-mono text-emerald-400 overflow-x-auto border border-white/5 relative group">
                        <div className="flex items-center justify-between mb-2 opacity-50">
                            <span className="font-bold">CONSOLE_OUTPUT_V1.0</span>
                            <button onClick={() => setStatus('')} className="hover:text-white transition-colors">Clear</button>
                        </div>
                        <pre className="whitespace-pre-wrap leading-normal">{status || '> System ready for debugging...'}</pre>
                    </div>
                </section>

                {/* Product Upload Utility */}
                <section>
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Database size={14} /> Carga de Productos
                    </h3>
                    <div className="space-y-4 bg-muted/60 p-6 rounded-3xl border border-border/50">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Archivo CSV (Data)</label>
                            <input type="file" accept=".csv" className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-black file:bg-primary file:text-white hover:file:bg-black transition-all cursor-pointer" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Archivo ZIP (Imágenes)</label>
                            <input type="file" accept=".zip" className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[9px] file:font-black file:bg-accent file:text-white hover:file:bg-black transition-all cursor-pointer" />
                        </div>
                        <button className="w-full py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                            Procesar y Descomprimir
                        </button>
                    </div>
                </section>

                {/* Credentials */}
                <section className="pb-10">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Key size={14} /> APIKeys y Accesos
                    </h3>
                    <div className="space-y-2">
                        <div className="bg-muted p-3 rounded-xl">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Google Maps</p>
                            <p className="text-[10px] break-all font-mono opacity-60">AIzaSyCMfa...UuEwWBc-k</p>
                        </div>
                        <div className="bg-muted p-3 rounded-xl">
                            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Supabase Project</p>
                            <p className="text-[10px] break-all font-mono opacity-60">jdeojeykyapjhvkhrxnc</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
