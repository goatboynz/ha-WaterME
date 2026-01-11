import React, { useState } from 'react';
import { Droplets, Activity, Zap, Check, Clock, Waves, Beaker, Timer, Power } from 'lucide-react';
import { api } from '../api';

const ZoneCard = ({ zone, roomEnabled }) => {
    const [isEnabled, setIsEnabled] = useState(zone.enabled);

    const handleManualShot = async () => {
        if (!isEnabled || !roomEnabled) {
            alert('Zone or Room is currently disabled.');
            return;
        }
        if (confirm(`Force irrigation shot for ${zone.name}?`)) {
            await api.manualShot(zone.id);
        }
    };

    const handleToggle = async () => {
        const newState = !isEnabled;
        try {
            await api.toggle('zone', zone.id, newState);
            setIsEnabled(newState);
        } catch (e) { console.error(e); }
    };

    const isFinished = zone.shots_today >= (zone.p1_shots + zone.p2_shots) && (zone.p1_shots + zone.p2_shots) > 0;

    const formatTime = (isoString) => {
        if (!isoString) return '---';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch { return '---'; }
    };

    return (
        <div className={`bg-slate-900 border ${isEnabled && roomEnabled ? 'border-slate-800' : 'border-red-900/30 grayscale'} rounded-[2.5rem] p-6 flex flex-col gap-6 hover:border-blue-500/50 transition-all duration-500 shadow-xl group relative overflow-hidden`}>
            {/* Status Overlays */}
            {!isEnabled && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <div className="bg-red-600 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">Disabled</div>
                </div>
            )}

            <div className="flex justify-between items-start relative z-20">
                <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight italic">{zone.name}</h3>
                    <span className="text-[9px] font-black tracking-[0.2em] text-slate-600 uppercase">
                        {zone.valve_entity ? `VALVE: ${zone.valve_entity.split('.').pop()}` : 'DIRECT PUMP'}
                    </span>
                </div>
                <button
                    onClick={handleToggle}
                    className={`p-3 rounded-2xl transition-all ${isEnabled ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                >
                    <Power size={18} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-20">
                <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800/50">
                    <span className="text-[9px] uppercase font-black text-slate-600 tracking-wider mb-2 block">Cycle Progress</span>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-black ${isFinished ? 'text-emerald-400' : 'text-blue-400'}`}>{zone.shots_today}</span>
                        <span className="text-slate-700 font-black text-xs uppercase">/ {zone.p1_shots + zone.p2_shots} Items</span>
                    </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800/50 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Timer size={14} className="text-blue-500" />
                        <span className="text-[9px] uppercase font-black tracking-[0.15em]">Estimated Next</span>
                    </div>
                    <span className="text-lg font-black text-white italic">{formatTime(zone.next_event_time)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-20">
                <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/30">
                    <div className="bg-cyan-500/10 p-2 rounded-xl">
                        <Waves size={16} className="text-cyan-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase">Current VWC</span>
                        <span className="text-sm font-black text-white">{zone.current_moisture != null ? `${zone.current_moisture}%` : '--'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/30">
                    <div className="bg-purple-500/10 p-2 rounded-xl">
                        <Beaker size={16} className="text-purple-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase">Substrate EC</span>
                        <span className="text-sm font-black text-white">{zone.current_ec != null ? zone.current_ec.toFixed(1) : '--'}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/50 relative z-20">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
                    <span className="text-slate-600">Last event recorded</span>
                    <span className="text-slate-400">{formatTime(zone.last_shot_time)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
                    <span className="text-slate-600">Projected Plant Feed</span>
                    <span className="text-white">{((zone.p1_volume_sec * ((zone.dripper_rate_lph * 1000) / 3600)) * zone.drippers_per_zone / (zone.drippers_per_zone / max(1, zone.drippers_per_plant))).toFixed(0)} ml/item</span>
                </div>
            </div>

            <button
                disabled={!isEnabled || !roomEnabled}
                onClick={handleManualShot}
                className={`w-full py-4 rounded-[1.5rem] text-xs font-black transition-all border flex items-center justify-center gap-2 uppercase tracking-[0.2em] relative z-20 ${isEnabled && roomEnabled ? 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border-blue-600/20 shadow-lg shadow-blue-900/10 active:scale-95' : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'}`}
            >
                <Zap size={14} fill="currentColor" /> Trigger Shot
            </button>
        </div>
    );
};

// helper
const max = (a, b) => a > b ? a : b;

export default ZoneCard;
