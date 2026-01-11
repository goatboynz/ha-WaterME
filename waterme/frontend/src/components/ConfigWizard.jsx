import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
    Plus,
    Trash,
    Edit2,
    ChevronLeft,
    Droplets,
    Settings2,
    Monitor,
    Timer,
    Activity,
    Power,
    Clock,
    HelpCircle,
    ChevronRight,
    Search,
    ShieldCheck,
    Cpu,
    Zap
} from 'lucide-react';
import EntityPicker from './EntityPicker';

// Robust ID Generator Fallback
const generateId = () => {
    try {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) { }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const TimeInput = ({ label, value = 0, onChange }) => {
    const val = parseFloat(value) || 0;
    const minutes = Math.floor(val / 60);
    const seconds = Math.floor(val % 60);

    return (
        <div className="flex flex-col gap-3">
            <label className="text-[9px] uppercase font-black text-slate-700 tracking-[0.2em] italic">{label}</label>
            <div className="flex items-center gap-2">
                <div className="relative flex-1 group">
                    <input
                        type="number"
                        min="0"
                        value={minutes}
                        onChange={(e) => onChange((parseInt(e.target.value) || 0) * 60 + seconds)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-lg text-white focus:outline-none focus:border-orange-500 transition-all text-center font-black italic tracking-tighter"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-800 uppercase tracking-widest">MIN</div>
                </div>
                <div className="relative flex-1 group">
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        onChange={(e) => onChange(minutes * 60 + (parseInt(e.target.value) || 0))}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-lg text-white focus:outline-none focus:border-orange-500 transition-all text-center font-black italic tracking-tighter"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-800 uppercase tracking-widest">SEC</div>
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
            alert('PROTOCOL FAILURE: Check System Mainframe Logs');
        }
    };

    if (loading) return null;

    if (!editingRoom) {
        return (
            <div className="py-6 flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Vault Management</h2>
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] italic">Configuration core for hydraulic and light cycle protocols</p>
                    </div>
                    <button
                        type="button"
                        onClick={startNewRoom}
                        className="group flex items-center gap-4 bg-orange-500 hover:bg-white text-black px-10 py-4 rounded-[1.5rem] font-black transition-all duration-300 shadow-2xl shadow-orange-500/20 uppercase tracking-widest text-xs italic active:scale-95"
                    >
                        <Plus size={18} /> <span>Initialize New Room</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(rooms || []).map(room => (
                        <div key={room.id} className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] group hover:bg-white/[0.03] transition-all duration-500 relative flex flex-col justify-between h-64 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] pointer-events-none transition-all group-hover:bg-orange-500/10"></div>

                            <div className="flex justify-between items-start relative z-10">
                                <div className={`p-4 rounded-2xl border ${room.enabled ? 'bg-orange-500/5 text-orange-500 border-orange-500/20' : 'bg-red-500/5 text-red-500 border-red-500/20'}`}>
                                    <Cpu size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingRoom(room)} className="p-3 bg-white/5 hover:bg-orange-500 hover:text-black text-slate-500 rounded-xl transition-all border border-white/5 active:scale-90"><Edit2 size={16} /></button>
                                    <button onClick={async (e) => { e.stopPropagation(); if (confirm('PURGE ENTITY?')) { await api.deleteRoom(room.id); loadConfig(); } }} className="p-3 bg-white/5 hover:bg-red-600 hover:text-white text-slate-500 rounded-xl transition-all border border-white/5 active:scale-90"><Trash size={16} /></button>
                                </div>
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div>
                                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-2">{room.name || 'UNLISTED'}</h3>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${room.enabled ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500'}`}></div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest italic ${room.enabled ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {room.enabled ? 'Operational' : 'Vault Locked'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-6 border-t border-white/[0.03]">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-700 uppercase italic">Sub-Zones</span>
                                        <span className="text-xl font-black text-white italic">{(room.zones || []).length}</span>
                                    </div>
                                    <div className="flex flex-col items-end text-right">
                                        <span className="text-[10px] font-black text-slate-700 uppercase italic">Control Type</span>
                                        <span className="text-lg font-black text-slate-300 italic uppercase leading-none mt-1">
                                            {room.use_fixed_schedule ? 'Clock' : 'Sensor'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(rooms || []).length === 0 && (
                        <div className="col-span-full py-40 bg-white/[0.01] border-2 border-white/5 border-dashed rounded-[3rem] text-center flex flex-col items-center gap-6 group hover:bg-white/[0.02] transition-all cursor-pointer" onClick={startNewRoom}>
                            <Droplets className="text-slate-900 group-hover:text-orange-500 transition-colors animate-pulse" size={64} />
                            <p className="text-slate-800 text-sm font-black uppercase italic tracking-[0.3em] group-hover:text-slate-700 transition-colors">Initialize Mainframe Protocols</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-[2rem]">
                <button type="button" onClick={() => setEditingRoom(null)} className="flex items-center gap-3 text-slate-500 hover:text-white transition-all font-black uppercase tracking-[0.3em] text-[10px] italic px-6 py-2 border-r border-white/5">
                    <ChevronLeft size={16} /> Abort Sync
                </button>
                <div className="flex-1 px-10">
                    <span className="text-xs font-black text-orange-500 italic uppercase">Modifying: </span>
                    <span className="text-xs font-black text-white italic uppercase tracking-widest ml-2">{editingRoom.name || 'NEW_PROTOCOL'}</span>
                </div>
                <div className="flex items-center gap-4 px-6 border-l border-white/5">
                    <span className="text-[9px] font-black text-slate-700 uppercase italic">Room Power</span>
                    <button
                        type="button"
                        onClick={() => setEditingRoom({ ...editingRoom, enabled: !editingRoom.enabled })}
                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${editingRoom.enabled ? 'bg-orange-500' : 'bg-slate-900'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${editingRoom.enabled ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* ROOM SPECIFICATIONS SIDEBAR */}
                <div className="lg:col-span-4 space-y-12">
                    <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] space-y-10">
                        <div className="space-y-4">
                            <label className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] italic px-1">Designation</label>
                            <input
                                type="text"
                                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 text-2xl font-black text-white focus:outline-none focus:border-orange-500 transition-all uppercase italic tracking-tighter"
                                value={editingRoom.name || ''}
                                onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })}
                                placeholder="PROTOCOL_NAME_ID"
                                required
                            />
                        </div>

                        <div className="space-y-8 bg-white/[0.01] p-8 rounded-[2rem] border border-white/5">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/[0.03]">
                                <h5 className="text-[10px] font-black text-white italic uppercase tracking-[0.2em]">Photoperiod</h5>
                                <button
                                    type="button"
                                    onClick={() => setEditingRoom({ ...editingRoom, use_fixed_schedule: !editingRoom.use_fixed_schedule })}
                                    className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest italic border transition-all ${editingRoom.use_fixed_schedule ? 'bg-orange-500 text-black border-orange-500' : 'text-slate-600 border-white/5'}`}
                                >
                                    {editingRoom.use_fixed_schedule ? 'Clock Based' : 'Sensor Linked'}
                                </button>
                            </div>

                            {editingRoom.use_fixed_schedule ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-700 uppercase italic">On Time</span>
                                        <input type="time" value={editingRoom.lights_on_time || '06:00'} onChange={e => setEditingRoom({ ...editingRoom, lights_on_time: e.target.value })} className="bg-white/5 text-white font-black italic rounded-lg px-4 py-2 focus:outline-none focus:text-orange-500" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-700 uppercase italic">Off Time</span>
                                        <input type="time" value={editingRoom.lights_off_time || '18:00'} onChange={e => setEditingRoom({ ...editingRoom, lights_off_time: e.target.value })} className="bg-white/5 text-white font-black italic rounded-lg px-4 py-2 focus:outline-none focus:text-orange-500" />
                                    </div>
                                </div>
                            ) : (
                                <EntityPicker label="Signature Source" value={editingRoom.lights_on_entity || ''} onChange={(val) => setEditingRoom({ ...editingRoom, lights_on_entity: val })} domain="binary_sensor" />
                            )}
                        </div>

                        <div className="bg-orange-500/5 p-6 rounded-2xl border border-orange-500/10 flex items-start gap-4">
                            <ShieldCheck className="text-orange-500 shrink-0" size={18} />
                            <p className="text-[9px] leading-relaxed text-orange-200/50 font-black uppercase tracking-widest italic">All protocols are local-first and synchronized with the HA core every 2.0 seconds.</p>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] flex flex-col gap-8">
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-black text-white italic uppercase tracking-[0.2em]">Hydraulic Segments</h4>
                            <span className="text-xl font-black text-orange-500 italic">{(editingRoom.zones || []).length}</span>
                        </div>
                        <button type="button" onClick={addZone} className="w-full bg-[#0d0d0d] hover:bg-white hover:text-black border border-white/5 p-6 rounded-[1.5rem] transition-all duration-300 font-black italic uppercase tracking-widest text-xs flex items-center justify-center gap-4 active:scale-95 shadow-2xl">
                            <Plus size={18} /> Append Zone
                        </button>
                    </div>

                    <button type="submit" className="w-full bg-white hover:bg-orange-500 text-black py-8 rounded-[2.5rem] font-black italic uppercase tracking-[0.4em] text-sm transition-all shadow-3xl shadow-white/10 active:scale-95 border-b-8 border-slate-300 hover:border-orange-600">
                        Commit Protocols
                    </button>
                </div>

                {/* ZONE CONFIGURATION MAIN AREA */}
                <div className="lg:col-span-8 flex flex-col gap-12">
                    {(editingRoom.zones || []).map((zone, idx) => (
                        <div key={zone.id} className={`bg-white/[0.02] border border-white/5 p-12 rounded-[4rem] group relative transition-all duration-500 hover:bg-white/[0.03] ${!zone.enabled ? 'grayscale opacity-60' : ''}`}>
                            <div className="absolute top-10 right-10 flex gap-4 z-20">
                                <button type="button" onClick={() => updateZone(idx, 'enabled', !zone.enabled)} className={`p-4 rounded-2xl transition-all shadow-xl border ${zone.enabled ? 'bg-orange-500 text-black border-orange-400' : 'bg-slate-900 text-slate-700 border-white/5'}`}><Power size={20} /></button>
                                <button type="button" onClick={() => { const nz = [...(editingRoom.zones || [])]; nz.splice(idx, 1); setEditingRoom({ ...editingRoom, zones: nz }); }} className="p-4 bg-white/5 text-slate-700 hover:text-red-500 transition-all rounded-2xl border border-white/5 shadow-xl active:scale-90"><Trash size={20} /></button>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                                <div className="xl:col-span-5 space-y-10">
                                    <div className="flex items-center gap-8 border-b border-white/[0.03] pb-10">
                                        <div className="w-16 h-16 bg-[#0a0a0a] rounded-2xl border border-white/10 flex items-center justify-center font-black text-orange-500 text-xl italic shadow-inner">0{idx + 1}</div>
                                        <input value={zone.name || ''} onChange={e => updateZone(idx, 'name', e.target.value)} className="bg-transparent text-4xl font-black focus:outline-none py-2 text-white w-full uppercase italic tracking-tighter placeholder:text-slate-900" placeholder="ZONE_ALIAS" />
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-6">
                                            <EntityPicker label="Pump Control" value={zone.pump_entity || ''} onChange={(val) => updateZone(idx, 'pump_entity', val)} domain="switch" />
                                            <EntityPicker label="Valve Control" value={zone.valve_entity || ''} onChange={(val) => updateZone(idx, 'valve_entity', val)} domain="switch" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 pt-10 border-t border-white/[0.03]">
                                            <EntityPicker label="VWC Telemetry" value={zone.moisture_sensor_entity || ''} onChange={(val) => updateZone(idx, 'moisture_sensor_entity', val)} domain="sensor" />
                                            <EntityPicker label="EC Telemetry" value={zone.ec_sensor_entity || ''} onChange={(val) => updateZone(idx, 'ec_sensor_entity', val)} domain="sensor" />
                                        </div>
                                    </div>
                                </div>

                                <div className="xl:col-span-7 flex flex-col gap-10">
                                    <div className="grid grid-cols-3 gap-6 bg-[#070707] p-8 rounded-[3rem] border border-white/5">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic text-center">LPH Rate</label>
                                            <input type="number" step="0.1" value={zone.dripper_rate_lph || 0} onChange={e => updateZone(idx, 'dripper_rate_lph', parseFloat(e.target.value) || 0)} className="bg-white/5 border border-white/5 rounded-2xl p-5 text-xl text-white font-black text-center focus:border-orange-500 transition-all outline-none italic" />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic text-center">Units/Zone</label>
                                            <input type="number" value={zone.drippers_per_zone || 0} onChange={e => updateZone(idx, 'drippers_per_zone', parseInt(e.target.value) || 0)} className="bg-white/5 border border-white/5 rounded-2xl p-5 text-xl text-white font-black text-center focus:border-orange-500 transition-all outline-none italic" />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic text-center">Units/Plant</label>
                                            <input type="number" value={zone.drippers_per_plant || 0} onChange={e => updateZone(idx, 'drippers_per_plant', parseInt(e.target.value) || 0)} className="bg-white/5 border border-white/5 rounded-2xl p-5 text-xl text-white font-black text-center focus:border-orange-500 transition-all outline-none italic" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-orange-500/[0.03] p-8 rounded-[3rem] border border-orange-500/10 flex flex-col gap-8">
                                            <div className="flex items-center gap-3 text-[9px] font-black text-orange-500 uppercase tracking-widest italic leading-none border-b border-orange-500/10 pb-4">
                                                <Timer size={14} /> P1: Build Phase
                                            </div>
                                            <div className="space-y-6">
                                                <div className="flex flex-col gap-3">
                                                    <span className="text-[8px] font-black text-slate-700 uppercase italic tracking-widest">Target Shots</span>
                                                    <div className="relative">
                                                        <input type="number" value={zone.p1_shots || 0} onChange={e => updateZone(idx, 'p1_shots', parseInt(e.target.value) || 0)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl p-4 text-lg text-white font-black text-center focus:border-orange-500 outline-none transition-all italic" />
                                                    </div>
                                                </div>
                                                <TimeInput label="Volume Sec" value={zone.p1_volume_sec || 0} onChange={(v) => updateZone(idx, 'p1_volume_sec', v)} />
                                            </div>
                                        </div>

                                        <div className="bg-purple-500/[0.03] p-8 rounded-[3rem] border border-purple-500/10 flex flex-col gap-8">
                                            <div className="flex items-center gap-3 text-[9px] font-black text-purple-500 uppercase tracking-widest italic leading-none border-b border-purple-500/10 pb-4">
                                                <Activity size={14} /> P2: Dryback
                                            </div>
                                            <div className="space-y-6">
                                                <div className="flex flex-col gap-3">
                                                    <span className="text-[8px] font-black text-slate-700 uppercase italic tracking-widest">Target Shots</span>
                                                    <div className="relative">
                                                        <input type="number" value={zone.p2_shots || 0} onChange={e => updateZone(idx, 'p2_shots', parseInt(e.target.value) || 0)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl p-4 text-lg text-white font-black text-center focus:border-purple-500 outline-none transition-all italic" />
                                                    </div>
                                                </div>
                                                <TimeInput label="Volume Sec" value={zone.p2_volume_sec || 0} onChange={(v) => updateZone(idx, 'p2_volume_sec', v)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 pt-10 border-t border-white/[0.03]">
                                        <div className="flex-1 flex flex-col gap-2">
                                            <span className="text-[9px] font-black text-slate-700 uppercase italic tracking-widest">Delay ms</span>
                                            <input type="number" value={zone.valve_delay_ms || 0} onChange={e => updateZone(idx, 'valve_delay_ms', parseInt(e.target.value) || 0)} className="bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white font-black text-center focus:border-orange-500" />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <span className="text-[9px] font-black text-slate-700 uppercase italic tracking-widest">Stagger min</span>
                                            <input type="number" value={zone.stagger_minutes || 0} onChange={e => updateZone(idx, 'stagger_minutes', parseInt(e.target.value) || 0)} className="bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-white font-black text-center focus:border-orange-500" />
                                        </div>
                                        <div className="flex-[2] bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
                                            <HelpCircle size={14} className="text-orange-500 shrink-0" />
                                            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-normal">Smart-offsetting will be applied to prevent hydraulic saturation during concurrent execution.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="py-20 flex flex-col items-center justify-center border-2 border-white/5 border-dashed rounded-[4rem] group hover:bg-white/[0.01] transition-all cursor-pointer" onClick={addZone}>
                        <div className="p-6 bg-white/5 rounded-full border border-white/5 group-hover:bg-orange-500 group-hover:text-black transition-all mb-6">
                            <Plus size={32} />
                        </div>
                        <span className="text-xs font-black text-slate-800 uppercase italic tracking-[0.4em] group-hover:text-slate-500 transition-colors">Append Hydraulic Command Segment</span>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ConfigWizard;
