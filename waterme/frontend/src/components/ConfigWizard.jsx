import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Save, Trash, Edit2, ChevronLeft, Layout, Droplets } from 'lucide-react';
import EntityPicker from './EntityPicker';

const ConfigWizard = () => {
    const [rooms, setRooms] = useState([]);
    const [editingRoom, setEditingRoom] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const config = await api.getConfig();
            setRooms(config.rooms || []);
        } catch (e) {
            console.error('Failed to load config:', e);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const startNewRoom = () => {
        setEditingRoom({
            id: crypto.randomUUID(),
            name: '',
            lights_on_entity: '',
            lights_off_entity: '',
            zones: []
        });
    };

    const editRoom = (room) => {
        setEditingRoom(JSON.parse(JSON.stringify(room)));
    };

    const addZone = () => {
        setEditingRoom({
            ...editingRoom,
            zones: [...editingRoom.zones, {
                id: crypto.randomUUID(),
                name: `Zone ${editingRoom.zones.length + 1}`,
                valve_entity: '',
                pump_entity: '',
                p1_shots: 5,
                p2_shots: 0,
                shot_volume_ms: 2000,
                stagger_minutes: 0,
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

    const removeZone = (index) => {
        const newZones = [...editingRoom.zones];
        newZones.splice(index, 1);
        setEditingRoom({ ...editingRoom, zones: newZones });
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm('Are you sure you want to delete this room and all its zones?')) return;
        try {
            await api.deleteRoom(roomId);
            loadConfig();
        } catch (e) {
            alert('Failed to delete room');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // If the room exists in our list, update it
            const exists = rooms.some(r => r.id === editingRoom.id);
            if (exists) {
                await api.updateRoom(editingRoom.id, editingRoom);
            } else {
                await api.addRoom(editingRoom);
            }
            alert('Settings saved successfully!');
            setEditingRoom(null);
            loadConfig();
        } catch (e) {
            alert('Failed to save settings');
        }
    };

    if (loading) return <div className="text-center text-slate-500 mt-20">Loading configuration...</div>;

    if (!editingRoom) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Layout className="text-blue-500" /> Room Management
                    </h2>
                    <button
                        onClick={startNewRoom}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/20"
                    >
                        <Plus size={20} /> Add New Room
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rooms.length === 0 ? (
                        <div className="md:col-span-2 text-center p-12 bg-slate-900/50 border border-slate-800 rounded-2xl border-dashed">
                            <p className="text-slate-500">No rooms configured yet. Create one to get started.</p>
                        </div>
                    ) : (
                        rooms.map(room => (
                            <div key={room.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl group hover:border-slate-700 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{room.name}</h3>
                                        <p className="text-slate-500 text-xs font-mono">{room.id}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => editRoom(room)}
                                            className="p-2 bg-slate-800 hover:bg-blue-600/20 text-blue-400 rounded-lg transition-colors"
                                            title="Edit Room"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRoom(room.id)}
                                            className="p-2 bg-slate-800 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors"
                                            title="Delete Room"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Zones:</span>
                                        <span className="text-white font-medium">{room.zones.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Lights On:</span>
                                        <span className="text-slate-500 text-xs truncate max-w-[150px]">{room.lights_on_entity}</span>
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
        <div className="max-w-4xl mx-auto pb-20">
            <button
                onClick={() => setEditingRoom(null)}
                className="flex items-center gap-1 text-slate-400 hover:text-white mb-6 transition-colors"
            >
                <ChevronLeft size={20} /> Back to Rooms
            </button>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                    <h3 className="text-xl font-bold mb-6 text-blue-400 border-b border-slate-800 pb-2">Room Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm text-slate-400 mb-1">Room Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                value={editingRoom.name}
                                onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })}
                                placeholder="e.g. Flower Room 1"
                                required
                            />
                        </div>
                        <EntityPicker
                            label="Lights ON Entity"
                            value={editingRoom.lights_on_entity}
                            onChange={(val) => setEditingRoom({ ...editingRoom, lights_on_entity: val })}
                            domain="binary_sensor"
                            placeholder="Select light sensor..."
                        />
                        <EntityPicker
                            label="Lights OFF Entity (Optional)"
                            value={editingRoom.lights_off_entity}
                            onChange={(val) => setEditingRoom({ ...editingRoom, lights_off_entity: val })}
                            domain="binary_sensor"
                            placeholder="Select status sensor..."
                        />
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-2">
                        <h3 className="text-xl font-bold text-emerald-400">Zone Configuration</h3>
                        <button
                            type="button"
                            onClick={addZone}
                            className="flex items-center gap-2 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-emerald-600/30"
                        >
                            <Plus size={18} /> Add Zone
                        </button>
                    </div>

                    <div className="flex flex-col gap-6">
                        {editingRoom.zones.length === 0 ? (
                            <p className="text-center p-8 text-slate-500 border border-slate-800 border-dashed rounded-xl">No zones added yet.</p>
                        ) : (
                            editingRoom.zones.map((zone, idx) => (
                                <div key={zone.id} className="bg-slate-950 p-6 rounded-xl border border-slate-800 relative group animate-in fade-in slide-in-from-top-4 duration-300">
                                    <button
                                        type="button"
                                        onClick={() => removeZone(idx)}
                                        className="absolute top-4 right-4 text-slate-600 hover:text-red-400 transition-colors"
                                    >
                                        <Trash size={20} />
                                    </button>

                                    <div className="flex items-center gap-2 mb-6">
                                        <Droplets className="text-emerald-500" size={20} />
                                        <h4 className="text-lg font-bold text-white">Zone {idx + 1}</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Zone Name</label>
                                            <input
                                                value={zone.name}
                                                onChange={e => updateZone(idx, 'name', e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                                placeholder="e.g. North Bench"
                                            />
                                        </div>

                                        <EntityPicker
                                            label="Valve / Solenoid Entity (switch)"
                                            value={zone.valve_entity}
                                            onChange={(val) => updateZone(idx, 'valve_entity', val)}
                                            domain="switch"
                                            placeholder="Select valve switch..."
                                        />

                                        <EntityPicker
                                            label="Pump Entity (Optional)"
                                            value={zone.pump_entity}
                                            onChange={(val) => updateZone(idx, 'pump_entity', val)}
                                            domain="switch"
                                            placeholder="Select pump switch..."
                                        />

                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">P1 Shots</label>
                                                <input
                                                    type="number"
                                                    value={zone.p1_shots}
                                                    onChange={e => updateZone(idx, 'p1_shots', parseInt(e.target.value) || 0)}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">P2 Shots</label>
                                                <input
                                                    type="number"
                                                    value={zone.p2_shots}
                                                    onChange={e => updateZone(idx, 'p2_shots', parseInt(e.target.value) || 0)}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">Vol (ms)</label>
                                                <input
                                                    type="number"
                                                    value={zone.shot_volume_ms}
                                                    onChange={e => updateZone(idx, 'shot_volume_ms', parseInt(e.target.value) || 0)}
                                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => setEditingRoom(null)}
                        className="px-6 py-2 rounded-lg font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-lg font-bold text-white transition-all shadow-xl shadow-blue-900/40">
                        <Save size={20} /> Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConfigWizard;
