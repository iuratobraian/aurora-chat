export function compressData(data: any): string {
    try {
        return JSON.stringify(data);
    } catch {
        return JSON.stringify({ _compressed: true, data: String(data) });
    }
}

export function decompressData(compressed: string): any {
    try {
        return JSON.parse(compressed);
    } catch {
        return null;
    }
}

export function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function computeDiff(prev: any, next: any): any {
    if (!prev || !next) return null;
    const diff: Record<string, { from: any; to: any }> = {};
    const allKeys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]);
    for (const key of allKeys) {
        if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
            diff[key] = { from: prev[key], to: next[key] };
        }
    }
    return Object.keys(diff).length > 0 ? diff : null;
}

export const getLocalItem = <T>(key: string, defaultVal: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch { return defaultVal; }
};

export const setLocalItem = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};
