import React from 'react';
import { Droplet, Activity, Zap } from 'lucide-react';
import { api } from '../api';

const ZoneCard = ({ zone }) => {
    const handleManualShot = async () => {
        if (confirm(`Force irrigation shot for ${zone.name}?`)) {
            await api.manualShot(zone.id);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 hover:border-blue-500/30 transition-all">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Droplet size={18} className="text-blue-400" />
                    {zone.name}
                </h3>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {zone.valve_entity}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-950/50 p-2 rounded">
                    <span className="text-slate-400 block text-xs">P1 Shots</span>
                    <span className="text-blue-300 font-mono text-lg">{zone.shots_today} / {zone.p1_shots}</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded">
                    <span className="text-slate-400 block text-xs">Volume</span>
                    <span className="text-emerald-300 font-mono text-lg">{zone.shot_volume_ms}ms</span>
                </div>
            </div>

            <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-slate-500">
                    Last: {zone.last_shot_time ? new Date(zone.last_shot_time).toLocaleTimeString() : 'Never'}
                </span>

                <button
                    onClick={handleManualShot}
                    className="flex items-center gap-1 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded-lg text-sm transition-colors border border-blue-600/30"
                >
                    <Zap size={14} /> Test
                </button>
            </div>
        </div>
    );
};

export default ZoneCard;
