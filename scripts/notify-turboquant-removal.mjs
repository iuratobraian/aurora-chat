import { Client } from '@notionhq/client';

const notion = new Client({ auth: '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' });

await notion.pages.create({
  parent: { database_id: '33142b008df080f8b6b3db69d36e84d5' },
  properties: {
    TASK: {
      title: [{ text: { content: '[URGENTE] TurboQuant eliminado - módulo no existe' } }]
    },
    Tipo: { select: { name: 'Infra' } },
    Prioridad: { select: { name: 'Critical' } },
    Estado: { select: { name: 'Listo' } },
    Notas: {
      rich_text: [{ text: { content: 'turboquant.skill.ts no existe en el proyecto. Se eliminaron todas las referencias de src/skills/index.ts. NO intentar reinstalar sin crear el archivo primero. Fix aplicado por OpenCode 2026-03-31 durante TSK-098 (build fix).' } }]
    }
  }
});

console.log('✅ Notion entry created for TurboQuant removal notice');
