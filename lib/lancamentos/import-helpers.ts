import { read, utils } from "xlsx";
import { getTodayDateString } from "@/lib/utils/date";
import {
  LANCAMENTO_CONDITIONS,
  LANCAMENTO_PAYMENT_METHODS,
  LANCAMENTO_TRANSACTION_TYPES,
} from "@/lib/lancamentos/constants";

export interface ImportRow {
  data?: any;
  periodo?: any;
  descrição?: any;
  valor?: any;
  tipo?: any;
  categoria?: any;
  pagador?: any;
  forma_pagamento?: any;
  cartao?: any;
  conta?: any;
  condição?: any;
  total_parcelas?: any;
  anotacao?: any;
  vencimento?: any;
  [key: string]: any;
}

export const parseImportFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    // Check if it's a CSV file
    if (file.name.endsWith(".csv") || file.type === "text/csv") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          if (!buffer) {
            resolve([]);
            return;
          }

          // Try UTF-8 first
          const utf8Decoder = new TextDecoder("utf-8");
          let text = utf8Decoder.decode(buffer);

          // Check for replacement characters (\uFFFD) which indicate decoding errors
          // or if it looks like it has encoding issues (heuristics can be tricky, but \uFFFD is a strong signal)
          if (text.includes("\uFFFD")) {
             // Try windows-1252 (common in Brazil/Excel)
             const windowsDecoder = new TextDecoder("windows-1252");
             text = windowsDecoder.decode(buffer);
          }

          if (!text) {
            resolve([]);
            return;
          }

          const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
          if (lines.length === 0) {
            resolve([]);
            return;
          }

          // Detect delimiter from the first line
          const firstLine = lines[0];
          const semicolonCount = (firstLine.match(/;/g) || []).length;
          const commaCount = (firstLine.match(/,/g) || []).length;
          const delimiter = semicolonCount > commaCount ? ";" : ",";

          const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
          
          const jsonData = lines.slice(1).map(line => {
            // Handle quotes if necessary, but simple split for now is usually enough for this use case
            // A robust CSV regex split would be better but let's start simple or use a small regex
            // Simple split:
            const values = line.split(delimiter);
            
            const row: any = {};
            headers.forEach((header, index) => {
              let value = values[index]?.trim();
              if (value) {
                value = value.replace(/^"|"$/g, '');
              }
              row[header] = value;
            });
            return row;
          });

          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file); // Read as ArrayBuffer to allow manual decoding
      return;
    }

    // Fallback to xlsx for Excel files
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: "array", codepage: 65001 });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(sheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const normalizeAmount = (value: any): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const str = String(value).trim();
  
  // Remove R$, whitespace
  let clean = str.replace(/[R$\s]/g, "");
  
  // If it has comma and dot (e.g. 1.000,00), remove dot, replace comma
  if (clean.includes(",") && clean.includes(".")) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  } else if (clean.includes(",")) {
    // If only comma (e.g. 100,00), replace with dot
    clean = clean.replace(",", ".");
  }
  
  return parseFloat(clean) || 0;
};

export const normalizeDate = (value: any): string => {
  if (!value) return "";
  
  // Excel serial date (number)
  if (typeof value === "number") {
    const date = new Date((value - 25569) * 86400 * 1000);
    return date.toISOString().split("T")[0];
  }

  const str = String(value).trim();
  
  // DD/MM/YYYY or DD-MM-YYYY
  const brDate = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (brDate) {
    const day = brDate[1].padStart(2, "0");
    const month = brDate[2].padStart(2, "0");
    return `${brDate[3]}-${month}-${day}`;
  }
  
  // YYYY-MM-DD
  const isoDate = str.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (isoDate) {
     const day = isoDate[3].padStart(2, "0");
     const month = isoDate[2].padStart(2, "0");
     return `${isoDate[1]}-${month}-${day}`;
  }

  // Try Date parse
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }

  return "";
};

export const normalizeCondition = (value: any): string | undefined => {
  if (!value) return undefined;
  const str = String(value).trim().toLowerCase();
  
  if (str === "a vista" || str === "à vista" || str === "avista") return "À vista";
  if (str === "parcelado") return "Parcelado";
  if (str === "recorrente") return "Recorrente";
  
  // Check if it matches any constant case-insensitive
  const match = LANCAMENTO_CONDITIONS.find(c => c.toLowerCase() === str);
  if (match) return match;

  // Fallback: return capitalized (Title Case)
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const normalizePaymentMethod = (value: any): string | undefined => {
  if (!value) return undefined;
  const str = String(value).trim().toLowerCase();
  
  if (str.includes("credito") || str.includes("crédito")) return "Cartão de crédito";
  if (str.includes("debito") || str.includes("débito")) return "Cartão de débito";
  if (str === "pix") return "Pix";
  if (str === "dinheiro") return "Dinheiro";
  if (str === "boleto") return "Boleto";
  
  // Check if it matches any constant case-insensitive
  const match = LANCAMENTO_PAYMENT_METHODS.find(c => c.toLowerCase() === str);
  if (match) return match;

  // Fallback: return capitalized
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const normalizeTransactionType = (value: any): string | undefined => {
  if (!value) return undefined;
  const str = String(value).trim().toLowerCase();
  
  if (str === "despesa") return "Despesa";
  if (str === "receita") return "Receita";
  if (str === "transferencia" || str === "transferência") return "Transferência";
  
  // Check if it matches any constant case-insensitive
  const match = LANCAMENTO_TRANSACTION_TYPES.find(c => c.toLowerCase() === str);
  if (match) return match;

  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const detectInstallment = (
  description: string
): { current: number; total: number } | undefined => {
  if (!description) return undefined;
  const str = String(description);

  // Patterns: "1/10", "01/12", "(1/5)", "1 de 10"
  const patterns = [
    /(\d{1,2})\s*\/\s*(\d{1,2})/,
    /\(\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\)/,
    /(\d{1,2})\s*de\s*(\d{1,2})/i,
    /(\d{1,2})\s*x/i, // Matches "10x" -> usually means total 10, current 1? Or just total?
    // If description says "Compra 10x", it usually means "Parcelado em 10x".
    // We can assume current=1, total=10 for "10x" pattern if it stands alone or with words.
  ];

  // Specific check for "Nx" or "N x" pattern which usually implies total installments
  const xMatch = str.match(/(\d{1,2})\s*x/i);
  if (xMatch) {
     const total = parseInt(xMatch[1], 10);
     if (total > 1) {
       return { current: 1, total };
     }
  }

  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match && match.length >= 3) {
      const current = parseInt(match[1], 10);
      const total = parseInt(match[2], 10);
      if (current > 0 && total > 0 && current <= total) {
        return { current, total };
      }
    }
  }

  return undefined;
};

export const normalizeInstallments = (value: any): number | undefined => {
  if (!value) return undefined;
  if (typeof value === "number") return value;
  
  const str = String(value).trim();
  
  // Try to detect pattern first (e.g. "1/10" -> 10)
  const detected = detectInstallment(str);
  if (detected) {
    return detected.total;
  }
  
  // Fallback for simple numbers
  const clean = str.replace(/[^\d]/g, "");
  const num = parseInt(clean, 10);
  return isNaN(num) ? undefined : num;
};

export const validateImportRow = (row: any) => {
  const errors: string[] = [];
  
  if (!row.date) errors.push("Data é obrigatória");
  if (!row.description) errors.push("Descrição é obrigatória");
  if (row.amount === undefined || row.amount === null || row.amount === "") errors.push("Valor é obrigatório");
  if (!row.type) errors.push("Tipo é obrigatório");
  
  // Validate condition
  if (row.condition && !LANCAMENTO_CONDITIONS.includes(row.condition)) {
    errors.push(`Condição inválida: ${row.condition}`);
  }

  // Validate payment method if present
  if (row.paymentMethod && !LANCAMENTO_PAYMENT_METHODS.includes(row.paymentMethod)) {
    errors.push(`Forma de pagamento inválida: ${row.paymentMethod}`);
  }

  // Validate type
  if (row.type && !LANCAMENTO_TRANSACTION_TYPES.includes(row.type)) {
    errors.push(`Tipo inválido: ${row.type}`);
  }

  if (row.condition === "Parcelado") {
    if (!row.installments || row.installments < 2) {
      errors.push("Parcelado requer total de parcelas >= 2");
    }
  }

  if (row.type === "Transferência") {
    errors.push("Transferências não podem ser importadas por aqui. Use a área de Contas.");
  }

  return errors;
};
