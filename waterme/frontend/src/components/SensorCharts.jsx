import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Clock } from 'lucide-react';

const SensorCharts = ({ sensorData, entityId, label, color = "#3b82f6", unit = "%" }) => {
    const data = useMemo(() => {
        if (!sensorData || !sensorData[entityId]) return [];
        return sensorData[entityId].map(p => ({
            time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: p.value
        })).slice(-24); // Show last 24 points
    }, [sensorData, entityId]);

    if (data.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center bg-slate-950/20 border border-slate-800/50 rounded-3xl text-slate-700 font-black uppercase text-[10px] tracking-widest">
                No telemetry data available for this cycle
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <Activity size={16} style={{ color }} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-black text-xs uppercase tracking-widest">{label}</span>
                        <span className="text-slate-600 text-[9px] font-bold uppercase tracking-tight italic">24-Hour Telemetry Stream</span>
                    </div>
                </div>
                <div className="text-xl font-black tabular-nums" style={{ color }}>
                    {data[data.length - 1].value.toFixed(1)}{unit}
                </div>
            </div>

            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`color-${entityId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#475569"
                            fontSize={9}
                            fontWeight="900"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#475569"
                            fontSize={9}
                            fontWeight="900"
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#020617',
                                border: '1px solid #1e293b',
                                borderRadius: '16px',
                                fontSize: '10px',
                                fontWeight: '900',
                                color: '#fff'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill={`url(#color-${entityId})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SensorCharts;
