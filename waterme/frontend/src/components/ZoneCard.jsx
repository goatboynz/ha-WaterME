import React from 'react';
import { Droplets, Activity, Zap, Info, Clock, Check } from 'lucide-react';
import { api } from '../api';

const ZoneCard = ({ zone }) => {
    const handleManualShot = async () => {
        if (confirm(`Force irrigation shot for ${zone.name}?`)) {
            await api.manualShot(zone.id);
        }
    };

    const statusColor = zone.shots_today >= (zone.p1_shots + zone.p2_shots) && (zone.p1_shots + zone.p2_shots) > 0
        ? 'emerald'
        : 'blue';

    return (
        <div className="bg-slate-900 shadow-xl border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 hover:border-blue-500/50 transition-all duration-300 group/card relative overflow-hidden">
            {/* Completion Indicator */}
            {zone.shots_today >= (zone.p1_shots + zone.p2_shots) && (zone.p1_shots + zone.p2_shots) > 0 && (
                <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-2 rounded-bl-3xl shadow-lg animate-in fade-in zoom-in">
                    <Check size={16} strokeWidth={4} />
                </div>
            )}

            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <h3 className="font-bold text-xl text-white group-hover/card:text-blue-400 transition-colors">
                        {zone.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full bg-${statusColor}-500 animate-pulse`}></div>
                        <span className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{zone.id.split('-')[0]}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/50">
                    <span className="text-slate-500 block text-[10px] uppercase font-black tracking-widest mb-1">Today</span>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-${statusColor}-400 font-black text-2xl`}>{zone.shots_today}</span>
                        <span className="text-slate-600 text-sm">/ {zone.p1_shots + zone.p2_shots}</span>
                    </div>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/50">
                    <span className="text-slate-500 block text-[10px] uppercase font-black tracking-widest mb-1">P1 Vol</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-blue-400 font-black text-2xl">{Math.floor(zone.p1_volume_sec)}</span>
                        <span className="text-slate-600 text-[10px] font-bold">SEC</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-slate-600" />
                        <span>Last Shot</span>
                    </div>
                    <span className="text-slate-300 font-medium">
                        {zone.last_shot_time ? new Date(zone.last_shot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'None'}
                    </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Droplets size={12} className="text-slate-600" />
                        <span>Solenoid</span>
                    </div>
                    <span className="text-slate-500 italic truncate max-w-[100px]">{zone.valve_entity || 'Direct Pump'}</span>
                </div>
            </div>

            <div className="mt-2 pt-4 border-t border-slate-800/50 flex gap-2">
                <button
                    onClick={handleManualShot}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-2xl text-xs font-bold transition-all border border-blue-600/20 active:scale-95"
                >
                    <Zap size={14} fill="currentColor" /> FORCE SHOT
                </button>
            </div>
        </div>
    );
};

export default ZoneCard;
