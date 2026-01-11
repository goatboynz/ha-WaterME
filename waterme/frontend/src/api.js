const API_BASE = './waterme-api';

export const api = {
    async getStatus() {
        const res = await fetch(`${API_BASE}/status`);
        return res.json();
    },

    async getConfig() {
        const res = await fetch(`${API_BASE}/config`);
        return res.json();
    },

    async getEntities(domain = '', search = '') {
        const res = await fetch(`${API_BASE}/entities?domain=${domain}&search=${search}`);
        return res.json();
    },

    async addRoom(room) {
        const res = await fetch(`${API_BASE}/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(room)
        });
        return res.json();
    },

    async updateRoom(roomId, room) {
        const res = await fetch(`${API_BASE}/rooms/${roomId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(room)
        });
        return res.json();
    },

    async deleteRoom(roomId) {
        const res = await fetch(`${API_BASE}/rooms/${roomId}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    async setKillSwitch(state) {
        const res = await fetch(`${API_BASE}/kill_switch/${state}`, {
            method: 'POST'
        });
        return res.json();
    },

    async manualShot(zoneId) {
        const res = await fetch(`${API_BASE}/manual/shot/${zoneId}`, {
            method: 'POST'
        });
        return res.json();
    },

    async toggle(type, id, state) {
        const res = await fetch(`${API_BASE}/toggle/${type}/${id}?state=${state}`, {
            method: 'POST'
        });
        return res.json();
    }
};
