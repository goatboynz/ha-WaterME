import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Search, X, ChevronDown } from 'lucide-react';

const EntityPicker = ({ value, onChange, domain = 'switch', label, placeholder = 'Select entity...' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            loadEntities();
        }
    }, [isOpen, domain]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadEntities = async () => {
        setLoading(true);
        try {
            const result = await api.getEntities(domain, null);
            setEntities(result.entities || []);
        } catch (e) {
            console.error('Failed to load entities:', e);
            setEntities([]);
        }
        setLoading(false);
    };

    const filteredEntities = entities.filter(e => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        const entityId = e.entity_id || '';
        const friendlyName = e.attributes?.friendly_name || '';
        return entityId.toLowerCase().includes(searchLower) ||
            friendlyName.toLowerCase().includes(searchLower);
    });

    const getDisplayName = (entity) => {
        const friendlyName = entity.attributes?.friendly_name;
        return friendlyName ? `${friendlyName} (${entity.entity_id})` : entity.entity_id;
    };

    const selectedEntity = entities.find(e => e.entity_id === value);

    return (
        <div className="relative" ref={dropdownRef}>
            {label && <label className="block text-xs text-slate-500 mb-1">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-left flex items-center justify-between hover:border-blue-500/50 transition-colors"
            >
                <span className={value ? 'text-white' : 'text-slate-500'}>
                    {selectedEntity ? getDisplayName(selectedEntity) : (value || placeholder)}
                </span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-64 overflow-hidden">
                    <div className="p-2 border-b border-slate-700">
                        <div className="relative">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search entities..."
                                className="w-full bg-slate-950 border border-slate-700 rounded pl-7 pr-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                autoFocus
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-48">
                        {loading ? (
                            <div className="p-4 text-center text-slate-500">Loading entities...</div>
                        ) : filteredEntities.length === 0 ? (
                            <div className="p-4 text-center text-slate-500">No entities found</div>
                        ) : (
                            filteredEntities.map((entity) => (
                                <button
                                    key={entity.entity_id}
                                    type="button"
                                    onClick={() => {
                                        onChange(entity.entity_id);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-800 transition-colors ${value === entity.entity_id ? 'bg-blue-600/20 text-blue-400' : ''
                                        }`}
                                >
                                    <div className="font-medium">{entity.attributes?.friendly_name || entity.entity_id}</div>
                                    <div className="text-xs text-slate-500">{entity.entity_id}</div>
                                </button>
                            ))
                        )}
                    </div>

                    {value && (
                        <div className="p-2 border-t border-slate-700">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('');
                                    setIsOpen(false);
                                }}
                                className="w-full text-center text-sm text-red-400 hover:text-red-300"
                            >
                                Clear selection
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EntityPicker;
