export interface ParsedExpense {
  amount: number;
  category: string;
  note: string;
  type: 'expense' | 'income';
}

const CATEGORY_MAP: Record<string, string[]> = {
  food: ['comida', 'super', 'restaurante', 'cena', 'almuerzo', 'desayuno', 'alimentos', 'supermercado'],
  services: ['luz', 'agua', 'gas', 'internet', 'telefono', 'wifi', 'servicios', 'expensas'],
  transport: ['nafta', 'uber', 'taxi', 'colectivo', 'tren', 'subte', 'transporte', 'gasolina'],
  entertainment: ['cine', 'netflix', 'spotify', 'salida', 'juego', 'diversion', 'ocio'],
  health: ['farmacia', 'medico', 'remedio', 'salud', 'dentista', 'clinica'],
  shopping: ['ropa', 'zapatos', 'regalo', 'compras', 'malls', 'shopping'],
  home: ['alquiler', 'mueble', 'reparacion', 'hogar', 'casa', 'limpieza'],
};

export const expenseAgent = {
  parse(text: string): ParsedExpense | null {
    const cleanText = text.toLowerCase().trim();
    
    // Patterns: 
    // "agrega gasto 500 en comida"
    // "gasto 500 comida"
    // "ingreso 1000"
    
    const amountRegex = /(\d+[\.,]?\d*)/;
    const amountMatch = cleanText.match(amountRegex);
    
    if (!amountMatch) return null;
    
    const amount = parseFloat(amountMatch[0].replace(',', '.'));
    const isIncome = cleanText.includes('ingreso');
    
    let category = 'other';
    let note = '';
    
    // Find category by keywords
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
      if (keywords.some(k => cleanText.includes(k))) {
        category = cat;
        break;
      }
    }
    
    // Extract note (everything after amount or category)
    note = cleanText.replace('agrega', '').replace('gasto', '').replace('ingreso', '').replace(amountMatch[0], '').trim();
    
    return {
      amount,
      category,
      note: note || (isIncome ? 'Ingreso extra' : 'Gasto registrado'),
      type: isIncome ? 'income' : 'expense'
    };
  }
};
