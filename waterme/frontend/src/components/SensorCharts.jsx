import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, TrendingUp, MoreHorizontal, Maximize2 } from 'lucide-react';

const SensorCharts = ({ sensorData, entityId, label, color = "#fb923c", unit = "%" }) => {
    const data = useMemo(() => {
        if (!sensorData || !sensorData[entityId]) return [];
        // Extract last 48 points for a smoother trend
        return sensorData[entityId].map(p => ({
            time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: p.value,
            timestamp: new Date(p.timestamp).getTime()
        })).slice(-48);
    }, [sensorData, entityId]);

    const currentVal = data.length > 0 ? data[data.length - 1].value : 0;
    const prevVal = data.length > 5 ? data[data.length - 6].value : currentVal;
    const percentage = prevVal !== 0 ? ((currentVal - prevVal) / prevVal * 100).toFixed(1) : 0;
    const isUp = currentVal >= prevVal;

    if (data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-[2.5rem] text-slate-700 font-black uppercase text-[10px] tracking-widest gap-4">
                <Activity className="opacity-20" size={40} />
                Awaiting Telemetry Stream...
            </div>
        );
    }

    return (
        <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl group transition-all duration-500 hover:bg-white/[0.03]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div className="space-y-1">
                    <h3 className="text-white font-black text-2xl uppercase italic tracking-tighter leading-none">{label}</h3>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Today</span>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Last week</span>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Last month</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <div className="text-4xl font-black text-white italic tracking-tighter leading-none">
                            {currentVal.toFixed(1)}{unit}
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-black mt-1 ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isUp ? '+' : ''}{percentage}%
                            <TrendingUp size={12} className={isUp ? '' : 'rotate-180'} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors border border-white/5">
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="h-80 w-full relative">
                {/* TOOLTIP OVERLAY SIMULATION */}
                <div className="absolute top-0 right-0 z-10 hidden group-hover:block transition-all animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-[#121212]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-3xl">
                        <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest italic mb-1">Telemetry Focus</div>
                        <div className="text-xs font-black text-white italic">Auto-Scaling Stream</div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient-${entityId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                <stop offset="70%" stopColor={color} stopOpacity={0.05} />
                                <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#404040"
                            fontSize={10}
                            fontWeight="900"
                            tickLine={false}
                            axisLine={false}
                            dy={15}
                            interval={Math.floor(data.length / 6)}
                        />
                        <YAxis
                            stroke="#404040"
                            fontSize={10}
                            fontWeight="900"
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: '4 4' }}
                            contentStyle={{
                                backgroundColor: '#121212',
                                border: '1px solid #262626',
                                borderRadius: '16px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                padding: '12px',
                            }}
                            itemStyle={{
                                fontSize: '14px',
                                fontWeight: '900',
                                color: '#fff',
                                fontStyle: 'italic',
                                fontFamily: 'inherit',
                                textTransform: 'uppercase'
                            }}
                            labelStyle={{
                                fontSize: '10px',
                                fontWeight: '900',
                                color: '#525252',
                                textTransform: 'uppercase',
                                marginBottom: '4px',
                                letterSpacing: '0.1em'
                            }}
                        />
                        <Area
                            type="monotoneX" // Use monotoneX for smoother lines
                            dataKey="value"
                            stroke={color}
                            strokeWidth={4}
                            fillOpacity={1}
                            fill={`url(#gradient-${entityId})`}
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SensorCharts;
