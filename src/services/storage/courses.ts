import { Curso, Herramienta, Recurso, AssetsConfig, LiveStatus } from '../../types';
import { api } from "../../../convex/_generated/api";
import logger from '../../../lib/utils/logger';
import { convex } from './sync';
import { getLocalItem, setLocalItem } from './helpers';

export const getCursos = async (): Promise<Curso[]> => {
    try {
         if (convex) {
             const data = await convex.query(api.config.getConfig, { key: "academia_cursos" });
             if (data && data.value) return data.value;
         }
    } catch (err) { logger.error("Convex getCursos Error:", err); }

    const local = getLocalItem<Curso[]>('local_cursos_db', []);
    if (local.length > 0) return local;

    try {
        const { STATIC_CURSOS } = await import('../../data/staticData');
        return STATIC_CURSOS as Curso[];
    } catch {
        return [];
    }
};

export const saveCurso = async (curso: Curso): Promise<void> => {
    const cursos = await getCursos();
    const index = cursos.findIndex(c => c.id === curso.id);
    if (index !== -1) { cursos[index] = curso; } else { cursos.push(curso); }
    setLocalItem('local_cursos_db', cursos);

    if (convex) {
        try {
            await convex.mutation(api.config.setConfig, {
                key: "academia_cursos",
                value: cursos
            });
        } catch (err) {
            logger.error("Convex Save Curso Error:", err);
        }
    }
};

export const deleteCurso = async (id: string): Promise<void> => {
    const cursos = await getCursos();
    const updated = cursos.filter(c => c.id !== id);
    setLocalItem('local_cursos_db', updated);

    if (convex) {
        try {
            await convex.mutation(api.config.setConfig, {
                key: "academia_cursos",
                value: updated
            });
        } catch (err) {
            logger.error("Convex Delete Curso Error:", err);
        }
    }
};

export const getHerramientas = async (): Promise<Herramienta[]> => {
    try {
        if (convex) {
             const data = await convex.query(api.config.getConfig, { key: "academia_herramientas" });
             if (data && data.value) return data.value;
        }
    } catch (err) { logger.error("Convex getHerramientas Error:", err); }

    const local = getLocalItem<Herramienta[]>('local_herramientas_db', []);
    if (local.length > 0) return local;

    try {
        const { STATIC_HERRAMIENTAS } = await import('../../data/staticData');
        return STATIC_HERRAMIENTAS as Herramienta[];
    } catch {
        return [];
    }
};

export const saveHerramienta = async (tool: Herramienta): Promise<void> => {
    const tools = await getHerramientas();
    const index = tools.findIndex(t => t.id === tool.id);
    if (index !== -1) { tools[index] = tool; } else { tools.push(tool); }
    setLocalItem('local_herramientas_db', tools);

    if (convex) {
        try {
            await convex.mutation(api.config.setConfig, {
                key: "academia_herramientas",
                value: tools
            });
        } catch (err) {
            logger.error("Convex Save Herramienta Error:", err);
        }
    }
};

export const deleteHerramienta = async (id: string): Promise<void> => {
    const tools = await getHerramientas();
    const updated = tools.filter(t => t.id !== id);
    setLocalItem('local_herramientas_db', updated);

    if (convex) {
        try {
            await convex.mutation(api.config.setConfig, {
                key: "academia_herramientas",
                value: updated
            });
        } catch (err) {
            logger.error("Convex Delete Herramienta Error:", err);
        }
    }
};

export const getGraficoConfig = async (): Promise<AssetsConfig | null> => {
    try {
        if (convex) {
            const data = await convex.query(api.config.getConfig, { key: "grafico_assets" });
            if (data && data.value) return { id: data._id, key: "grafico_assets", assets: data.value };
        }
    } catch (err) {
        logger.error("Convex Get Grafico Config Error:", err);
    }
    return getLocalItem<AssetsConfig | null>('local_grafico_config', null);
};

export const saveGraficoConfig = async (config: { assets: any[] }): Promise<void> => {
    setLocalItem('local_grafico_config', config);
    if (convex) {
        try {
            await convex.mutation(api.config.setConfig, {
                key: "grafico_assets",
                value: config.assets
            });
        } catch (err) {
            logger.error("Convex Save Grafico Config Error:", err);
        }
    }
};

export const getResources = async (): Promise<Recurso[]> => {
    return getLocalItem<Recurso[]>('local_resources_db', []);
};

export const saveResource = async (resource: Recurso): Promise<void> => {
    const resources = getLocalItem<Recurso[]>('local_resources_db', []);
    const index = resources.findIndex(r => r.id === resource.id);
    if (index !== -1) { resources[index] = resource; } else { resources.unshift(resource); }
    setLocalItem('local_resources_db', resources);
};

export const deleteResource = async (id: string): Promise<void> => {
    const resources = getLocalItem<Recurso[]>('local_resources_db', []);
    setLocalItem('local_resources_db', resources.filter(r => r.id !== id));
};

export const getLiveStatus = async (): Promise<LiveStatus> => {
    try {
        if (convex) {
            const config = await convex.query(api.config.getConfig, { key: 'live_status' });
            if (config) return config.value;
        }
    } catch (err) {
        logger.error("Convex Get Live Status Error:", err);
    }
    return { isLive: false, url: '', lastUpdated: new Date().toISOString() };
};

export const updateLiveStatus = async (status: LiveStatus): Promise<void> => {
    try {
        if (convex) {
            await convex.mutation(api.config.setConfig, { key: 'live_status', value: status });
        }
    } catch (err) {
        logger.error("Convex Update Live Status Error:", err);
    }
};
