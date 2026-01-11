import React, { useState } from 'react';
import ZoneCard from './ZoneCard';
import SensorCharts from './SensorCharts';
import { Sun, Clock, History, CheckCircle2, Droplets, LayoutGrid, Monitor, BarChart3, Activity, ShieldAlert, Cpu } from 'lucide-react';

const Dashboard = ({ status }) => {
    const [view, setView] = useState('overview'); // 'overview' or 'analytics'

    if (!status) return (
        <div className="flex flex-col items-center justify-center mt-60 gap-10">
            <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-[10px] border-blue-500/5"></div>
                <div className="absolute inset-0 rounded-full border-[10px] border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Cpu className="text-blue-500 animate-pulse" size={40} />
                </div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-black text-white uppercase tracking-[0.8em] animate-pulse">Syncing Mainframe</span>
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest italic">Establishing secure telemetry link to HA core</span>
            </div>
        </div>
    );

    if (!status.rooms || status.rooms.length === 0) return (
        <div className="max-w-2xl mx-auto text-center p-24 bg-slate-900/60 border-4 border-slate-800 rounded-[6rem] mt-20 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <ShieldAlert className="mx-auto text-blue-500/20 mb-12" size={120} />
            <h2 className="text-6xl font-black text-white mb-6 italic uppercase tracking-tighter leading-tight">Data Void</h2>
            <p className="text-slate-500 mb-16 font-bold uppercase text-[11px] tracking-[0.3em] leading-loose">No command rooms detected. Systems are in standby. Configure hydraulic protocols to activate automated crop steering.</p>
            <button className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-16 py-8 rounded-[3rem] font-black transition-all shadow-3xl shadow-blue-500/30 uppercase tracking-[0.4em] text-xs italic border-4 border-transparent hover:border-blue-600">
                INITIATE PROTOCOL
            </button>
        </div>
    );

    const timeAgo = (isoString) => {
        if (!isoString) return '';
        const seconds = Math.floor((new Date() - new Date(isoString)) / 1000);
        if (seconds < 60) return 'NOW';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}M AGO`;
        return `${Math.floor(seconds / 3600)}H AGO`;
    };

    return (
        <div className="flex flex-col gap-16 pb-60">
            {/* STICKY NAV CONTROL */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-slate-900/80 p-6 rounded-[3rem] border-2 border-slate-800/50 backdrop-blur-2xl sticky top-6 z-[100] shadow-2xl">
                <div className="flex bg-slate-950 p-2 rounded-[2rem] border-2 border-slate-900 shadow-inner">
                    <button
                        onClick={() => setView('overview')}
                        className={`flex items-center gap-4 px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] italic transition-all duration-500 ${view === 'overview' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40' : 'text-slate-600 hover:text-white'}`}
                    >
                        <LayoutGrid size={18} /> Overview
                    </button>
                    <button
                        onClick={() => setView('analytics')}
                        className={`flex items-center gap-4 px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] italic transition-all duration-500 ${view === 'analytics' ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/40' : 'text-slate-600 hover:text-white'}`}
                    >
                        <BarChart3 size={18} /> Analytics
                    </button>
                </div>

                <div className="flex items-center gap-12 px-10 border-l-2 border-slate-800/50">
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Global Mainframe</span>
                        <div className="flex items-center gap-3 text-emerald-500 font-black text-xs uppercase tracking-[0.2em] italic">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]"></div>
                            Operational
                        </div>
                    </div>
                </div>
            </div>

            {view === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* ASIDE: EVENT STREAM */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-slate-900/40 border-2 border-slate-800 p-8 rounded-[4rem] backdrop-blur-xl h-fit">
                            <h3 className="flex items-center gap-4 text-white font-black text-xs uppercase tracking-[0.5em] italic mb-10 pb-6 border-b border-slate-800">
                                <History size={20} className="text-blue-500" /> Event Stream
                            </h3>
                            <div className="space-y-6">
                                {status.history?.length > 0 ? (
                                    status.history.slice(0, 15).map((event, idx) => (
                                        <div key={idx} className="bg-slate-950/50 p-6 rounded-[2rem] border border-slate-800/50 hover:border-blue-500/30 transition-all group">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[9px] font-black text-slate-700 uppercase italic tracking-widest">{timeAgo(event.timestamp)}</span>
                                                <span className="bg-blue-600/10 text-blue-500 text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-tighter">{event.type}</span>
                                            </div>
                                            <div className="text-lg font-black text-white italic truncate leading-tight mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{event.zone_name}</div>
                                            <div className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest italic flex items-center gap-2">
                                                {event.volume_ml_per_plant}ML / PLANT
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center opacity-20 italic font-black uppercase tracking-widest text-[10px]">Awaiting signals...</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MAIN: ROOMS & ZONES */}
                    <div className="lg:col-span-9 flex flex-col gap-24">
                        {status.rooms.map(room => (
                            <div key={room.id} className="relative bg-slate-900/30 border-2 border-slate-800 p-16 rounded-[6rem] overflow-hidden group/room shadow-2xl shadow-black/80">
                                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[250px] pointer-events-none group-hover/room:bg-blue-600/10 transition-all duration-1000"></div>

                                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-20 gap-16 relative z-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-8">
                                            <h2 className="text-8xl font-black text-white tracking-tighter uppercase italic leading-none">{room.name}</h2>
                                            <div className={`h-6 w-6 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] ${room.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-600'}`}></div>
                                        </div>
                                        <div className="flex flex-wrap gap-10 items-center">
                                            <div className="flex items-center gap-4 bg-slate-950/80 border-2 border-slate-800/50 px-8 py-4 rounded-[2rem] shadow-2xl">
                                                <Sun size={20} className="text-orange-400" />
                                                <span className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] italic">
                                                    {room.use_fixed_schedule ? `${room.lights_on_time} - ${room.lights_off_time}` : 'Sensor Controlled'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-slate-600 text-[11px] font-black tracking-[0.3em] uppercase italic">
                                                <Activity size={18} className="text-blue-500/50" /> Last Room Sync: <span className="text-white ml-2">{room.last_zone_run_time ? new Date(room.last_zone_run_time).toLocaleTimeString() : '---'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 bg-slate-950/90 p-10 rounded-[3.5rem] border-2 border-slate-800/80 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic leading-none mb-2">Cycle Consumption</span>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-7xl font-black text-white tracking-tighter leading-none">
                                                {(room.zones.reduce((acc, z) => acc + (z.shots_today * (z.p1_volume_sec * ((z.dripper_rate_lph * 1000.0) / 3600.0) * z.drippers_per_zone)), 0) / 1000.0).toFixed(1)}
                                            </span>
                                            <span className="text-blue-500 font-black text-3xl italic uppercase tracking-widest leading-none">Liters</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-12">
                                    {room.zones.map(zone => (
                                        <ZoneCard key={zone.id} zone={zone} roomEnabled={room.enabled} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-24 py-10">
                    {status.rooms.map(room => (
                        <div key={room.id} className="space-y-16">
                            <div className="flex items-center gap-10">
                                <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter border-l-[12px] border-blue-600 pl-10 leading-none">{room.name}</h2>
                                <span className="text-slate-800 font-black text-2xl uppercase tracking-[0.3em] italic">Telemetry Stream</span>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {room.zones.map(zone => (
                                    <React.Fragment key={zone.id}>
                                        {zone.moisture_sensor_entity && (
                                            <SensorCharts
                                                sensorData={status.sensor_history}
                                                entityId={zone.moisture_sensor_entity}
                                                label={`${zone.name} | VWC TELEMETRY`}
                                                color="#22d3ee"
                                                unit="%"
                                            />
                                        )}
                                        {zone.ec_sensor_entity && (
                                            <SensorCharts
                                                sensorData={status.sensor_history}
                                                entityId={zone.ec_sensor_entity}
                                                label={`${zone.name} | PORE EC TRENDS`}
                                                color="#a78bfa"
                                                unit=" mS"
                                            />
                                        )}
                                    </React.Fragment>
                                ))}
                                {room.zones.every(z => !z.moisture_sensor_entity && !z.ec_sensor_entity) && (
                                    <div className="col-span-2 py-40 bg-slate-900/30 border-4 border-slate-900 border-dashed rounded-[5rem] text-center shadow-inner">
                                        <Monitor className="mx-auto text-slate-800 mb-8" size={60} />
                                        <p className="text-slate-700 font-black uppercase text-xl tracking-[0.4em] italic">No active telemetry sensors linked to this mainframe.</p>
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
