'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, ChevronRight, Navigation, Loader2, Map as MapIcon, RotateCcw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const ZONES = ['Norte', 'Sur', 'Este', 'Oeste', 'Centro'];

const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '24px'
};

const centerNY = {
    lat: 40.7128,
    lng: -74.0060
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
        }
    ]
};

export default function NewAddressPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [alias, setAlias] = useState('');
    const [zone, setZone] = useState('');
    const [notes, setNotes] = useState('');
    const [markerPos, setMarkerPos] = useState(centerNY);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
            setMarkerPos(newPos);
            reverseGeocode(newPos);
        }
    }, []);

    const reverseGeocode = (pos: { lat: number, lng: number }) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                setAddress(results[0].formatted_address);
            }
        });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // After adding address, go to catalog
        setTimeout(() => {
            setIsLoading(false);
            router.push('/catalog');
        }, 1200);
    };

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12 animate-fade-in text-foreground">
                <div className="bg-card rounded-[40px] border border-border shadow-premium overflow-hidden">
                    <div className="jhoanes-gradient p-12 text-white">
                        <h1 className="text-4xl font-black font-serif mb-2 tracking-tighter">Agrega tu dirección</h1>
                        <p className="text-white/80 font-medium">Sitúa el marcador en el punto exacto de entrega</p>
                    </div>

                    <form onSubmit={handleSave} className="p-12 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-widest">Nombre (Alias)</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ej: Mi Casa, Oficina"
                                    className="premium-input px-6 py-4 font-bold"
                                    value={alias}
                                    onChange={(e) => setAlias(e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-widest">Zona de Entrega</label>
                                <select
                                    required
                                    className="premium-input px-6 py-4 font-bold appearance-none"
                                    value={zone}
                                    onChange={(e) => setZone(e.target.value)}
                                >
                                    <option value="">Selecciona una zona</option>
                                    {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-widest">Dirección Completa</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Calle, Av, Edificio, Número de casa..."
                                className="premium-input px-6 py-4 font-bold"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-2 tracking-widest">Notas Adicionales (Opcional)</label>
                            <input
                                type="text"
                                placeholder="Ej: Portón verde, llamar al llegar..."
                                className="premium-input px-6 py-4 font-bold"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        {/* Map Section - Moved to Bottom */}
                        <div className="space-y-4 pt-6 border-t border-border/40">
                            <div className="flex items-center justify-between px-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                                    <MapIcon size={14} /> Refinar ubicación en el mapa
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMarkerPos(centerNY);
                                        map?.panTo(centerNY);
                                        reverseGeocode(centerNY);
                                    }}
                                    className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                                >
                                    <RotateCcw size={12} /> Centrar en NY
                                </button>
                            </div>

                            <div className="relative group">
                                {isLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={markerPos}
                                        zoom={14}
                                        options={mapOptions}
                                        onClick={onMapClick}
                                        onLoad={onLoad}
                                        onUnmount={onUnmount}
                                    >
                                        <Marker
                                            position={markerPos}
                                            draggable={true}
                                            onDragEnd={(e) => {
                                                if (e.latLng) {
                                                    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                                                    setMarkerPos(newPos);
                                                    reverseGeocode(newPos);
                                                }
                                            }}
                                            animation={google.maps.Animation.DROP}
                                        />
                                    </GoogleMap>
                                ) : (
                                    <div style={mapContainerStyle} className="bg-muted animate-pulse flex items-center justify-center">
                                        <Loader2 className="animate-spin text-primary" size={40} />
                                    </div>
                                )}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none w-full px-10">
                                    <div className="bg-foreground/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white text-center">
                                        Arrastra el marcador rojo para fijar tu posición exacta
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                disabled={isLoading}
                                className="w-full premium-button jhoanes-gradient text-white py-5 shadow-2xl"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>Confirmar y Guardar Dirección <ChevronRight size={20} /></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
