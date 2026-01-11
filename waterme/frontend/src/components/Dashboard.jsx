import React from 'react';
import ZoneCard from './ZoneCard';
import { Sun, Moon, Clock, History, CheckCircle2, Waves, Beaker, Droplets, Zap, ChevronRight, LayoutGrid } from 'lucide-react';

const Dashboard = ({ status }) => {
    if (!status) return (
        <div className="flex flex-col items-center justify-center mt-40 gap-6">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <div className="text-xl font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Syncing...</div>
        </div>
    );

    if (!status.rooms || status.rooms.length === 0) return (
        <div className="max-w-xl mx-auto text-center p-20 bg-slate-900/40 border-2 border-slate-800 rounded-[3rem] mt-20">
            <h2 className="text-4xl font-black text-white mb-4 italic uppercase">Systems Offline</h2>
            <p className="text-slate-500 mb-10 font-bold">No rooms detected in the mainframe. Begin configuration sequence.</p>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-3xl font-black transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-widest">
                Initialize System
            </button>
        </div>
    );

    const timeAgo = (isoString) => {
        if (!isoString) return '';
        const seconds = Math.floor((new Date() - new Date(isoString)) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div className="flex flex-col gap-12">
            {/* Global Telemetry Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 bg-slate-900/30 border border-slate-800/60 p-8 rounded-[2.5rem] backdrop-blur-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><LayoutGrid size={120} /></div>
                    <div className="flex items-center gap-4 text-blue-400 mb-6 px-1">
                        <History size={20} />
                        <span className="font-black text-[10px] uppercase tracking-[0.3em]">Live Irrigation Stream</span>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide px-1">
                        {status.history?.length > 0 ? (
                            status.history.slice(0, 8).map((event, idx) => (
                                <div key={idx} className="flex-shrink-0 bg-slate-950/80 border border-slate-800/80 p-5 rounded-[2rem] flex flex-col min-w-[200px] hover:border-blue-500/30 transition-all duration-300 shadow-xl">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-slate-700 uppercase">{timeAgo(event.timestamp)}</span>
                                        <span className="bg-blue-600/10 text-blue-500 text-[8px] px-2 py-0.5 rounded-full font-black uppercase">{event.type}</span>
                                    </div>
                                    <div className="text-lg font-black text-white truncate mb-1">{event.zone_name}</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Droplets size={10} className="text-blue-500" /> {event.volume_ml_total}ml total
                                    </div>
                                    <div className="text-[9px] font-black text-emerald-500/70 uppercase tracking-tighter mt-1">
                                        {event.volume_ml_per_plant}ml per plant
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 px-4 text-slate-700 font-black uppercase text-xs tracking-widest italic">Waiting for initial trigger...</div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-[2.5rem] backdrop-blur-2xl flex flex-col justify-center gap-2">
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <CheckCircle2 size={16} /> Heartbeat
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter">ONLINE</div>
                    <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Syncing every 2 seconds</div>
                </div>
            </div>

            {/* Room Telemetry */}
            {status.rooms.map(room => (
                <div key={room.id} className="relative bg-slate-900/10 border border-slate-800/50 p-10 rounded-[4rem] overflow-hidden group/room">
                    {/* Atmospheric Glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] pointer-events-none group-hover/room:bg-blue-600/10 transition-all duration-1000"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-10 relative z-10">
                        <div className="space-y-3">
                            <div className="flex items-center gap-4">
                                <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic">{room.name}</h2>
                                <div className="bg-emerald-500 h-2 w-2 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                            </div>
                            <div className="flex flex-wrap gap-6 items-center">
                                <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/50 px-4 py-2 rounded-2xl">
                                    <Sun size={14} className="text-orange-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {room.use_fixed_schedule ? `${room.lights_on_time} - ${room.lights_off_time}` : 'Sensor Based'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 text-[10px] font-black tracking-widest uppercase">
                                    <Clock size={14} /> Last Activity: {room.last_zone_run_time ? new Date(room.last_zone_run_time).toLocaleTimeString() : 'Waiting...'}
                                </div>
                            </div>
                        </div>

                        {/* Summary Metrics */}
                        <div className="flex gap-10 pr-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Daily Volume</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-white tracking-tighter">
                                        {(room.zones.reduce((acc, z) => acc + (z.shots_today * (z.p1_volume_sec * (z.dripper_rate_ml_min / 60.0) * z.drippers_per_zone)), 0) / 1000.0).toFixed(1)}
                                    </span>
                                    <span className="text-blue-500 font-black text-xl italic uppercase">Liters</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {room.zones.map(zone => (
                            <ZoneCard key={zone.id} zone={zone} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Dashboard;
