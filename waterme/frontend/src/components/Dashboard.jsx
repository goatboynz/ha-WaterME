import React, { useState } from 'react';
import ZoneCard from './ZoneCard';
import SensorCharts from './SensorCharts';
import { Sun, Moon, Clock, History, CheckCircle2, Waves, Beaker, Droplets, Zap, LayoutGrid, Monitor, BarChart3, Activity } from 'lucide-react';

const Dashboard = ({ status }) => {
    const [view, setView] = useState('overview'); // 'overview' or 'analytics'

    if (!status) return (
        <div className="flex flex-col items-center justify-center mt-40 gap-8">
            <div className="relative w-24 h-24">
                <div className="absolute inset-x-0 bottom-0 top-0 rounded-full border-[6px] border-blue-500/10"></div>
                <div className="absolute inset-x-0 bottom-0 top-0 rounded-full border-[6px] border-blue-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="text-blue-500 animate-pulse" size={32} />
                </div>
            </div>
            <div className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Establishing Secure Stream</div>
        </div>
    );

    if (!status.rooms || status.rooms.length === 0) return (
        <div className="max-w-xl mx-auto text-center p-20 bg-slate-900/40 border-2 border-slate-800 rounded-[4rem] mt-20 backdrop-blur-3xl shadow-2xl">
            <Monitor className="mx-auto text-blue-500/20 mb-8" size={80} />
            <h2 className="text-4xl font-black text-white mb-4 italic uppercase tracking-tight">Mainframe Offline</h2>
            <p className="text-slate-500 mb-10 font-bold uppercase text-xs tracking-widest leading-relaxed">No hydraulic configurations detected. Initialize room protocols to proceed with automated irrigation.</p>
            <button className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-12 py-5 rounded-3xl font-black transition-all shadow-2xl shadow-blue-900/40 uppercase tracking-widest text-sm">
                CONFIGURE SYSTEM
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
        <div className="flex flex-col gap-12 pb-40">
            {/* Ultra-Modern Header Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex bg-slate-900/50 p-1.5 rounded-[2rem] border border-slate-800/50 backdrop-blur-xl shadow-2xl">
                    <button
                        onClick={() => setView('overview')}
                        className={`flex items-center gap-3 px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${view === 'overview' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-white'}`}
                    >
                        <LayoutGrid size={16} /> Overview
                    </button>
                    <button
                        onClick={() => setView('analytics')}
                        className={`flex items-center gap-3 px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${view === 'analytics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-white'}`}
                    >
                        <BarChart3 size={16} /> Analytics
                    </button>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Status</span>
                        <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                            Operational
                        </div>
                    </div>
                </div>
            </div>

            {view === 'overview' ? (
                <div className="flex flex-col gap-16">
                    {/* Live Stream Card */}
                    <div className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-[3rem] backdrop-blur-2xl relative overflow-hidden">
                        <div className="flex items-center gap-4 text-blue-400 mb-8">
                            <History size={20} className="animate-spin-slow" />
                            <span className="font-black text-[11px] uppercase tracking-[0.4em]">Real-Time Event Stream</span>
                        </div>
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                            {status.history?.length > 0 ? (
                                status.history.slice(0, 10).map((event, idx) => (
                                    <div key={idx} className="flex-shrink-0 bg-slate-950/80 border border-slate-800/80 p-6 rounded-[2.5rem] flex flex-col min-w-[220px] shadow-2xl hover:border-blue-500/50 transition-all">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[9px] font-black text-slate-600 uppercase">{timeAgo(event.timestamp)}</span>
                                            <span className="bg-blue-600/20 text-blue-400 text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest">{event.type}</span>
                                        </div>
                                        <div className="text-xl font-black text-white truncate mb-4 italic tracking-tight">{event.zone_name}</div>
                                        <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800/50">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <Droplets size={10} className="text-blue-500" /> Plant Delivery
                                            </div>
                                            <div className="text-white font-black text-lg">{event.volume_ml_per_plant}<span className="text-[10px] text-blue-500 ml-1">ML</span></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 w-full text-center text-slate-700 font-black uppercase text-xs tracking-[0.3em] italic">Awaiting automated irrigation triggers...</div>
                            )}
                        </div>
                    </div>

                    {/* Rooms Display */}
                    {status.rooms.map(room => (
                        <div key={room.id} className="relative bg-slate-900/10 border border-slate-800/40 p-12 rounded-[5rem] overflow-hidden group/room">
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[180px] pointer-events-none group-hover/room:bg-blue-600/10 transition-all duration-1000"></div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-12 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-6">
                                        <h2 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none">{room.name}</h2>
                                        <div className={`h-4 w-4 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] ${room.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 shadow-red-500/20'}`}></div>
                                    </div>
                                    <div className="flex flex-wrap gap-8 items-center">
                                        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 px-6 py-2.5 rounded-[1.5rem] shadow-xl">
                                            <Sun size={16} className="text-orange-400" />
                                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                                {room.use_fixed_schedule ? `${room.lights_on_time} - ${room.lights_off_time}` : 'Photo-Sensor Active'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 text-[11px] font-black tracking-[0.2em] uppercase">
                                            <Clock size={16} className="text-blue-500/50" /> Last System Activity: <span className="text-white italic">{room.last_zone_run_time ? new Date(room.last_zone_run_time).toLocaleTimeString() : 'IDLE'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex bg-slate-950/80 p-6 rounded-[2.5rem] border border-slate-800/80 shadow-2xl items-center gap-10">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Room Consumed (24h)</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-white tracking-tighter">
                                                {(room.zones.reduce((acc, z) => acc + (z.shots_today * (z.p1_volume_sec * ((z.dripper_rate_lph * 1000.0) / 3600.0) * z.drippers_per_zone)), 0) / 1000.0).toFixed(1)}
                                            </span>
                                            <span className="text-blue-500 font-black text-2xl italic uppercase">L</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                                {room.zones.map(zone => (
                                    <ZoneCard key={zone.id} zone={zone} roomEnabled={room.enabled} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-12">
                    {status.rooms.map(room => (
                        <div key={room.id} className="space-y-8">
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter border-l-8 border-blue-600 pl-6">{room.name} <span className="text-slate-700 ml-4 font-mono text-xl not-italic">TELEMETRY</span></h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {room.zones.map(zone => (
                                    <React.Fragment key={zone.id}>
                                        {zone.moisture_sensor_entity && (
                                            <SensorCharts
                                                sensorData={status.sensor_history}
                                                entityId={zone.moisture_sensor_entity}
                                                label={`${zone.name} - Moisture`}
                                                color="#22d3ee"
                                                unit="%"
                                            />
                                        )}
                                        {zone.ec_sensor_entity && (
                                            <SensorCharts
                                                sensorData={status.sensor_history}
                                                entityId={zone.ec_sensor_entity}
                                                label={`${zone.name} - EC`}
                                                color="#a78bfa"
                                                unit=" mS"
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                                {room.zones.every(z => !z.moisture_sensor_entity && !z.ec_sensor_entity) && (
                                    <div className="col-span-2 py-20 bg-slate-900/30 border-2 border-slate-800 border-dashed rounded-[3rem] text-center">
                                        <p className="text-slate-600 font-black uppercase text-sm tracking-widest">No sensors linked to this room's telemetry mainframe.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
