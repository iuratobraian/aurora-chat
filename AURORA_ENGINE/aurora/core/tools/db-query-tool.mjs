/**
 * db-query-tool.mjs - Database Query Tool para Aurora
 * Permite ejecutar consultas SQL-like sobre archivos JSON/CSV locales
 */
import fs from 'node:fs';
import path from 'node:path';

export class DbQueryTool {
  constructor() { this.history = []; }

  async execute(params) {
    const { operation, file, query } = params;

    try {
      switch (operation) {
        case 'read': return await this.read(file);
        case 'filter': return await this.filter(file, query);
        case 'count': return await this.count(file, query);
        case 'distinct': return await this.distinct(file, query);
        default: return { success: false, error: `Unknown operation: ${operation}` };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async read(file) {
    const content = fs.readFileSync(file, 'utf8');
    const data = file.endsWith('.json') ? JSON.parse(content) : this.parseCsv(content);
    return { success: true, data, total: data.length };
  }

  async filter(file, conditions) {
    const { data } = await this.read(file);
    const filtered = data.filter(item => this.matchConditions(item, conditions));
    return { success: true, data: filtered, total: filtered.length };
  }

  async count(file, conditions) {
    const { data } = await this.read(file);
    const count = conditions ? data.filter(item => this.matchConditions(item, conditions)).length : data.length;
    return { success: true, count };
  }

  async distinct(file, field) {
    const { data } = await this.read(file);
    const values = [...new Set(data.map(item => item[field]).filter(Boolean))];
    return { success: true, values, total: values.length };
  }

  matchConditions(item, conditions) {
    if (!conditions) return true;
    return Object.entries(conditions).every(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        if (value.$gt) return item[key] > value.$gt;
        if (value.$lt) return item[key] < value.$lt;
        if (value.$eq) return item[key] === value.$eq;
        if (value.$in) return value.$in.includes(item[key]);
      }
      return item[key] === value;
    });
  }

  parseCsv(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((h, i) => obj[h] = values[i]);
      return obj;
    });
  }

  getSchema() {
    return {
      name: 'db_query',
      description: 'Query local JSON/CSV files. Operations: read, filter, count, distinct.',
      parameters: {
        type: 'object',
        properties: {
          operation: { type: 'string', enum: ['read', 'filter', 'count', 'distinct'] },
          file: { type: 'string' },
          query: { type: 'object' },
        },
        required: ['operation', 'file'],
      },
    };
  }
}
