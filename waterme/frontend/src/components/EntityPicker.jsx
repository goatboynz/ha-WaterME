import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Search, X, ChevronDown, Loader2, AlertCircle } from 'lucide-react';

const EntityPicker = ({ value, onChange, domain = 'switch', label, placeholder = 'Search entities...' }) => {
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
            if (!result.entities || result.entities.length === 0) {
                // If it's empty, maybe it's an error or just no entities of that domain
                setEntities([]);
            } else {
                setEntities(result.entities);
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

    const filteredEntities = entities.filter(e => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        const entityId = e.entity_id || '';
        const friendlyName = (e.attributes?.friendly_name || '').toLowerCase();
        return entityId.toLowerCase().includes(searchLower) || friendlyName.includes(searchLower);
    });

    const getDisplayName = (entityId) => {
        const entity = entities.find(e => e.entity_id === entityId);
        if (entity && entity.attributes?.friendly_name) {
            return entity.attributes.friendly_name;
        }
        return entityId;
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {label && <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">{label}</label>}

            <div
                className={`relative flex items-center bg-slate-950 border-2 rounded-2xl transition-all duration-300 ${isOpen ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-slate-800 hover:border-slate-700'}`}
            >
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-4 text-left flex items-center justify-between"
                >
                    <span className={`text-sm font-bold truncate ${value ? 'text-white' : 'text-slate-700'}`}>
                        {value ? getDisplayName(value) : placeholder}
                    </span>
                    <ChevronDown size={18} className={`text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {value && !isOpen && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        className="absolute right-12 text-slate-700 hover:text-red-500 p-2 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-[100] w-full mt-2 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 bg-slate-950/50 backdrop-blur-xl border-b border-slate-800">
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Filter entities..."
                                className="w-full bg-slate-900 border-2 border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-60 custom-scrollbar">
                        {loading ? (
                            <div className="p-10 flex flex-col items-center justify-center gap-4 text-slate-500">
                                <Loader2 size={24} className="animate-spin text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Accessing HA API...</span>
                            </div>
                        ) : error ? (
                            <div className="p-10 flex flex-col items-center justify-center gap-4 text-red-500">
                                <AlertCircle size={24} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Link Failure</span>
                                <button onClick={loadEntities} className="text-blue-500 text-[10px] font-bold underline uppercase">Retry Sync</button>
                            </div>
                        ) : filteredEntities.length === 0 ? (
                            <div className="p-10 text-center">
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">No matching entities discovered</span>
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
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all group ${value === entity.entity_id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800/50'}`}
                                    >
                                        <div className={`text-sm font-black italic tracking-tight ${value === entity.entity_id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                            {entity.attributes?.friendly_name || entity.entity_id}
                                        </div>
                                        <div className={`text-[10px] font-bold ${value === entity.entity_id ? 'text-blue-200' : 'text-slate-600'}`}>
                                            {entity.entity_id}
                                        </div>
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
