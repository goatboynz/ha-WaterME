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

    async addRoom(room) {
        const res = await fetch(`${API_BASE}/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(room)
        });
        return res.json();
    },

    async setKillSwitch(active) {
        const res = await fetch(`${API_BASE}/kill_switch/${active}`, { method: 'POST' });
        return res.json();
    },

    async manualShot(zoneId) {
        const res = await fetch(`${API_BASE}/manual/shot/${zoneId}`, { method: 'POST' });
        return res.json();
    }
};
