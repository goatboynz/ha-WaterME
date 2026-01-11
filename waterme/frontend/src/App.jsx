import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import ConfigWizard from './components/ConfigWizard';
import { api } from './api';
import {
    Settings,
    LayoutDashboard,
    AlertOctagon,
    Zap,
    Droplets,
    BarChart3,
    ShieldAlert,
    Cpu,
    Search,
    ChevronDown,
    Activity
} from 'lucide-react';

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

    const NavButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setView(id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 relative group ${view === id
                ? 'bg-white/5 text-white'
                : 'text-slate-500 hover:text-slate-300'
                }`}
        >
            <Icon size={20} className={view === id ? 'text-orange-500' : 'group-hover:text-slate-300'} />
            <span className="font-bold text-sm tracking-tight">{label}</span>
            {view === id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full shadow-[2px_0_10px_rgba(249,115,22,0.5)]" />
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-slate-100 flex font-sans selection:bg-orange-500/30">
            {/* SIDEBAR */}
            <aside className="w-72 border-r border-white/5 flex flex-col p-6 h-screen sticky top-0 shrink-0">
                <div className="flex items-center gap-3 px-2 mb-12">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                        <Droplets className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-black italic tracking-tighter uppercase leading-none">WaterME</span>
                </div>

                <div className="relative mb-8">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                        type="text"
                        placeholder="Quick search..."
                        className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs font-bold focus:outline-none focus:border-white/10 transition-colors"
                    />
                </div>

                <nav className="flex-1 space-y-2">
                    <div className="px-6 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 italic">Navigation</span>
                    </div>
                    <NavButton id="dashboard" label="Dashboard" icon={LayoutDashboard} />
                    <NavButton id="analytics" label="Statistics & History" icon={BarChart3} />
                    <NavButton id="config" label="Room Control" icon={Zap} />
                    <NavButton id="settings" label="System Config" icon={Settings} />
                </nav>

                <div className="mt-auto space-y-6">
                    {/* KILL SWITCH STATUS */}
                    <button
                        onClick={toggleKillSwitch}
                        className={`w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] border-2 transition-all duration-500 ${status?.kill_switch
                            ? 'bg-red-500 border-red-400 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                            : 'bg-white/[0.02] border-white/5 text-red-500 hover:bg-red-500/10'
                            }`}
                    >
                        <AlertOctagon size={20} className={status?.kill_switch ? 'animate-pulse' : ''} />
                        <span className="font-extrabold text-[10px] uppercase tracking-[0.2em] italic">
                            {status?.kill_switch ? 'Mainframe Lock' : 'Emergency Stop'}
                        </span>
                    </button>

                    {/* USER INFO / SYSTEM STATUS */}
                    <div className="bg-white/[0.03] p-5 rounded-[2.5rem] border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-white/[0.05] transition-all">
                        <div className="w-12 h-12 rounded-full border-2 border-slate-800 bg-slate-900 flex items-center justify-center p-1 overflow-hidden relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-sm"></div>
                            <Cpu className="text-blue-500 relative z-10" size={24} />
                            {/* STATUS LED */}
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121212] z-20 shadow-[0_0_10px_#10b981]"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-black text-white text-xs uppercase italic truncate">System OS</h4>
                            <p className="text-[10px] font-bold text-slate-600 truncate uppercase mt-0.5">v0.1.9 Operational</p>
                        </div>
                        <ChevronDown size={16} className="text-slate-700 group-hover:text-slate-300 transition-colors" />
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 min-h-screen overflow-y-auto custom-scrollbar">
                <header className="px-10 py-8 flex justify-between items-center bg-[#0a0a0a]/50 backdrop-blur-3xl sticky top-0 z-[100]">
                    <div className="flex items-center gap-4">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                            {view === 'dashboard' ? 'Overview' : view === 'config' ? 'Command Room' : view === 'analytics' ? 'Analytics' : 'Systems'}
                        </h2>
                        <div className="bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl flex items-center gap-3 text-xs font-black text-slate-500 italic uppercase cursor-pointer hover:white/10 transition-all">
                            <Activity size={14} className="text-orange-500" />
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} → Current
                            <ChevronDown size={14} />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="bg-white px-6 py-2.5 rounded-full text-black font-black text-xs uppercase tracking-widest italic flex items-center gap-3 cursor-pointer shadow-xl shadow-white/10 active:scale-95 transition-all focus:outline-none">
                            <ShieldAlert size={16} />
                            Main Network
                        </div>
                    </div>
                </header>

                <div className="px-10 pb-10">
                    {view === 'dashboard' && <Dashboard status={status} />}
                    {view === 'config' && <ConfigWizard />}
                    {(view === 'analytics' || view === 'settings') && (
                        <div className="h-96 flex flex-col items-center justify-center bg-white/[0.01] border-2 border-white/5 border-dashed rounded-[3rem] text-slate-800 font-black uppercase italic tracking-[0.4em] gap-6">
                            <Cpu size={64} className="text-slate-900 animate-pulse" />
                            <span>Module Synchronization in Progress</span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
