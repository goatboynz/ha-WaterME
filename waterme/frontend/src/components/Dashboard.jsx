import React, { useState, useMemo } from 'react';
import SensorCharts from './SensorCharts';
import {
    Clock,
    History,
    Activity,
    Zap,
    Waves,
    Beaker,
    ArrowUpRight,
    MoreHorizontal,
    TrendingUp,
    TrendingDown,
    Droplets,
    LayoutGrid,
    BarChart3,
    CheckCircle2,
    XCircle,
    Power
} from 'lucide-react';
import { api } from '../api';
import { BarChart, Bar, ResponsiveContainer, YAxis } from 'recharts';

const SummaryCard = ({ title, value, subValue, trend, trendUp, icon: Icon, chartData, accentColor = "orange" }) => {
    const isOrange = accentColor === "orange";
    const isPurple = accentColor === "purple";
    const isGreen = accentColor === "green";

    return (
        <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 hover:bg-white/[0.03] group relative overflow-hidden flex flex-col justify-between h-56 ${isOrange ? 'bg-orange-950/5 border-orange-500/20 hover:border-orange-500/40' :
                isPurple ? 'bg-purple-950/5 border-purple-500/20 hover:border-purple-500/40' :
                    'bg-emerald-950/5 border-emerald-500/20 hover:border-emerald-500/40'
            }`}>
            <div className="flex justify-between items-start relative z-10">
                <span className="text-slate-500 text-xs font-black uppercase tracking-widest italic">{title}</span>
                <div className={`p-2.5 rounded-full border shadow-xl transition-transform group-hover:scale-110 ${isOrange ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                        isPurple ? 'bg-purple-500/10 border-purple-500/30 text-purple-500' :
                            'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    }`}>
                    <ArrowUpRight size={16} />
                </div>
            </div>

            <div className="flex items-end justify-between relative z-10">
                <div className="space-y-1">
                    <div className="text-4xl font-black text-white italic tracking-tighter leading-none">{value}</div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest">{subValue}</span>
                        {trend && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${trendUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                {trendUp ? '+' : '-'}{trend}
                                {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            </span>
                        )}
                    </div>
                </div>

                {chartData && (
                    <div className="w-24 h-16">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <Bar
                                    dataKey="v"
                                    fill={isOrange ? "#f97316" : isPurple ? "#a78bfa" : "#10b981"}
                                    radius={[4, 4, 0, 0]}
                                    opacity={0.6}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* AMBIENT GLOW */}
            <div className={`absolute -bottom-10 -right-10 w-40 h-40 blur-[80px] rounded-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity ${isOrange ? 'bg-orange-500' : isPurple ? 'bg-purple-500' : 'bg-emerald-500'
                }`}></div>
        </div>
    );
};

const ZoneRow = ({ zone, roomName, roomEnabled }) => {
    const isEnabled = zone.enabled && roomEnabled;
    const progress = ((zone.shots_today / (zone.p1_shots + zone.p2_shots)) * 100) || 0;

    const handleManualShot = async (e) => {
        e.stopPropagation();
        if (!isEnabled) return;
        if (confirm(`FORCE INJECTION FOR ${zone.name.toUpperCase()}?`)) {
            await api.manualShot(zone.id);
        }
    };

    const nextShotTime = zone.next_event_time ? new Date(zone.next_event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---';

    return (
        <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-pointer">
            <td className="py-6 pl-2">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic shadow-inner border transition-colors ${isEnabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-slate-900 border-slate-800 text-slate-700'
                        }`}>
                        <Droplets size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-black text-white italic uppercase tracking-tight leading-none mb-1 group-hover:text-orange-500 transition-colors">{zone.name}</div>
                        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{roomName}</div>
                    </div>
                </div>
            </td>
            <td className="py-6">
                <div className="flex flex-col">
                    <span className="text-[11px] font-black text-white italic uppercase">{zone.pump_entity.split('.').pop()}</span>
                    <span className="text-[9px] font-bold text-slate-600 uppercase">{zone.valve_entity ? zone.valve_entity.split('.').pop() : 'NO VALVE'}</span>
                </div>
            </td>
            <td className="py-6">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-emerald-500 italic uppercase">+{zone.shots_today} Shots</span>
                    <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden flex gap-1">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </td>
            <td className="py-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                        <span className="text-xs font-black text-white italic leading-none">{zone.current_moisture != null ? `${zone.current_moisture}%` : '--'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                        <span className="text-xs font-black text-white italic leading-none">{zone.current_ec != null ? zone.current_ec.toFixed(1) : '--'}</span>
                    </div>
                </div>
            </td>
            <td className="py-6">
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-600" />
                    <span className="text-xs font-black text-white italic uppercase tracking-tight">{nextShotTime}</span>
                </div>
            </td>
            <td className="py-6 pr-2 text-right">
                <div className="flex justify-end items-center gap-4">
                    <button
                        onClick={handleManualShot}
                        disabled={!isEnabled}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isEnabled ? 'bg-orange-500 text-white hover:bg-white hover:text-orange-500 shadow-lg shadow-orange-500/20 active:scale-95' : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800'
                            }`}
                    >
                        Force Inject
                    </button>
                    <button className="text-slate-600 hover:text-white transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const Dashboard = ({ status }) => {
    const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'analytics'

    const totalVolume = useMemo(() => {
        if (!status?.history) return 0;
        const today = new Date().toISOString().split('T')[0];
        return status.history
            .filter(e => e.timestamp.startsWith(today))
            .reduce((acc, e) => acc + (e.volume_ml_total || 0), 0) / 1000.0;
    }, [status]);

    const statsChartData = useMemo(() => [
        { v: 40 }, { v: 60 }, { v: 45 }, { v: 90 }, { v: 70 }, { v: 85 }, { v: 100 }, { v: 80 }
    ], []);

    if (!status) return null;

    const allZones = status.rooms.flatMap(r => r.zones.map(z => ({ ...z, roomName: r.name, roomEnabled: r.enabled })));

    return (
        <div className="py-6 flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* TOP SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <SummaryCard
                    title="Liquid Consumption"
                    value={`${totalVolume.toFixed(2)}L`}
                    subValue="Total volume today"
                    trend="2.1%"
                    trendUp={false}
                    chartData={statsChartData}
                    accentColor="orange"
                />
                <SummaryCard
                    title="Avg Substrate VWC"
                    value="42.8%"
                    subValue="Mean moisture sensor reading"
                    trend="13.2%"
                    trendUp={true}
                    chartData={statsChartData}
                    accentColor="purple"
                />
                <SummaryCard
                    title="Network Injections"
                    value={status.history?.length || 0}
                    subValue="Total shots in last 24h"
                    trend="1.2%"
                    trendUp={true}
                    chartData={statsChartData}
                    accentColor="green"
                />
            </div>

            {/* MAIN CHART AREA */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">General Statistics</h3>
                    <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-xl">
                        <button className="px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest italic bg-white/5 text-white">Year</button>
                        <button className="px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest italic text-slate-600 hover:text-slate-300">Month</button>
                        <button className="px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest italic text-slate-600 hover:text-slate-300">Week</button>
                    </div>
                </div>

                {allZones.length > 0 && allZones[0].moisture_sensor_entity ? (
                    <SensorCharts
                        sensorData={status.sensor_history}
                        entityId={allZones[0].moisture_sensor_entity}
                        label="Historical VWC Analysis"
                    />
                ) : (
                    <div className="h-80 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-slate-800 font-black uppercase italic tracking-[0.3em] gap-4">
                        <BarChart3 size={40} className="text-slate-900" />
                        Historical Mainframe Pending
                    </div>
                )}
            </div>

            {/* ZONE TABLE AREA */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="px-10 py-8 border-b border-white/[0.03] flex justify-between items-center bg-white/[0.01]">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Active Zones</h3>
                    <div className="flex gap-4">
                        <button className="text-slate-600 hover:text-white transition-colors">
                            <Zap size={20} />
                        </button>
                        <button className="text-slate-600 hover:text-white transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/[0.03] bg-white/[0.01]">
                                <th className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic">Zone Designation</th>
                                <th className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic">Hardware</th>
                                <th className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic">Cycle Progress</th>
                                <th className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic">Substrate Status</th>
                                <th className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic">Command Sync</th>
                                <th className="py-6 pr-10 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic">Direct Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allZones.map((zone, idx) => (
                                <ZoneRow
                                    key={zone.id}
                                    zone={zone}
                                    roomName={zone.roomName}
                                    roomEnabled={zone.roomEnabled}
                                />
                            ))}
                            {allZones.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-slate-800 font-black uppercase italic tracking-widest opacity-20 text-xs">
                                        No active zones detected in system OS
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
