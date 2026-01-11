import React from 'react';
import { Droplets, Activity, Zap, Check, Clock, Thermometer, Waves, Beaker, Timer, Info } from 'lucide-react';
import { api } from '../api';

const ZoneCard = ({ zone }) => {
    const handleManualShot = async () => {
        if (confirm(`Force irrigation shot for ${zone.name}?`)) {
            await api.manualShot(zone.id);
        }
    };

    const isFinished = zone.shots_today >= (zone.p1_shots + zone.p2_shots) && (zone.p1_shots + zone.p2_shots) > 0;
    const progress = Math.min(100, (zone.shots_today / (zone.p1_shots + zone.p2_shots || 1)) * 100);

    const formatTime = (isoString) => {
        if (!isoString) return '---';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 flex flex-col gap-6 hover:bg-slate-900/80 hover:border-blue-500/50 transition-all duration-500 shadow-xl group relative overflow-hidden">
            {/* Completion Badge */}
            {isFinished && (
                <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 p-2 rounded-full border border-emerald-500/20 animate-in zoom-in">
                    <Check size={16} strokeWidth={4} />
                </div>
            )}

            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{zone.name}</h3>
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase">
                    {zone.valve_entity ? `VALVE: ${zone.valve_entity.split('.').pop()}` : 'DIRECT PUMP'}
                </span>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800/50">
                    <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-2 block">Shots Run</span>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-black ${isFinished ? 'text-emerald-400' : 'text-blue-400'}`}>{zone.shots_today}</span>
                        <span className="text-slate-600 font-bold">/ {zone.p1_shots + zone.p2_shots}</span>
                    </div>
                </div>
                <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800/50 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Timer size={14} className="text-blue-500" />
                        <span className="text-[9px] uppercase font-black tracking-widest">Next Run</span>
                    </div>
                    <span className="text-lg font-black text-white">{formatTime(zone.next_event_time)}</span>
                </div>
            </div>

            {/* Crop Steering Sensors */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/30">
                    <div className="bg-cyan-500/10 p-2 rounded-xl">
                        <Waves size={16} className="text-cyan-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase">Moisture</span>
                        <span className="text-sm font-black text-white">{zone.current_moisture ? `${zone.current_moisture}%` : '--'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/30">
                    <div className="bg-purple-500/10 p-2 rounded-xl">
                        <Beaker size={16} className="text-purple-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase">Substrate EC</span>
                        <span className="text-sm font-black text-white">{zone.current_ec ? zone.current_ec.toFixed(1) : '--'}</span>
                    </div>
                </div>
            </div>

            {/* Footer data */}
            <div className="space-y-3 pt-4 border-t border-slate-800/50">
                <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-600 uppercase tracking-widest">Last Run</span>
                    <span className="text-slate-400">{formatTime(zone.last_shot_time)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-600 uppercase tracking-widest">Plants Count</span>
                    <span className="text-white">{Math.round(zone.drippers_per_zone / (zone.drippers_per_plant || 1))}</span>
                </div>
            </div>

            <button
                onClick={handleManualShot}
                className="w-full bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white py-4 rounded-[1.5rem] text-xs font-black transition-all border border-blue-600/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
                <Zap size={14} fill="currentColor" /> Force Shot
            </button>
        </div>
    );
};

export default ZoneCard;
