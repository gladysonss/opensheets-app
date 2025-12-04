"use client";

import { importLancamentosAction, ImportRowInput } from "@/app/(dashboard)/lancamentos/import-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  detectInstallment,
  normalizeAmount,
  normalizeCondition,
  normalizeDate,
  normalizeInstallments,
  normalizePaymentMethod,
  normalizeTransactionType,
  parseImportFile,
  validateImportRow,
} from "@/lib/lancamentos/import-helpers";
import { RiAlertLine, RiCheckLine, RiUploadCloud2Line, RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
import { useState } from "react";
import { toast } from "sonner";
import { MassAddFormData } from "./mass-add-dialog";
import { read, utils, write } from "xlsx";

interface ImportLancamentosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: MassAddFormData) => Promise<void>; // Kept for compatibility but unused in new flow
}

const REQUIRED_FIELDS = [
  { key: "date", label: "Data" },
  { key: "description", label: "Descrição" },
  { key: "amount", label: "Valor" },
  { key: "type", label: "Tipo" },
];

const OPTIONAL_FIELDS = [
  { key: "period", label: "Período" },
  { key: "category", label: "Categoria" },
  { key: "pagador", label: "Pagador" },
  { key: "paymentMethod", label: "Forma de Pagamento" },
  { key: "card", label: "Cartão" },
  { key: "account", label: "Conta" },
  { key: "condition", label: "Condição" },
  { key: "installments", label: "Total Parcelas" },
  { key: "dueDate", label: "Vencimento (Boleto)" },
  { key: "note", label: "Anotação" },
];

export function ImportLancamentosDialog({
  open,
  onOpenChange,
}: ImportLancamentosDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [showOptional, setShowOptional] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    try {
      const data = await parseImportFile(selectedFile);
      if (data.length > 0) {
        setParsedData(data);
        const keys = Object.keys(data[0]);
        setHeaders(keys);
        
        // Auto-detect mapping
        const newMapping: Record<string, string> = {};
        const allFields = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
        
        keys.forEach((header) => {
          const lower = header.toLowerCase().trim();
          
          // Direct match check
          const exactMatch = allFields.find(f => 
             f.key === lower || f.label.toLowerCase() === lower
          );
          if (exactMatch) {
            newMapping[exactMatch.key] = header;
            return;
          }

          // Fuzzy match
          if (lower.includes("data") || lower.includes("date")) newMapping.date = header;
          else if (lower.includes("desc") || lower.includes("nome") || lower.includes("estabelecimento")) newMapping.description = header;
          else if (lower.includes("valor") || lower.includes("amount")) newMapping.amount = header;
          else if (lower.includes("tipo") || lower.includes("type")) newMapping.type = header;
          else if (lower.includes("cat")) newMapping.category = header;
          else if (lower.includes("pagador")) newMapping.pagador = header;
          else if (lower.includes("forma") || lower.includes("metodo")) newMapping.paymentMethod = header;
          else if (lower.includes("cartao") || lower.includes("card")) newMapping.card = header;
          else if (lower.includes("conta") || lower.includes("account")) newMapping.account = header;
          else if (lower.includes("cond") || lower.includes("condition")) newMapping.condition = header;
          else if (lower.includes("parcela") || lower.includes("install")) newMapping.installments = header;
          else if (lower.includes("venc") || lower.includes("due")) newMapping.dueDate = header;
          else if (lower.includes("nota") || lower.includes("obs") || lower.includes("anotacao")) newMapping.note = header;
        });
        setMapping(newMapping);
      } else {
        toast.error("O arquivo parece estar vazio ou não pôde ser lido.");
        setFile(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao ler o arquivo.");
    } finally {
      setLoading(false);
    }
  };



// ... existing imports

  const handleDownloadTemplate = () => {
    const data = [
      {
        "Data": "01/01/2025",
        "Descrição": "Compra Dinheiro",
        "Valor": 50.00,
        "Tipo": "Despesa",
        "Categoria": "Alimentação",
        "Pagador": "João",
        "Forma de Pagamento": "Dinheiro",
        "Cartão": "",
        "Conta": "",
        "Condição": "À vista",
        "Total Parcelas": "",
        "Vencimento": "",
        "Anotação": "Teste dinheiro"
      },
      {
        "Data": "02/01/2025",
        "Descrição": "Compra Pix",
        "Valor": 120.00,
        "Tipo": "Despesa",
        "Categoria": "Lazer",
        "Pagador": "Maria",
        "Forma de Pagamento": "Pix",
        "Cartão": "",
        "Conta": "Conta Corrente",
        "Condição": "À vista",
        "Total Parcelas": "",
        "Vencimento": "",
        "Anotação": "Teste pix"
      },
      {
        "Data": "03/01/2025",
        "Descrição": "Compra Crédito à vista",
        "Valor": 200.00,
        "Tipo": "Despesa",
        "Categoria": "Transporte",
        "Pagador": "João",
        "Forma de Pagamento": "Cartão de crédito",
        "Cartão": "Nubank",
        "Conta": "",
        "Condição": "À vista",
        "Total Parcelas": "",
        "Vencimento": "",
        "Anotação": "Teste crédito à vista"
      },
      {
        "Data": "04/01/2025",
        "Descrição": "Compra Débito",
        "Valor": 80.00,
        "Tipo": "Despesa",
        "Categoria": "Saúde",
        "Pagador": "Maria",
        "Forma de Pagamento": "Cartão de débito",
        "Cartão": "",
        "Conta": "Conta Corrente",
        "Condição": "À vista",
        "Total Parcelas": "",
        "Vencimento": "",
        "Anotação": "Teste débito"
      },
      {
        "Data": "05/01/2025",
        "Descrição": "Pagamento Boleto",
        "Valor": 150.00,
        "Tipo": "Despesa",
        "Categoria": "Contas",
        "Pagador": "João",
        "Forma de Pagamento": "Boleto",
        "Cartão": "",
        "Conta": "Conta Corrente",
        "Condição": "À vista",
        "Total Parcelas": "",
        "Vencimento": "10/01/2025",
        "Anotação": "Teste boleto"
      },
      {
        "Data": "06/01/2025",
        "Descrição": "Compra Parcelada 10x",
        "Valor": 1000.00,
        "Tipo": "Despesa",
        "Categoria": "Eletrônicos",
        "Pagador": "Maria",
        "Forma de Pagamento": "Cartão de crédito",
        "Cartão": "Nubank",
        "Conta": "",
        "Condição": "Parcelado",
        "Total Parcelas": 10,
        "Vencimento": "",
        "Anotação": "Teste parcelado"
      },
      {
        "Data": "07/01/2025",
        "Descrição": "Assinatura Recorrente",
        "Valor": 30.00,
        "Tipo": "Despesa",
        "Categoria": "Serviços",
        "Pagador": "João",
        "Forma de Pagamento": "Cartão de crédito",
        "Cartão": "Nubank",
        "Conta": "",
        "Condição": "Recorrente",
        "Total Parcelas": 12,
        "Vencimento": "",
        "Anotação": "Teste recorrente"
      },
      {
        "Data": "08/01/2025",
        "Descrição": "Salário Mensal",
        "Valor": 5000.00,
        "Tipo": "Receita",
        "Categoria": "Salário",
        "Pagador": "João",
        "Forma de Pagamento": "Pix",
        "Cartão": "",
        "Conta": "Conta Corrente",
        "Condição": "À vista",
        "Total Parcelas": "",
        "Vencimento": "",
        "Anotação": "Teste receita pix"
      }
    ];

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Modelo");
    
    // Generate buffer
    const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
    
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importacao.xlsx");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMappedData = () => {
    return parsedData.map((row) => {
      const mapped: any = {};
      Object.entries(mapping).forEach(([key, header]) => {
        mapped[key] = row[header];
      });
      
      let installments = normalizeInstallments(mapped.installments);
      let condition = normalizeCondition(mapped.condition);

      // Auto-detect from description if missing or if we want to be smart
      if (mapped.description) {
        const detected = detectInstallment(mapped.description);
        if (detected) {
          // If detected, use it if installments is missing OR if we want to override
          // Let's use it if installments is missing
          if (!installments) {
            installments = detected.total;
          }
          // If we have installments > 1, it's Parcelado
          if (detected.total > 1 && !condition) {
            condition = "Parcelado";
          }
        }
      }

      // Force Parcelado if installments > 1, unless it is Recorrente
      if (installments && installments > 1 && condition !== "Parcelado" && condition !== "Recorrente") {
        condition = "Parcelado";
      }
      
      // Normalize
      const normalized: any = {
        ...mapped,
        date: normalizeDate(mapped.date),
        amount: normalizeAmount(mapped.amount),
        installments,
        condition,
        paymentMethod: normalizePaymentMethod(mapped.paymentMethod),
        type: normalizeTransactionType(mapped.type),
        dueDate: normalizeDate(mapped.dueDate),
      };

      const errors = validateImportRow(normalized);
      if (errors.length > 0) {
        console.log("Row validation failed:", { mapped, normalized, errors });
      }
      return { ...normalized, isValid: errors.length === 0, errors };
    });
  };

  const handleConfirm = async () => {
    const missingRequired = REQUIRED_FIELDS.filter(f => !mapping[f.key]);
    if (missingRequired.length > 0) {
      toast.error(`Mapeie os campos obrigatórios: ${missingRequired.map(f => f.label).join(", ")}`);
      return;
    }

    const processedData = getMappedData();
    
    // Validate mappings based on data content
    const hasDebit = processedData.some(r => r.paymentMethod === "Cartão de débito");
    if (hasDebit && !mapping.account) {
      toast.error("Você tem lançamentos no Débito, mas a coluna 'Conta' não foi mapeada. Por favor, selecione a coluna de Conta.");
      return;
    }

    const hasInstallments = processedData.some(r => r.condition === "Parcelado" || r.condition === "Recorrente");
    if (hasInstallments && !mapping.installments) {
      toast.error("Você tem lançamentos Parcelados ou Recorrentes, mas a coluna 'Total Parcelas' não foi mapeada.");
      return;
    }

    const validRows = processedData.filter((r: any) => r.isValid);

    if (validRows.length === 0) {
      const firstError = processedData[0]?.errors[0] || "Erro desconhecido";
      toast.error(`Nenhum registro válido. Exemplo de erro: ${firstError}`);
      return;
    }

    if (validRows.length < processedData.length) {
      const confirm = window.confirm(`Existem ${processedData.length - validRows.length} registros inválidos que serão ignorados. Deseja continuar?`);
      if (!confirm) return;
    }

    setLoading(true);
    try {
      const payload: ImportRowInput[] = validRows.map((r: any) => ({
        date: r.date,
        period: r.period,
        description: r.description,
        amount: r.amount,
        type: r.type,
        category: r.category,
        pagador: r.pagador,
        paymentMethod: r.paymentMethod,
        card: r.card,
        account: r.account,
        condition: r.condition,
        installments: r.installments,
        dueDate: r.dueDate,
        note: r.note,
      }));

      const result = await importLancamentosAction(payload);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(result.message);
      onOpenChange(false);
      setFile(null);
      setParsedData([]);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Erro ao importar.");
    } finally {
      setLoading(false);
    }
  };

  const processedPreview = parsedData.length > 0 ? getMappedData().slice(0, 50) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] h-[90vh] sm:max-w-[900px] flex flex-col p-4 sm:p-6 gap-0 rounded-lg">
        <DialogHeader className="shrink-0 mb-4">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>Importar Lançamentos</DialogTitle>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              Baixar Modelo
            </Button>
          </div>
          <DialogDescription>
            Carregue um arquivo e mapeie as colunas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-4">
          {!file ? (
            <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-12 bg-muted/10 h-full">
              <div className="text-center">
                <RiUploadCloud2Line className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                  >
                    <span>Selecione um arquivo</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  CSV, XLS, XLSX
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 h-full min-h-0">
              <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/20 shrink-0 overflow-y-auto max-h-[40vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {REQUIRED_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <Label className="text-xs font-semibold text-primary">{field.label} *</Label>
                      <Select
                        value={mapping[field.key] || ""}
                        onValueChange={(v) => setMapping({ ...mapping, [field.key]: v })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {headers.map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full flex justify-between items-center h-8 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setShowOptional(!showOptional)}
                  >
                    <span>Campos Opcionais ({OPTIONAL_FIELDS.length})</span>
                    {showOptional ? (
                      <RiArrowUpSLine className="size-4" />
                    ) : (
                      <RiArrowDownSLine className="size-4" />
                    )}
                  </Button>
                  
                  {showOptional && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t">
                      {OPTIONAL_FIELDS.map((field) => (
                        <div key={field.key} className="space-y-1">
                          <Label className="text-xs text-muted-foreground">{field.label}</Label>
                          <Select
                            value={mapping[field.key] || ""}
                            onValueChange={(v) => setMapping({ ...mapping, [field.key]: v })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Selecionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {headers.map((h) => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 border rounded-md overflow-auto relative bg-background">
                <div className="absolute inset-0 overflow-auto">
                  <Table className="min-w-[800px]">
                    <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="w-[30px]"></TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Condição</TableHead>
                        <TableHead>Parcelas</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedPreview.map((row: any, i: number) => (
                        <TableRow key={i} className={!row.isValid ? "bg-red-50 dark:bg-red-900/10" : ""}>
                          <TableCell>
                            {row.isValid ? (
                              <RiCheckLine className="size-4 text-green-500" />
                            ) : (
                              <RiAlertLine className="size-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{row.date}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={row.description}>{row.description}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.amount}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.type}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.condition}</TableCell>
                          <TableCell className="whitespace-nowrap">{row.installments}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={row.errors.join(", ")}>
                            {row.errors.length > 0 ? row.errors.join(", ") : "OK"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground shrink-0 pt-2">
                <span>
                  {parsedData.length} registros encontrados.
                </span>
                <Button variant="ghost" size="sm" onClick={() => {
                  setFile(null);
                  setParsedData([]);
                  setMapping({});
                  setShowOptional(false);
                }}>
                  Trocar arquivo
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!file || loading || parsedData.length === 0}
          >
            {loading && <Spinner className="mr-2 h-4 w-4" />}
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
