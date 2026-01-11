import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Save, Trash, Edit2, ChevronLeft, Layout, Droplets, Clock, Settings2, Sliders, Monitor, Info, Timer, Activity, Power } from 'lucide-react';
import EntityPicker from './EntityPicker';

const TimeInput = ({ label, value, onChange }) => {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);

    return (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{label}</label>
            <div className="flex items-center gap-3">
                <div className="flex-1 group relative">
                    <input
                        type="number"
                        min="0"
                        value={minutes}
                        onChange={(e) => onChange((parseInt(e.target.value) || 0) * 60 + seconds)}
                        className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all text-center font-black"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-700 uppercase pointer-events-none">M</div>
                </div>
                <div className="flex-1 group relative">
                    <input
                        type="number"
                        min="0"
                        max="59"
                        value={seconds}
                        onChange={(e) => onChange(minutes * 60 + (parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all text-center font-black"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-700 uppercase pointer-events-none">S</div>
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
        setEditingRoom({
            ...editingRoom,
            zones: [...editingRoom.zones, {
                id: crypto.randomUUID(),
                name: `ZONE ${editingRoom.zones.length + 1}`,
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

    if (loading) return <div className="text-center text-slate-700 mt-20 animate-pulse font-black uppercase tracking-[0.5em] text-xs">Accessing Mainframe...</div>;

    if (!editingRoom) {
        return (
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div>
                        <h2 className="text-6xl font-black text-white tracking-tighter mb-2 uppercase italic">Room Management</h2>
                        <p className="text-slate-600 font-bold tracking-[0.2em] flex items-center gap-2 uppercase text-[10px]">
                            <Settings2 size={14} className="text-blue-500" /> Define hydraulic and photoperiod protocols
                        </p>
                    </div>
                    <button
                        onClick={startNewRoom}
                        className="group flex items-center gap-3 bg-blue-600 hover:bg-white hover:text-blue-600 px-10 py-5 rounded-[2rem] font-black transition-all duration-300 shadow-2xl shadow-blue-900/30 uppercase tracking-widest text-sm"
                    >
                        <Plus size={20} /> <span>Initialize Room</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {rooms.map(room => (
                        <div key={room.id} className={`bg-slate-900/40 border ${room.enabled ? 'border-slate-800' : 'border-red-900/40'} p-10 rounded-[3.5rem] group hover:bg-slate-900 transition-all duration-500 relative overflow-hidden backdrop-blur-2xl`}>
                            <div className="absolute top-0 right-0 p-8 text-blue-500/5 transition-all group-hover:text-blue-500/10"><Monitor size={100} /></div>
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className={`p-4 rounded-3xl ${room.enabled ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                                    <Monitor size={32} />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setEditingRoom(room)} className="p-4 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl transition-all shadow-xl active:scale-95"><Edit2 size={18} /></button>
                                    <button onClick={async () => { if (confirm('Purge room from mainframe?')) { await api.deleteRoom(room.id); loadConfig(); } }} className="p-4 bg-slate-800 hover:bg-red-600 text-white rounded-2xl transition-all shadow-xl active:scale-95"><Trash size={18} /></button>
                                </div>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tight">{room.name}</h3>
                            <div className="space-y-4 mt-8 relative z-10">
                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Zone Count</span>
                                    <span className="text-blue-400 font-black text-sm">{room.zones.length}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Protocol Type</span>
                                    <span className="text-slate-300 font-black text-[10px] uppercase tracking-widest">{room.use_fixed_schedule ? 'Fixed' : 'Adaptive'}</span>
                                </div>
                                {!room.enabled && <div className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] pt-2 text-center">System Suspended</div>}
                            </div>
                        </div>
                    ))}
                    {rooms.length === 0 && (
                        <div className="col-span-full py-32 bg-slate-900/20 border-4 border-slate-900 border-dashed rounded-[4rem] text-center">
                            <Monitor className="mx-auto text-slate-800 mb-6" size={60} />
                            <p className="text-slate-700 text-xl font-black uppercase tracking-widest">Awaiting System Initialization</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-40 px-4 animate-in fade-in slide-in-from-bottom-12 duration-700">
            <button onClick={() => setEditingRoom(null)} className="flex items-center gap-3 text-slate-600 hover:text-white mb-12 transition-all font-black uppercase tracking-[0.3em] text-xs">
                <ChevronLeft size={20} /> Abort Edit
            </button>

            <form onSubmit={handleSubmit} className="space-y-16">
                {/* Room settings */}
                <div className="bg-slate-900 p-12 rounded-[4rem] border-2 border-slate-800/50 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                    <div className="absolute top-0 right-0 p-12 text-blue-500/5 pointer-events-none"><Settings2 size={150} /></div>

                    <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                        <div className="lg:w-1/3 space-y-4">
                            <label className="text-[11px] font-black text-blue-500 tracking-[0.3em] uppercase">Room Designation</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 text-2xl font-black text-white focus:outline-none focus:border-blue-600 transition-all uppercase italic tracking-tight placeholder:text-slate-900"
                                value={editingRoom.name}
                                onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })}
                                placeholder="ENTER NAME..."
                                required
                            />
                            <div className="flex items-center gap-4 bg-slate-950 p-6 rounded-[2rem] border border-slate-800/50">
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Enabled Status</span>
                                <button
                                    type="button"
                                    onClick={() => setEditingRoom({ ...editingRoom, enabled: !editingRoom.enabled })}
                                    className={`ml-auto p-4 rounded-2xl transition-all ${editingRoom.enabled ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'bg-slate-800 text-slate-500'}`}
                                >
                                    <Power size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="lg:w-2/3 space-y-8">
                            <div className="bg-slate-950 p-8 rounded-[3rem] border-2 border-slate-800/50">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black text-white italic uppercase tracking-tight">Clock Schedule</span>
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Bypass photo-sensor based triggers</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="w-8 h-8 accent-blue-600"
                                        checked={editingRoom.use_fixed_schedule}
                                        onChange={e => setEditingRoom({ ...editingRoom, use_fixed_schedule: e.target.checked })}
                                    />
                                </div>
                                {editingRoom.use_fixed_schedule ? (
                                    <div className="grid grid-cols-2 gap-8 animate-in zoom-in-95 duration-300">
                                        <div className="flex flex-col gap-3">
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Lights On</span>
                                            <input type="time" value={editingRoom.lights_on_time} onChange={e => setEditingRoom({ ...editingRoom, lights_on_time: e.target.value })} className="bg-slate-900 p-4 rounded-2xl text-white font-black text-center border-2 border-slate-800 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Lights Off</span>
                                            <input type="time" value={editingRoom.lights_off_time} onChange={e => setEditingRoom({ ...editingRoom, lights_off_time: e.target.value })} className="bg-slate-900 p-4 rounded-2xl text-white font-black text-center border-2 border-slate-800 focus:border-blue-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="animate-in fade-in duration-300">
                                        <EntityPicker label="Photo-Sensor Switch" value={editingRoom.lights_on_entity} onChange={(val) => setEditingRoom({ ...editingRoom, lights_on_entity: val })} domain="binary_sensor" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zones Section */}
                <div className="space-y-12">
                    <div className="flex justify-between items-center px-8">
                        <h3 className="text-4xl font-black text-white flex items-center gap-6 italic tracking-tight uppercase">
                            <Droplets className="text-blue-500" size={40} /> Irrigation Zones
                        </h3>
                        <button type="button" onClick={addZone} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-[2rem] font-black transition-all shadow-2xl shadow-emerald-950/50 uppercase tracking-widest text-sm">
                            ADD ZONE
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-12">
                        {editingRoom.zones.map((zone, idx) => (
                            <div key={zone.id} className={`bg-slate-900 p-12 rounded-[4rem] border-2 ${zone.enabled ? 'border-slate-800/80 shadow-2xl' : 'border-red-900/30 grayscale'} relative group/zone transition-all duration-500`}>
                                <div className="absolute top-10 right-10 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => updateZone(idx, 'enabled', !zone.enabled)}
                                        className={`p-4 rounded-2xl transition-all ${zone.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500 text-white'}`}
                                    >
                                        <Power size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { const nz = [...editingRoom.zones]; nz.splice(idx, 1); setEditingRoom({ ...editingRoom, zones: nz }); }}
                                        className="p-4 bg-slate-950 text-slate-700 hover:text-red-500 transition-all rounded-2xl border border-slate-800"
                                    >
                                        <Trash size={20} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                                    {/* System Links */}
                                    <div className="xl:col-span-4 space-y-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-slate-950 rounded-[1.5rem] border-4 border-slate-800 flex items-center justify-center font-black text-blue-500 text-2xl shadow-inner font-mono">{idx + 1}</div>
                                            <input value={zone.name} onChange={e => updateZone(idx, 'name', e.target.value)} className="bg-transparent border-b-4 border-slate-800 text-3xl font-black focus:border-blue-600 focus:outline-none py-2 text-white w-full uppercase italic tracking-tighter" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-6">
                                            <EntityPicker label="Hydraulic Pump Control" value={zone.pump_entity} onChange={(val) => updateZone(idx, 'pump_entity', val)} domain="switch" />
                                            <EntityPicker label="Zone Solenoid Control" value={zone.valve_entity} onChange={(val) => updateZone(idx, 'valve_entity', val)} domain="switch" />
                                            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800/30">
                                                <EntityPicker label="VWC Sensor" value={zone.moisture_sensor_entity} onChange={(val) => updateZone(idx, 'moisture_sensor_entity', val)} domain="sensor" />
                                                <EntityPicker label="EC Sensor" value={zone.ec_sensor_entity} onChange={(val) => updateZone(idx, 'ec_sensor_entity', val)} domain="sensor" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hydraulic & Timing Logic */}
                                    <div className="xl:col-span-8 flex flex-col gap-12">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 bg-slate-950 p-10 rounded-[3.5rem] border-2 border-slate-800/50 shadow-inner">
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Drip Rate (Liters / H)</label>
                                                <input type="number" step="0.1" value={zone.dripper_rate_lph} onChange={e => updateZone(idx, 'dripper_rate_lph', parseFloat(e.target.value) || 0)} className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 text-white font-black text-center outline-none focus:border-blue-500 transition-all text-xl" />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Drippers / Zone</label>
                                                <input type="number" value={zone.drippers_per_zone} onChange={e => updateZone(idx, 'drippers_per_zone', parseInt(e.target.value) || 0)} className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 text-white font-black text-center outline-none focus:border-blue-500 transition-all text-xl" />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <label className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">Drippers / Plant</label>
                                                <input type="number" value={zone.drippers_per_plant} onChange={e => updateZone(idx, 'drippers_per_plant', parseInt(e.target.value) || 0)} className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 text-white font-black text-center outline-none focus:border-blue-500 transition-all text-xl" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="bg-blue-600/5 p-8 rounded-[3rem] border border-blue-600/10 space-y-8">
                                                <h5 className="text-xs font-black text-blue-400 flex items-center gap-3 tracking-[0.3em] uppercase italic"><Timer size={18} /> Phase 1 (Maintenance)</h5>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="flex flex-col gap-3">
                                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Target Shots</span>
                                                        <input type="number" value={zone.p1_shots} onChange={e => updateZone(idx, 'p1_shots', parseInt(e.target.value) || 0)} className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-white font-black text-center outline-none focus:border-blue-500" />
                                                    </div>
                                                    <TimeInput label="Shot Volume" value={zone.p1_volume_sec} onChange={(v) => updateZone(idx, 'p1_volume_sec', v)} />
                                                </div>
                                            </div>
                                            <div className="bg-orange-600/5 p-8 rounded-[3rem] border border-orange-600/10 space-y-8">
                                                <h5 className="text-xs font-black text-orange-400 flex items-center gap-3 tracking-[0.3em] uppercase italic"><Activity size={18} /> Phase 2 (Dryback)</h5>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="flex flex-col gap-3">
                                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Target Shots</span>
                                                        <input type="number" value={zone.p2_shots} onChange={e => updateZone(idx, 'p2_shots', parseInt(e.target.value) || 0)} className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-white font-black text-center outline-none focus:border-orange-500" />
                                                    </div>
                                                    <TimeInput label="Shot Volume" value={zone.p2_volume_sec} onChange={(v) => updateZone(idx, 'p2_volume_sec', v)} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-10 pt-8 border-t border-slate-800/30">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Inter-Shot Delay (ms)</span>
                                                <input type="number" value={zone.valve_delay_ms} onChange={e => updateZone(idx, 'valve_delay_ms', parseInt(e.target.value) || 0)} className="bg-slate-950 p-4 rounded-2xl text-white font-black text-center border-2 border-slate-800 w-32 focus:border-blue-600 outline-none transition-all" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Zone Stagger (min)</span>
                                                <input type="number" value={zone.stagger_minutes} onChange={e => updateZone(idx, 'stagger_minutes', parseInt(e.target.value) || 0)} className="bg-slate-950 p-4 rounded-2xl text-white font-black text-center border-2 border-slate-800 w-32 focus:border-blue-600 outline-none transition-all" />
                                            </div>
                                            <div className="ml-auto flex items-center gap-4 text-slate-700 max-w-xs text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">System automatically staggers zones in sequence to maintain hydraulic stability.</p>
                                                <Info size={24} className="flex-shrink-0" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Row */}
                <div className="flex justify-end gap-10 pt-10">
                    <button type="button" onClick={() => setEditingRoom(null)} className="px-12 py-6 rounded-3xl font-black text-slate-600 hover:text-white transition-all uppercase tracking-[0.4em] text-xs">Cancel Protocols</button>
                    <button type="submit" className="bg-blue-600 hover:bg-white hover:text-blue-600 px-20 py-7 rounded-[3rem] font-black transition-all shadow-3xl shadow-blue-900/40 text-lg uppercase tracking-[0.4em] border-2 border-transparent hover:border-blue-600">
                        COMMIT CONFIGURATION
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConfigWizard;
