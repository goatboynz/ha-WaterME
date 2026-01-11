import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import ConfigWizard from './components/ConfigWizard';
import { api } from './api';
import { Settings, LayoutDashboard, AlertOctagon } from 'lucide-react';

function App() {
    const [view, setView] = useState('dashboard');
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            api.getStatus().then(setStatus).catch(console.error);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const toggleKillSwitch = async () => {
        if (!status) return;
        const newState = !status.kill_switch;
        await api.setKillSwitch(newState);
        const newStatus = await api.getStatus();
        setStatus(newStatus);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        WaterME
                    </h1>
                    <p className="text-slate-400">Precision Crop Steering</p>
                </div>

                <div className="flex gap-4 items-center">
                    {status?.kill_switch && (
                        <div className="animate-pulse flex items-center gap-2 text-red-500 font-bold border border-red-500/50 px-4 py-2 rounded-full bg-red-950/30">
                            <AlertOctagon /> KILL SWITCH ACTIVE
                        </div>
                    )}

                    <button
                        onClick={toggleKillSwitch}
                        className={`p-3 rounded-xl transition-all ${status?.kill_switch ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800 hover:bg-slate-700 text-red-400'}`}
                        title="Global Kill Switch"
                    >
                        <AlertOctagon size={24} />
                    </button>

                    <button
                        onClick={() => setView('dashboard')}
                        className={`p-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                        <LayoutDashboard size={24} />
                    </button>
                    <button
                        onClick={() => setView('config')}
                        className={`p-3 rounded-xl transition-all ${view === 'config' ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                        <Settings size={24} />
                    </button>
                </div>
            </header>

            <main>
                {view === 'dashboard' && <Dashboard status={status} />}
                {view === 'config' && <ConfigWizard />}
            </main>
        </div>
    );
}

export default App;
