import React, { useState } from 'react';
import { Zap, Timer, Waves, Beaker, Power, Activity, MoreHorizontal, Info } from 'lucide-react';
import { api } from '../api';

const ZoneCard = ({ zone, roomEnabled }) => {
    const [isEnabled, setIsEnabled] = useState(zone.enabled);

    const handleManualShot = async () => {
        if (!isEnabled || !roomEnabled) return;
        if (confirm(`INITIATE MANUAL INJECTION FOR ${zone.name.toUpperCase()}?`)) {
            await api.manualShot(zone.id);
        }
    };

    const handleToggle = async (e) => {
        e.stopPropagation();
        const newState = !isEnabled;
        try {
            await api.toggle('zone', zone.id, newState);
            setIsEnabled(newState);
        } catch (e) { console.error(e); }
    };

    const isFinished = (zone.shots_today >= (zone.p1_shots + zone.p2_shots)) && (zone.p1_shots + zone.p2_shots) > 0;

    const formatTime = (isoString) => {
        if (!isoString) return 'PENDING';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase();
        } catch { return 'ERROR'; }
    };

    const calculatePlantVolume = () => {
        // (LPH * 1000 / 3600) * SEC * (DRIPPERS/ZONE) / (PLANTS/ZONE)
        const ml_sec = (zone.dripper_rate_lph * 1000) / 3600;
        const total_ml = ml_sec * zone.p1_volume_sec * zone.drippers_per_zone;
        const plants = zone.drippers_per_zone / Math.max(1, zone.drippers_per_plant);
        return (total_ml / Math.max(1, plants)).toFixed(0);
    };

    return (
        <div className={`group relative bg-slate-900 border-2 ${isEnabled && roomEnabled ? 'border-slate-800' : 'border-red-900/40 grayscale shadow-inner'} rounded-[3.5rem] p-8 flex flex-col gap-8 transition-all duration-700 hover:border-blue-500/50 hover:bg-slate-900 shadow-2xl overflow-hidden`}>

            {/* AMBIENT BACKGROUND GLOW */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 blur-[80px] rounded-full pointer-events-none transition-all duration-1000 ${isEnabled && roomEnabled ? 'bg-blue-600/5 group-hover:bg-blue-600/10' : 'bg-red-600/10'}`}></div>

            <div className="flex justify-between items-start z-10">
                <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase group-hover:text-blue-400 transition-colors leading-none">{zone.name}</h3>
                    <span className="text-[9px] font-black tracking-[0.3em] text-slate-700 uppercase italic">
                        Output: {zone.pump_entity.split('.').pop()}
                    </span>
                </div>
                <button
                    onClick={handleToggle}
                    className={`p-4 rounded-2xl transition-all duration-500 border-2 ${isEnabled ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20' : 'bg-red-950/50 border-red-900 text-red-600'}`}
                >
                    <Power size={20} />
                </button>
            </div>

            {/* STATUS GRID */}
            <div className="grid grid-cols-2 gap-6 z-10">
                <div className="bg-slate-950/80 p-5 rounded-[2rem] border-2 border-slate-900 shadow-inner flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic mb-2">Cycle Load</span>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-black italic tracking-tighter ${isFinished ? 'text-emerald-500' : 'text-blue-500 animate-pulse'}`}>{zone.shots_today}</span>
                        <span className="text-slate-800 font-black text-sm italic">/ {zone.p1_shots + zone.p2_shots}</span>
                    </div>
                </div>
                <div className="bg-slate-950/80 p-5 rounded-[2rem] border-2 border-slate-900 shadow-inner flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Timer size={12} className="text-blue-500" />
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic leading-none">Next Shot</span>
                    </div>
                    <span className={`text-xl font-black italic tracking-tighter ${zone.next_event_time ? 'text-white' : 'text-slate-800'}`}>
                        {formatTime(zone.next_event_time)}
                    </span>
                </div>
            </div>

            {/* TELEMETRY MINI BAR */}
            <div className="grid grid-cols-2 gap-6 z-10">
                <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-[1.5rem] border border-slate-800/50">
                    <div className="bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                        <Waves size={16} className="text-cyan-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-700 uppercase italic">VWC %</span>
                        <span className="text-lg font-black text-white italic tracking-tighter">{zone.current_moisture != null ? `${zone.current_moisture}%` : '--'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-[1.5rem] border border-slate-800/50">
                    <div className="bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20">
                        <Beaker size={16} className="text-purple-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-700 uppercase italic">mS EC</span>
                        <span className="text-lg font-black text-white italic tracking-tighter">{zone.current_ec != null ? zone.current_ec.toFixed(1) : '--'}</span>
                    </div>
                </div>
            </div>

            {/* FOOTER STATS */}
            <div className="space-y-4 pt-4 border-t-2 border-slate-950 z-10">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest italic">
                    <span className="text-slate-700">Projected Plant Feed</span>
                    <span className="text-blue-400">{calculatePlantVolume()} <span className="opacity-50">ML</span></span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest italic opacity-50">
                    <span className="text-slate-700">Last Telemetry Check</span>
                    <span className="text-slate-500">{zone.last_shot_time ? new Date(zone.last_shot_time).toLocaleTimeString().toUpperCase() : '---'}</span>
                </div>
            </div>

            {/* ACTION CENTER */}
            <button
                disabled={!isEnabled || !roomEnabled}
                onClick={handleManualShot}
                className={`w-full py-5 rounded-[2rem] text-xs font-black transition-all duration-500 flex items-center justify-center gap-4 uppercase tracking-[0.4em] italic z-10 shadow-3xl ${isEnabled && roomEnabled ? 'bg-blue-600 text-white hover:bg-white hover:text-blue-600 shadow-blue-500/20 active:scale-95' : 'bg-slate-950 text-slate-800 border-2 border-slate-900 cursor-not-allowed'}`}
            >
                <Zap size={16} fill="currentColor" /> Trigger Injection
            </button>

            {!isEnabled && (
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center z-[20]">
                    <div className="bg-red-600 text-white px-8 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.5em] italic shadow-3xl">Offline</div>
                </div>
            )}
        </div>
    );
};

export default ZoneCard;
