import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Save, Trash, Edit2, ChevronLeft, Layout, Droplets, Clock, Settings2, Sliders, Monitor, Info } from 'lucide-react';
import EntityPicker from './EntityPicker';

const TimeInput = ({ label, value, onChange }) => {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{label}</label>
            <div className="flex items-center gap-2">
                <div className="flex-1 group relative">
                    <input
                        type="number"
                        min="0"
                        value={minutes}
                        onChange={(e) => onChange((parseInt(e.target.value) || 0) * 60 + seconds)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center font-bold"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600 uppercase pointer-events-none">Min</div>
                </div>
                <div className="flex-1 group relative">
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        onChange={(e) => onChange(minutes * 60 + (parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center font-bold"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600 uppercase pointer-events-none">Sec</div>
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
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { loadConfig(); }, []);

    const startNewRoom = () => {
        setEditingRoom({
            id: crypto.randomUUID(),
            name: '',
            lights_on_entity: '',
            lights_off_entity: '',
            zones: []
        });
    };

    const addZone = () => {
        setEditingRoom({
            ...editingRoom,
            zones: [...editingRoom.zones, {
                id: crypto.randomUUID(),
                name: `Zone ${editingRoom.zones.length + 1}`,
                pump_entity: '',
                valve_entity: '',
                p1_shots: 5,
                p2_shots: 0,
                p1_volume_sec: 10.0,
                p2_volume_sec: 10.0,
                valve_delay_ms: 100,
                stagger_minutes: 3,
                shots_today: 0,
                last_shot_time: null
            }]
        });
    };

    const updateZone = (index, field, value) => {
        const newZones = [...editingRoom.zones];
        newZones[index] = { ...newZones[index], [field]: value };
        setEditingRoom({ ...editingRoom, zones: newZones });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const exists = rooms.some(r => r.id === editingRoom.id);
            if (exists) await api.updateRoom(editingRoom.id, editingRoom);
            else await api.addRoom(editingRoom);
            setEditingRoom(null);
            loadConfig();
        } catch (e) { alert('Failed to save settings'); }
    };

    if (loading) return <div className="text-center text-slate-500 mt-20 animate-pulse">Loading System Config...</div>;

    if (!editingRoom) {
        return (
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h2 className="text-5xl font-black text-white tracking-tight mb-2">Room Management</h2>
                        <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
                            <Settings2 size={16} /> Configure your grow rooms and irrigation zones
                        </p>
                    </div>
                    <button
                        onClick={startNewRoom}
                        className="group flex items-center gap-3 bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-4 rounded-3xl font-black transition-all duration-300 shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.2)]"
                    >
                        <Plus size={24} /> <span>ADD NEW ROOM</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.length === 0 ? (
                        <div className="md:col-span-3 text-center p-20 bg-slate-900/20 border-4 border-slate-900/50 border-dashed rounded-[3rem]">
                            <Layout className="mx-auto text-slate-800 mb-6" size={64} />
                            <p className="text-slate-500 text-xl font-bold">No rooms found. Let's build your first irrigation setup.</p>
                        </div>
                    ) : (
                        rooms.map(room => (
                            <div key={room.id} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] group hover:bg-slate-900 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-blue-500/10 p-4 rounded-2xl">
                                        <Monitor className="text-blue-500" size={32} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingRoom(room)} className="p-3 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl transition-all shadow-lg active:scale-95"><Edit2 size={20} /></button>
                                        <button onClick={async () => { if (confirm('Delete?')) { await api.deleteRoom(room.id); loadConfig(); } }} className="p-3 bg-slate-800 hover:bg-red-600 text-white rounded-2xl transition-all shadow-lg active:scale-95"><Trash size={20} /></button>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">{room.name}</h3>
                                <div className="space-y-3 mt-6">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Active Zones</span>
                                        <span className="text-blue-400 font-black">{room.zones.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Master Sensor</span>
                                        <span className="text-slate-300 font-mono text-[10px] truncate max-w-[120px]">{room.lights_on_entity}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-40 px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <button onClick={() => setEditingRoom(null)} className="flex items-center gap-2 text-slate-500 hover:text-white mb-10 transition-all font-bold px-4 py-2 rounded-full hover:bg-slate-900">
                <ChevronLeft size={24} /> BACK TO OVERVIEW
            </button>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Room Header Card */}
                <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-slate-800 opacity-20"><Settings2 size={120} /></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-10 items-end">
                        <div className="flex-1 space-y-2 w-full">
                            <label className="text-xs uppercase font-black text-blue-500 tracking-[0.2em] ml-1">Room Identity</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-3xl p-6 text-2xl font-black text-white focus:outline-none focus:border-blue-600 transition-all placeholder:text-slate-800"
                                value={editingRoom.name}
                                onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })}
                                placeholder="ENTER ROOM NAME..."
                                required
                            />
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                            <EntityPicker label="LIGHTS ON SENSOR" value={editingRoom.lights_on_entity} onChange={(val) => setEditingRoom({ ...editingRoom, lights_on_entity: val })} domain="binary_sensor" />
                            <EntityPicker label="STATUS SENSOR (OPT)" value={editingRoom.lights_off_entity} onChange={(val) => setEditingRoom({ ...editingRoom, lights_off_entity: val })} domain="binary_sensor" />
                        </div>
                    </div>
                </div>

                {/* Zones Section */}
                <div className="space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <h3 className="text-3xl font-black text-white flex items-center gap-4">
                            <Droplets className="text-emerald-500" /> ZONE CONFIGURATION
                        </h3>
                        <button type="button" onClick={addZone} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-emerald-950/50">
                            <Plus size={20} /> ADD ZONE
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {editingRoom.zones.map((zone, idx) => (
                            <div key={zone.id} className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 relative group/zone shadow-xl hover:shadow-2xl transition-all duration-500">
                                <button type="button" onClick={() => { const nz = [...editingRoom.zones]; nz.splice(idx, 1); setEditingRoom({ ...editingRoom, zones: nz }); }} className="absolute顶-6 right-6 p-4 text-slate-700 hover:text-red-500 transition-all"><Trash size={24} /></button>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Left Info */}
                                    <div className="lg:col-span-4 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-500 text-xl">{idx + 1}</div>
                                            <input value={zone.name} onChange={e => updateZone(idx, 'name', e.target.value)} className="bg-transparent border-b-2 border-slate-800 text-xl font-black focus:border-blue-600 focus:outline-none py-2 text-white" />
                                        </div>
                                        <div className="space-y-4 pt-4">
                                            <EntityPicker label="PUMP CONTROL" value={zone.pump_entity} onChange={(val) => updateZone(idx, 'pump_entity', val)} domain="switch" />
                                            <EntityPicker label="VALVE CONTROL (OPT)" value={zone.valve_entity} onChange={(val) => updateZone(idx, 'valve_entity', val)} domain="switch" />
                                        </div>
                                    </div>

                                    {/* Right Settings */}
                                    <div className="lg:col-span-8 flex flex-col gap-8">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-950/50 p-8 rounded-[2rem] border border-slate-800/50">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest">Zone Delay (ms)</label>
                                                <input type="number" value={zone.valve_delay_ms} onChange={e => updateZone(idx, 'valve_delay_ms', parseInt(e.target.value) || 0)} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-bold text-center focus:border-blue-500 focus:outline-none" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest">Stagger (min)</label>
                                                <input type="number" value={zone.stagger_minutes} onChange={e => updateZone(idx, 'stagger_minutes', parseInt(e.target.value) || 0)} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-bold text-center focus:border-blue-500 focus:outline-none" />
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 text-[10px] leading-tight font-bold pt-4 px-2">
                                                <Info size={14} className="flex-shrink-0" />
                                                <span>STAGGER PREVENTS MULTIPLE ZONES RUNNING SIMULTANEOUSLY.</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <h5 className="text-[10px] font-black text-blue-500 flex items-center gap-2"><Sliders size={12} /> MAINTENANCE (P1)</h5>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-[10px] font-black text-slate-500 racking-widest">SHOTS</label>
                                                        <input type="number" value={zone.p1_shots} onChange={e => updateZone(idx, 'p1_shots', parseInt(e.target.value) || 0)} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white font-bold text-center focus:border-blue-500 focus:outline-none" />
                                                    </div>
                                                    <TimeInput label="DURATION" value={zone.p1_volume_sec} onChange={(v) => updateZone(idx, 'p1_volume_sec', v)} />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h5 className="text-[10px] font-black text-orange-500 flex items-center gap-2"><Sliders size={12} /> DRYBACK (P2)</h5>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-[10px] font-black text-slate-500 racking-widest">SHOTS</label>
                                                        <input type="number" value={zone.p2_shots} onChange={e => updateZone(idx, 'p2_shots', parseInt(e.target.value) || 0)} className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white font-bold text-center focus:border-blue-500 focus:outline-none" />
                                                    </div>
                                                    <TimeInput label="DURATION" value={zone.p2_volume_sec} onChange={(v) => updateZone(idx, 'p2_volume_sec', v)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-6 pt-10">
                    <button type="button" onClick={() => setEditingRoom(null)} className="px-10 py-5 rounded-3xl font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest text-sm">Cancel</button>
                    <button type="submit" className="group flex items-center gap-3 bg-blue-600 hover:bg-white hover:text-blue-600 px-12 py-5 rounded-[2.5rem] font-black transition-all duration-300 shadow-[0_20px_50px_rgba(59,130,246,0.3)] uppercase tracking-wider">
                        <Save size={24} /> <span>SAVE CONFIGURATION</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConfigWizard;
