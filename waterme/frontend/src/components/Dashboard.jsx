import React from 'react';
import ZoneCard from './ZoneCard';
import { Sun, Moon } from 'lucide-react';

const Dashboard = ({ status }) => {
    if (!status) return <div className="text-center text-slate-500 mt-20">Loading system status...</div>;
    if (!status.rooms || status.rooms.length === 0) return <div className="text-center text-slate-500 mt-20">No rooms configured. Set up a room in Config.</div>;

    return (
        <div className="flex flex-col gap-8">
            {status.rooms.map(room => (
                <div key={room.id} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                                {room.name}
                                {/* Mock Status for visual demo */}
                                <span className="text-xs font-normal bg-emerald-900/30 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Sun size={12} /> Lights On
                                </span>
                            </h2>
                            <p className="text-slate-500 text-sm mt-1">{room.lights_on_entity}</p>
                        </div>
                        <div className="w-1/3">
                            {/* Mock Progress - In real version, calculate based on phase */}
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>P1</span>
                                <span>Gap</span>
                                <span>P2</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                <div className="w-1/3 bg-blue-500/50"></div>
                                <div className="w-1/6 bg-slate-700"></div>
                                <div className="w-1/2 bg-slate-800"></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
