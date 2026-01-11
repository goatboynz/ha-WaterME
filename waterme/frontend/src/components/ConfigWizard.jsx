import React, { useState } from 'react';
import { api } from '../api';
import { Plus, Save, Trash } from 'lucide-react';

const ConfigWizard = () => {
    const [room, setRoom] = useState({
        id: crypto.randomUUID(),
        name: '',
        lights_on_entity: 'binary_sensor.lights_on',
        lights_off_entity: 'binary_sensor.lights_off',
        zones: []
    });

    const addZone = () => {
        setRoom({
            ...room,
            zones: [...room.zones, {
                id: crypto.randomUUID(),
                name: `Zone ${room.zones.length + 1}`,
                p1_shots: 5,
                p2_shots: 0,
                shot_volume_ms: 2000,
                valve_entity: 'switch.valve_1'
            }]
        });
    };

    const updateZone = (index, field, value) => {
        const newZones = [...room.zones];
        newZones[index][field] = value;
        setRoom({ ...room, zones: newZones });
    };

    const removeZone = (index) => {
        const newZones = [...room.zones];
        newZones.splice(index, 1);
        setRoom({ ...room, zones: newZones });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.addRoom(room);
        alert('Room saved successfully!');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">System Configuration</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-xl font-semibold mb-4 text-blue-400">Room Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Room Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                                value={room.name}
                                onChange={e => setRoom({ ...room, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Lights ON Entity</label>
                            <input
                                type="text"
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                                value={room.lights_on_entity}
                                onChange={e => setRoom({ ...room, lights_on_entity: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-emerald-400">Zones</h3>
                        <button
                            type="button"
                            onClick={addZone}
                            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-sm"
                        >
                            <Plus size={16} /> Add Zone
                        </button>
                    </div>

                    <div className="space-y-4">
                        {room.zones.map((zone, idx) => (
                            <div key={zone.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 relative">
                                <button
                                    type="button"
                                    onClick={() => removeZone(idx)}
                                    className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                                >
                                    <Trash size={16} />
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-500">Zone Name</label>
                                        <input
                                            value={zone.name}
                                            onChange={e => updateZone(idx, 'name', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Valve Entity (switch)</label>
                                        <input
                                            value={zone.valve_entity}
                                            onChange={e => updateZone(idx, 'valve_entity', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-sm font-mono"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-slate-500">P1 Shots</label>
                                            <input
                                                type="number"
                                                value={zone.p1_shots}
                                                onChange={e => updateZone(idx, 'p1_shots', parseInt(e.target.value))}
                                                className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">Vol (ms)</label>
                                            <input
                                                type="number"
                                                value={zone.shot_volume_ms}
                                                onChange={e => updateZone(idx, 'shot_volume_ms', parseInt(e.target.value))}
                                                className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-semibold transition-all">
                        <Save size={18} /> Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ConfigWizard;
