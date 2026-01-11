import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Trash, Edit2, ChevronLeft, Droplets, Settings2, Monitor, Timer, Activity, Power, Info, HelpCircle } from 'lucide-react';
import EntityPicker from './EntityPicker';

// Robust ID Generator Fallback
const generateId = () => {
    try {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
    } catch (e) { }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const TimeInput = ({ label, value = 0, onChange }) => {
    const val = parseFloat(value) || 0;
    const minutes = Math.floor(val / 60);
    const seconds = Math.floor(val % 60);

    return (
        <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest italic">{label}</label>
            <div className="flex items-center gap-3">
                <div className="relative group flex-1">
                    <input
                        type="number"
                        min="0"
                        value={minutes}
                        onChange={(e) => onChange((parseInt(e.target.value) || 0) * 60 + seconds)}
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-xl text-white focus:outline-none focus:border-blue-500 transition-all text-center font-black"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700 uppercase">Min</div>
                </div>
                <div className="relative group flex-1">
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        onChange={(e) => onChange(minutes * 60 + (parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-xl text-white focus:outline-none focus:border-blue-500 transition-all text-center font-black"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-700 uppercase">Sec</div>
                </div>
            </div>
        </div>
    );
};

const ConfigWizard = () => {
    const [rooms, setRooms] = useState([]);
    const [editingRoom, setEditingRoom] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const config = await api.getConfig();
            setRooms(config.rooms || []);
        } catch (e) { console.error('Load Config Error:', e); }
        setLoading(false);
    };

    useEffect(() => { loadConfig(); }, []);

    const startNewRoom = () => {
        setEditingRoom({
            id: generateId(),
            name: '',
            enabled: true,
            use_fixed_schedule: false,
            lights_on_time: '06:00',
            lights_off_time: '18:00',
            lights_on_entity: '',
            lights_off_entity: '',
            zones: []
        });
    };

    const addZone = () => {
        if (!editingRoom) return;
        setEditingRoom({
            ...editingRoom,
            zones: [...(editingRoom.zones || []), {
                id: generateId(),
                name: `ZONE ${(editingRoom.zones || []).length + 1}`,
                enabled: true,
                pump_entity: '',
                valve_entity: '',
                p1_shots: 5,
                p2_shots: 0,
                p1_volume_sec: 10.0,
                p2_volume_sec: 10.0,
                valve_delay_ms: 100,
                stagger_minutes: 3,
                dripper_rate_lph: 2.0,
                drippers_per_zone: 6,
                drippers_per_plant: 1,
                moisture_sensor_entity: '',
                ec_sensor_entity: '',
                shots_today: 0,
                last_shot_time: null
            }]
        });
    };

    const updateZone = (index, field, value) => {
        if (!editingRoom) return;
        const newZones = [...(editingRoom.zones || [])];
        if (newZones[index]) {
            newZones[index] = { ...newZones[index], [field]: value };
            setEditingRoom({ ...editingRoom, zones: newZones });
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!editingRoom) return;
        try {
            const exists = (rooms || []).some(r => r.id === editingRoom.id);
            if (exists) await api.updateRoom(editingRoom.id, editingRoom);
            else await api.addRoom(editingRoom);
            setEditingRoom(null);
            loadConfig();
        } catch (e) {
            console.error('Submit Error:', e);
            alert('Failed to save settings. Check system logs.');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center mt-40 gap-6">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Syncing Protocols...</div>
        </div>
    );

    if (!editingRoom) {
        return (
            <div className="max-w-6xl mx-auto px-4 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div>
                        <h2 className="text-6xl font-black text-white tracking-tighter mb-2 uppercase italic leading-none">Room Management</h2>
                        <p className="text-slate-600 font-bold tracking-[0.2em] flex items-center gap-2 uppercase text-[10px] italic">
                            <Settings2 size={14} className="text-blue-500" /> Define core hydraulic and environmental parameters
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={startNewRoom}
                        className="group flex items-center gap-4 bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-6 rounded-[2.5rem] font-black transition-all duration-300 shadow-2xl shadow-blue-900/40 uppercase tracking-widest text-sm italic"
                    >
                        <Plus size={24} /> <span>New Command</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {(rooms || []).map(room => (
                        <div key={room.id} className={`bg-slate-900/40 border-2 ${room.enabled ? 'border-slate-800' : 'border-red-900/30'} p-10 rounded-[4rem] group hover:bg-slate-900 transition-all duration-500 relative overflow-hidden backdrop-blur-2xl shadow-2xl`}>
                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none transition-all group-hover:bg-blue-500/10"></div>

                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div className={`p-5 rounded-[2rem] ${room.enabled ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                    <Monitor size={32} />
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setEditingRoom(room)} className="p-4 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl transition-all shadow-xl active:scale-95 border border-slate-700 hover:border-blue-400"><Edit2 size={18} /></button>
                                    <button type="button" onClick={async (e) => { e.stopPropagation(); if (confirm('Purge room?')) { await api.deleteRoom(room.id); loadConfig(); } }} className="p-4 bg-slate-800 hover:bg-red-600 text-white rounded-2xl transition-all shadow-xl active:scale-95 border border-slate-700 hover:border-red-400"><Trash size={18} /></button>
                                </div>
                            </div>

                            <h3 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter leading-none">{room.name || 'UNNAMED'}</h3>
                            <div className="space-y-4 mt-8 relative z-10">
                                <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Zones Ready</span>
                                    <span className="text-blue-400 font-black text-lg">{(room.zones || []).length}</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-800/50">
                                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Enabled State</span>
                                    <span className={room.enabled ? 'text-emerald-500 font-black text-[10px] uppercase tracking-widest' : 'text-red-500 font-black text-[10px] uppercase tracking-widest'}>{room.enabled ? 'Active' : 'Suspended'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(rooms || []).length === 0 && (
                        <div className="col-span-full py-40 border-4 border-slate-900 border-dashed rounded-[5rem] text-center bg-slate-950/20">
                            <Droplets className="mx-auto text-slate-800 mb-8 animate-pulse" size={80} />
                            <p className="text-slate-700 text-xl font-black uppercase tracking-[0.3em] italic">Awaiting Fleet Initialization</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-40 px-6 animate-in fade-in slide-in-from-bottom-12 duration-700">
            <button type="button" onClick={() => setEditingRoom(null)} className="flex items-center gap-3 text-slate-600 hover:text-white mb-12 transition-all font-black uppercase tracking-[0.4em] text-[10px] italic">
                <ChevronLeft size={20} /> Abort Command
            </button>

            <form onSubmit={handleSubmit} className="space-y-20">
                {/* GLOBAL ROOM PROTOCOLS */}
                <div className="bg-slate-900/60 p-12 rounded-[5rem] border-2 border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                    <div className="flex flex-col lg:flex-row gap-20 items-center relative z-10">
                        <div className="lg:w-1/3 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-blue-500 tracking-[0.4em] uppercase italic px-2">Designation</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-[2.5rem] p-8 text-4xl font-black text-white focus:outline-none focus:border-blue-600 transition-all uppercase italic tracking-tighter shadow-inner"
                                    value={editingRoom.name || ''}
                                    onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })}
                                    placeholder="Room-1X..."
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-6 bg-slate-950 p-8 rounded-[2.5rem] border-2 border-slate-800/50 shadow-2xl">
                                <div className="flex-1">
                                    <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest italic mb-1">Global Power</span>
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${editingRoom.enabled ? 'text-emerald-500' : 'text-red-500'}`}>{editingRoom.enabled ? 'Operational' : 'Suspended'}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingRoom({ ...editingRoom, enabled: !editingRoom.enabled })}
                                    className={`p-6 rounded-[2rem] transition-all duration-500 shadow-xl ${editingRoom.enabled ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-red-600 text-white shadow-red-500/20'}`}
                                >
                                    <Power size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="lg:w-2/3 w-full">
                            <div className="bg-slate-950/50 p-10 rounded-[4rem] border-2 border-slate-800/50 shadow-inner">
                                <div className="flex items-center justify-between mb-10 border-b border-slate-800/30 pb-8">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-2xl font-black text-white italic uppercase tracking-tighter">Clock Schedule</span>
                                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Enable for explicit Photoperiod intervals</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditingRoom({ ...editingRoom, use_fixed_schedule: !editingRoom.use_fixed_schedule })}
                                        className={`w-16 h-16 rounded-3xl transition-all flex items-center justify-center ${editingRoom.use_fixed_schedule ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-600'}`}
                                    >
                                        <Clock size={28} />
                                    </button>
                                </div>

                                {editingRoom.use_fixed_schedule ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in zoom-in-95 duration-500">
                                        <div className="space-y-4">
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] italic px-2">Cycle Start (ON)</span>
                                            <input type="time" value={editingRoom.lights_on_time || '06:00'} onChange={e => setEditingRoom({ ...editingRoom, lights_on_time: e.target.value })} className="w-full bg-slate-950 p-6 rounded-[2rem] text-3xl text-white font-black text-center border-2 border-slate-800 focus:border-blue-500 outline-none transition-all shadow-xl" />
                                        </div>
                                        <div className="space-y-4">
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] italic px-2">Cycle Stop (OFF)</span>
                                            <input type="time" value={editingRoom.lights_off_time || '18:00'} onChange={e => setEditingRoom({ ...editingRoom, lights_off_time: e.target.value })} className="w-full bg-slate-950 p-6 rounded-[2rem] text-3xl text-white font-black text-center border-2 border-slate-800 focus:border-blue-500 outline-none transition-all shadow-xl" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in duration-500 max-w-xl mx-auto">
                                        <EntityPicker label="Photo-Sensor Reference Entity" value={editingRoom.lights_on_entity || ''} onChange={(val) => setEditingRoom({ ...editingRoom, lights_on_entity: val })} domain="binary_sensor" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* HYDRAULIC COMMAND CENTER */}
                <div className="space-y-20">
                    <div className="flex justify-between items-center px-12">
                        <div className="space-y-2">
                            <h3 className="text-5xl font-black text-white flex items-center gap-6 italic tracking-tighter uppercase leading-none">
                                <Droplets className="text-blue-500 animate-pulse" size={50} /> Zone Protocols
                            </h3>
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic pl-2">Configure independent irrigation segments</span>
                        </div>
                        <button type="button" onClick={addZone} className="group bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-12 py-6 rounded-[2.5rem] font-black transition-all shadow-2xl shadow-blue-500/20 uppercase tracking-widest text-sm italic flex items-center gap-3">
                            <Plus size={20} /> Add Zone
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-20">
                        {(editingRoom.zones || []).map((zone, idx) => (
                            <div key={zone.id} className={`bg-slate-900/80 p-16 rounded-[6rem] border-2 ${zone.enabled ? 'border-slate-800/80' : 'border-red-900/20 grayscale shadow-inner'} relative transition-all duration-700 shadow-[0_40px_100px_rgba(0,0,0,0.5)]`}>
                                <div className="absolute top-12 right-12 flex gap-6 z-20">
                                    <button
                                        type="button"
                                        onClick={() => updateZone(idx, 'enabled', !zone.enabled)}
                                        className={`p-6 rounded-[2rem] transition-all duration-500 shadow-xl border-2 ${zone.enabled ? 'bg-blue-600 border-blue-400 text-white shadow-blue-500/20' : 'bg-red-600 border-red-400 text-white shadow-red-500/20'}`}
                                    >
                                        <Power size={24} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { const nz = [...(editingRoom.zones || [])]; nz.splice(idx, 1); setEditingRoom({ ...editingRoom, zones: nz }); }}
                                        className="p-6 bg-slate-950 text-slate-700 hover:text-red-500 transition-all rounded-[2rem] border-2 border-slate-800 hover:border-red-500/50 shadow-xl"
                                    >
                                        <Trash size={24} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-20">
                                    {/* IDENTITY & HARDWARE */}
                                    <div className="xl:col-span-4 space-y-12">
                                        <div className="flex items-center gap-8 border-b-2 border-slate-800 pb-8">
                                            <div className="w-20 h-20 bg-slate-950 rounded-[2rem] border-4 border-slate-800 flex items-center justify-center font-black text-blue-500 text-3xl shadow-inner italic font-mono">0{idx + 1}</div>
                                            <input value={zone.name || ''} onChange={e => updateZone(idx, 'name', e.target.value)} className="bg-transparent text-5xl font-black focus:outline-none py-2 text-white w-full uppercase italic tracking-tighter placeholder:text-slate-800" placeholder="ZONE_NAME" />
                                        </div>
                                        <div className="space-y-10">
                                            <div className="space-y-8">
                                                <EntityPicker label="Primary Pump Link" value={zone.pump_entity || ''} onChange={(val) => updateZone(idx, 'pump_entity', val)} domain="switch" placeholder="Select output..." />
                                                <EntityPicker label="Zone Valving Link" value={zone.valve_entity || ''} onChange={(val) => updateZone(idx, 'valve_entity', val)} domain="switch" placeholder="Optional valving..." />
                                            </div>
                                            <div className="grid grid-cols-1 gap-8 pt-10 border-t border-slate-800/50">
                                                <EntityPicker label="Substrate VWC" value={zone.moisture_sensor_entity || ''} onChange={(val) => updateZone(idx, 'moisture_sensor_entity', val)} domain="sensor" />
                                                <EntityPicker label="Pore EC Sensor" value={zone.ec_sensor_entity || ''} onChange={(val) => updateZone(idx, 'ec_sensor_entity', val)} domain="sensor" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SHOT LOGIC & PARAMETERS */}
                                    <div className="xl:col-span-8 flex flex-col gap-12">
                                        {/* TOP ROW: DRIP MATH */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 bg-slate-950/80 p-12 rounded-[4rem] border-2 border-slate-800/80 shadow-inner">
                                            <div className="flex flex-col gap-4">
                                                <label className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase italic px-2">Drip Rate (Liters / H)</label>
                                                <input type="number" step="0.1" value={zone.dripper_rate_lph || 0} onChange={e => updateZone(idx, 'dripper_rate_lph', parseFloat(e.target.value) || 0)} className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 text-3xl text-white font-black text-center focus:border-blue-500 transition-all outline-none" />
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <label className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase italic px-2">Units / Zone</label>
                                                <input type="number" value={zone.drippers_per_zone || 0} onChange={e => updateZone(idx, 'drippers_per_zone', parseInt(e.target.value) || 0)} className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 text-3xl text-white font-black text-center focus:border-blue-500 transition-all outline-none" />
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <label className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase italic px-2">Units / Plant</label>
                                                <input type="number" value={zone.drippers_per_plant || 0} onChange={e => updateZone(idx, 'drippers_per_plant', parseInt(e.target.value) || 0)} className="bg-slate-900 border-2 border-slate-800 rounded-[2rem] p-6 text-3xl text-white font-black text-center focus:border-blue-500 transition-all outline-none" />
                                            </div>
                                        </div>

                                        {/* PHASES */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="bg-blue-600/5 p-10 rounded-[4rem] border-2 border-blue-500/10 space-y-10 relative overflow-hidden group/p1">
                                                <h5 className="text-sm font-black text-blue-400 flex items-center gap-4 tracking-[0.3em] uppercase italic relative z-10"><Timer size={24} /> P1: Maintenance</h5>
                                                <div className="grid grid-cols-2 gap-8 relative z-10">
                                                    <div className="flex flex-col gap-4">
                                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic px-2">Targets</span>
                                                        <div className="relative">
                                                            <input type="number" value={zone.p1_shots || 0} onChange={e => updateZone(idx, 'p1_shots', parseInt(e.target.value) || 0)} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 text-2xl text-white font-black text-center focus:border-blue-500 outline-none transition-all" />
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-800 uppercase">Shots</div>
                                                        </div>
                                                    </div>
                                                    <TimeInput label="Shot Duration" value={zone.p1_volume_sec || 0} onChange={(v) => updateZone(idx, 'p1_volume_sec', v)} />
                                                </div>
                                            </div>

                                            <div className="bg-orange-600/5 p-10 rounded-[4rem] border-2 border-orange-500/10 space-y-10 relative overflow-hidden group/p2">
                                                <h5 className="text-sm font-black text-orange-400 flex items-center gap-4 tracking-[0.3em] uppercase italic relative z-10"><Activity size={24} /> P2: Dryback</h5>
                                                <div className="grid grid-cols-2 gap-8 relative z-10">
                                                    <div className="flex flex-col gap-4">
                                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic px-2">Targets</span>
                                                        <div className="relative">
                                                            <input type="number" value={zone.p2_shots || 0} onChange={e => updateZone(idx, 'p2_shots', parseInt(e.target.value) || 0)} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 text-2xl text-white font-black text-center focus:border-orange-500 outline-none transition-all" />
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-800 uppercase">Shots</div>
                                                        </div>
                                                    </div>
                                                    <TimeInput label="Shot Duration" value={zone.p2_volume_sec || 0} onChange={(v) => updateZone(idx, 'p2_volume_sec', v)} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* FOOTER: DELAYS */}
                                        <div className="flex flex-wrap items-center gap-12 pt-12 border-t-2 border-slate-800/30">
                                            <div className="flex flex-col gap-4">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic px-2">Interlock Delay (ms)</span>
                                                <div className="relative">
                                                    <input type="number" value={zone.valve_delay_ms || 0} onChange={e => updateZone(idx, 'valve_delay_ms', parseInt(e.target.value) || 0)} className="bg-slate-950 border-2 border-slate-800 rounded-[1.5rem] p-5 text-xl text-white font-black text-center w-40 focus:border-blue-500 outline-none transition-all" />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-800 uppercase">ms</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-4">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic px-2">Sequential Stagger (m)</span>
                                                <div className="relative">
                                                    <input type="number" value={zone.stagger_minutes || 0} onChange={e => updateZone(idx, 'stagger_minutes', parseInt(e.target.value) || 0)} className="bg-slate-950 border-2 border-slate-800 rounded-[1.5rem] p-5 text-xl text-white font-black text-center w-40 focus:border-blue-500 outline-none transition-all" />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-800 uppercase">min</div>
                                                </div>
                                            </div>
                                            <div className="flex-1 flex items-start gap-4 p-6 bg-slate-950 rounded-[2rem] border border-slate-800/50">
                                                <HelpCircle size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-[10px] leading-relaxed text-slate-600 font-bold uppercase tracking-widest italic">The system automatically calculates and applies staggering offsets to maintain hydraulic stability across all active zones in this command.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COMMAND ACTION ROW */}
                <div className="flex justify-between items-center bg-slate-900 p-12 rounded-[5rem] border-4 border-slate-800 shadow-2xl sticky bottom-10 z-[50]">
                    <button type="button" onClick={() => setEditingRoom(null)} className="px-10 py-5 rounded-full font-black text-slate-600 hover:text-white transition-all uppercase tracking-[0.6em] text-[11px] italic">Discard Data</button>
                    <button type="submit" className="bg-blue-600 hover:bg-white hover:text-blue-600 px-24 py-8 rounded-[2.5rem] font-black transition-all shadow-3xl shadow-blue-500/40 text-2xl uppercase tracking-[0.5em] italic border-4 border-transparent hover:border-blue-600 active:scale-95">
                        Commit Protocols
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConfigWizard;
