import React from 'react';
import ZoneCard from './ZoneCard';
import { Sun, Moon, Clock, History, CheckCircle2, Calendar } from 'lucide-react';

const Dashboard = ({ status }) => {
    if (!status) return (
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <div className="text-slate-500 animate-pulse">Establishing connection to WaterME Controller...</div>
        </div>
    );

    if (!status.rooms || status.rooms.length === 0) return (
        <div className="text-center p-12 bg-slate-900/30 border border-slate-800 rounded-3xl mt-20">
            <div className="text-slate-400 mb-4 text-xl font-semibold">Ready to Irrigated?</div>
            <p className="text-slate-600 mb-6">You haven't configured any rooms yet.</p>
            <button className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40">
                Go to Configuration
            </button>
        </div>
    );

    // Format relative time
    const formatTime = (isoString) => {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const timeAgo = (isoString) => {
        if (!isoString) return '';
        const seconds = Math.floor((new Date() - new Date(isoString)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div className="flex flex-col gap-10">
            {/* Top Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
                    <div className="flex items-center gap-3 text-emerald-400 mb-2">
                        <CheckCircle2 size={24} />
                        <span className="font-bold text-lg">System Active</span>
                    </div>
                    <div className="text-slate-500 text-sm">All sensors reporting nominal. Monitoring {status.rooms.length} rooms.</div>
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md md:col-span-2">
                    <div className="flex items-center gap-3 text-blue-400 mb-4">
                        <History size={20} />
                        <span className="font-bold">Recent Activity</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {status.history && status.history.length > 0 ? (
                            status.history.slice(0, 5).map((event, idx) => (
                                <div key={idx} className="flex-shrink-0 bg-slate-950/50 border border-slate-800/50 px-4 py-2 rounded-2xl flex flex-col min-w-[140px]">
                                    <div className="text-xs text-slate-500 font-medium mb-1">{timeAgo(event.timestamp)}</div>
                                    <div className="text-sm font-bold text-white truncate">{event.zone_name}</div>
                                    <div className="text-[10px] text-blue-400 uppercase tracking-widest">{event.type} • {event.duration_sec}s</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-600 text-sm italic">No recent events logged yet.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Room Displays */}
            {status.rooms.map(room => (
                <div key={room.id} className="relative bg-slate-900/20 border border-slate-800 p-8 rounded-[2rem] overflow-hidden group">
                    {/* Decorative Background Glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 blur-[120px] pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <div className="relative">
                            <h2 className="text-4xl font-black text-white flex items-center gap-4">
                                {room.name}
                                <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                                    <Sun size={14} className="animate-pulse" /> P1 PHASE
                                </span>
                            </h2>
                            <div className="flex items-center gap-2 text-slate-500 text-sm mt-2 font-mono">
                                <Clock size={14} /> Last Run: {room.last_zone_run_time ? formatTime(room.last_zone_run_time) : 'Never'}
                                <span className="text-slate-700 ml-2">|</span>
                                <span className="text-blue-500/70">{room.lights_on_entity}</span>
                            </div>
                        </div>

                        {/* Visual Phase Timeline */}
                        <div className="w-full md:w-80">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Irrigation Progress</span>
                                <span className="text-[10px] font-bold text-slate-500">60% COMPLETED</span>
                            </div>
                            <div className="h-3 bg-slate-800/50 rounded-full border border-slate-800/50 p-0.5 relative overflow-hidden">
                                <div className="absolute top-0 bottom-0 left-0 w-[60%] bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                            </div>
                            <div className="flex justify-between mt-2 px-1">
                                <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> P1</div>
                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-600"><div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div> GAP</div>
                                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-600"><div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div> P2</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
