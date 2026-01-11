import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Search, X, ChevronDown, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const EntityPicker = ({ value, onChange, domain = 'switch', label, placeholder = 'Search mainframe...' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const dropdownRef = useRef(null);

    const loadEntities = async () => {
        setLoading(true);
        setError(false);
        try {
            const result = await api.getEntities(domain, null);
            if (result && Array.isArray(result.entities)) {
                setEntities(result.entities);
            } else {
                setEntities([]);
            }
        } catch (e) {
            console.error('Failed to load entities:', e);
            setError(true);
            setEntities([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen && entities.length === 0) {
            loadEntities();
        }
    }, [isOpen, domain]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredEntities = (entities || []).filter(e => {
        if (!e) return false;
        if (!search) return true;
        const searchLower = search.toLowerCase();
        const entityId = (e.entity_id || '').toLowerCase();
        const friendlyName = (e.attributes?.friendly_name || '').toLowerCase();
        return entityId.includes(searchLower) || friendlyName.includes(searchLower);
    });

    const getDisplayName = (entityId) => {
        if (!entityId) return '';
        const entity = (entities || []).find(e => e.entity_id === entityId);
        if (entity && entity.attributes?.friendly_name) {
            return entity.attributes.friendly_name;
        }
        return entityId;
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {label && <label className="block text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] mb-3 italic">{label}</label>}

            <div
                className={`relative flex items-center bg-white/[0.03] border transition-all duration-300 rounded-2xl ${isOpen ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)] bg-white/[0.05]' : 'border-white/5 hover:border-white/10'
                    }`}
            >
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                    <span className={`text-xs font-bold truncate ${value ? 'text-white italic' : 'text-slate-700 uppercase tracking-widest'}`}>
                        {value ? getDisplayName(value) : placeholder}
                    </span>
                    <ChevronDown size={14} className={`text-slate-700 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {value && !isOpen && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        className="absolute right-12 text-slate-800 hover:text-red-500 p-2 transition-colors"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-[110] w-full mt-2 bg-[#0d0d0d] border border-white/5 rounded-3xl shadow-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 bg-white/[0.02] border-b border-white/5">
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Filter mainframe..."
                                className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-orange-500/50 transition-all font-bold"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-64 custom-scrollbar">
                        {loading ? (
                            <div className="p-10 flex flex-col items-center justify-center gap-4 text-slate-700">
                                <Loader2 size={24} className="animate-spin text-orange-500" />
                                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Accessing HA Core...</span>
                            </div>
                        ) : error ? (
                            <div className="p-10 flex flex-col items-center justify-center gap-4 text-red-500">
                                <AlertCircle size={24} />
                                <span className="text-[8px] font-black uppercase tracking-[0.3em]">Link Failure</span>
                                <button type="button" onClick={loadEntities} className="text-orange-500 text-[8px] font-black underline uppercase tracking-widest italic">Retry Sync</button>
                            </div>
                        ) : filteredEntities.length === 0 ? (
                            <div className="p-12 text-center">
                                <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">No signatures discovered</span>
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {filteredEntities.map((entity) => (
                                    <button
                                        key={entity.entity_id}
                                        type="button"
                                        onClick={() => {
                                            onChange(entity.entity_id);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`w-full text-left px-5 py-3 rounded-2xl transition-all group flex items-center justify-between ${value === entity.entity_id ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' : 'hover:bg-white/[0.03]'
                                            }`}
                                    >
                                        <div className="min-w-0 pr-4">
                                            <div className={`text-xs font-black italic truncate ${value === entity.entity_id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                                {entity.attributes?.friendly_name || entity.entity_id}
                                            </div>
                                            <div className={`text-[8px] font-bold tracking-widest uppercase truncate ${value === entity.entity_id ? 'text-orange-200' : 'text-slate-700'}`}>
                                                {entity.entity_id}
                                            </div>
                                        </div>
                                        {value === entity.entity_id && <CheckCircle2 size={12} className="shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntityPicker;
