"use client";

import {
  createMassLancamentosAction,
  deleteLancamentoAction,
  deleteLancamentoBulkAction,
  deleteMultipleLancamentosAction,
  toggleLancamentoSettlementAction,
  updateLancamentoBulkAction,
  updateMultipleLancamentosAction,
} from "@/app/(dashboard)/lancamentos/actions";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { AnticipateInstallmentsDialog } from "../dialogs/anticipate-installments-dialog/anticipate-installments-dialog";
import { AnticipationHistoryDialog } from "../dialogs/anticipate-installments-dialog/anticipation-history-dialog";
import { BulkActionDialog, type BulkActionScope } from "../dialogs/bulk-action-dialog";
import { BulkEditMultipleDialog } from "../dialogs/bulk-edit-multiple-dialog";
import { LancamentoDetailsDialog } from "../dialogs/lancamento-details-dialog";
import { LancamentoDialog } from "../dialogs/lancamento-dialog/lancamento-dialog";
import { LancamentosTable } from "../table/lancamentos-table";
import { MassAddDialog, type MassAddFormData } from "../dialogs/mass-add-dialog";
import type {
  ContaCartaoFilterOption,
  LancamentoFilterOption,
  LancamentoItem,
  SelectOption,
} from "../types";

interface LancamentosPageProps {
  lancamentos: LancamentoItem[];
  pagadorOptions: SelectOption[];
  splitPagadorOptions: SelectOption[];
  defaultPagadorId: string | null;
  contaOptions: SelectOption[];
  cartaoOptions: SelectOption[];
  categoriaOptions: SelectOption[];
  pagadorFilterOptions: LancamentoFilterOption[];
  categoriaFilterOptions: LancamentoFilterOption[];
  contaCartaoFilterOptions: ContaCartaoFilterOption[];
  selectedPeriod: string;
  estabelecimentos: string[];
  allowCreate?: boolean;
  defaultCartaoId?: string | null;
  defaultPaymentMethod?: string | null;
  lockCartaoSelection?: boolean;
  lockPaymentMethod?: boolean;
}

export function LancamentosPage({
  lancamentos,
  pagadorOptions,
  splitPagadorOptions,
  defaultPagadorId,
  contaOptions,
  cartaoOptions,
  categoriaOptions,
  pagadorFilterOptions,
  categoriaFilterOptions,
  contaCartaoFilterOptions,
  selectedPeriod,
  estabelecimentos,
  allowCreate = true,
  defaultCartaoId,
  defaultPaymentMethod,
  lockCartaoSelection,
  lockPaymentMethod,
}: LancamentosPageProps) {
  const [selectedLancamento, setSelectedLancamento] =
    useState<LancamentoItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [massAddOpen, setMassAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [lancamentoToDelete, setLancamentoToDelete] =
    useState<LancamentoItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [settlementLoadingId, setSettlementLoadingId] = useState<string | null>(
    null
  );
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<{
    id: string;
    name: string;
    categoriaId: string | undefined;
    note: string;
    pagadorId: string | undefined;
    contaId: string | undefined;
    cartaoId: string | undefined;
    amount: number;
    dueDate: string | null;
    boletoPaymentDate: string | null;
    lancamento: LancamentoItem;
  } | null>(null);
  const [pendingDeleteData, setPendingDeleteData] =
    useState<LancamentoItem | null>(null);
  const [multipleBulkDeleteOpen, setMultipleBulkDeleteOpen] = useState(false);
  const [pendingMultipleDeleteData, setPendingMultipleDeleteData] = useState<
    LancamentoItem[]
  >([]);
  const [anticipateOpen, setAnticipateOpen] = useState(false);
  const [anticipationHistoryOpen, setAnticipationHistoryOpen] = useState(false);
  const [selectedForAnticipation, setSelectedForAnticipation] =
    useState<LancamentoItem | null>(null);

  const handleToggleSettlement = useCallback(async (item: LancamentoItem) => {
    if (item.paymentMethod === "Cartão de crédito") {
      toast.info(
        "Pagamentos com cartão são conciliados automaticamente. Ajuste pelo cartão."
      );
      return;
    }

    const supportedMethods = ["Pix", "Boleto", "Dinheiro", "Cartão de débito"];
    if (!supportedMethods.includes(item.paymentMethod)) {
      return;
    }

    const nextValue = !Boolean(item.isSettled);

    try {
      setSettlementLoadingId(item.id);
      const result = await toggleLancamentoSettlementAction({
        id: item.id,
        value: nextValue,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success(result.message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o pagamento.";
      toast.error(message);
    } finally {
      setSettlementLoadingId(null);
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!lancamentoToDelete) {
      return;
    }

    const result = await deleteLancamentoAction({
      id: lancamentoToDelete.id,
    });

    if (!result.success) {
      toast.error(result.error);
      throw new Error(result.error);
    }

    toast.success(result.message);
    setDeleteOpen(false);
  }, [lancamentoToDelete]);

  const handleBulkDelete = useCallback(
    async (scope: BulkActionScope) => {
      if (!pendingDeleteData) {
        return;
      }

      const result = await deleteLancamentoBulkAction({
        id: pendingDeleteData.id,
        scope,
      });

      if (!result.success) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success(result.message);
      setBulkDeleteOpen(false);
      setPendingDeleteData(null);
    },
    [pendingDeleteData]
  );

  const handleBulkEditRequest = useCallback(
    (data: {
      id: string;
      name: string;
      categoriaId: string | undefined;
      note: string;
      pagadorId: string | undefined;
      contaId: string | undefined;
      cartaoId: string | undefined;
      amount: number;
      dueDate: string | null;
      boletoPaymentDate: string | null;
    }) => {
      if (!selectedLancamento) {
        return;
      }

      setPendingEditData({
        ...data,
        lancamento: selectedLancamento,
      });
      setEditOpen(false);
      setBulkEditOpen(true);
    },
    [selectedLancamento]
  );

  const handleBulkEdit = useCallback(
    async (scope: BulkActionScope) => {
      if (!pendingEditData) {
        return;
      }

      const result = await updateLancamentoBulkAction({
        id: pendingEditData.id,
        scope,
        name: pendingEditData.name,
        categoriaId: pendingEditData.categoriaId,
        note: pendingEditData.note,
        pagadorId: pendingEditData.pagadorId,
        contaId: pendingEditData.contaId,
        cartaoId: pendingEditData.cartaoId,
        amount: pendingEditData.amount,
        dueDate: pendingEditData.dueDate,
        boletoPaymentDate: pendingEditData.boletoPaymentDate,
      });

      if (!result.success) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success(result.message);
      setBulkEditOpen(false);
      setPendingEditData(null);
    },
    [pendingEditData]
  );

  const handleMassAddSubmit = useCallback(async (data: MassAddFormData) => {
    const result = await createMassLancamentosAction(data);

    if (!result.success) {
      toast.error(result.error);
      throw new Error(result.error);
    }

    toast.success(result.message);
  }, []);

  const handleMultipleBulkDelete = useCallback((items: LancamentoItem[]) => {
    setPendingMultipleDeleteData(items);
    setMultipleBulkDeleteOpen(true);
  }, []);

  const confirmMultipleBulkDelete = useCallback(async () => {
    if (pendingMultipleDeleteData.length === 0) {
      return;
    }

    const ids = pendingMultipleDeleteData.map((item) => item.id);
    const result = await deleteMultipleLancamentosAction({ ids });

    if (!result.success) {
      toast.error(result.error);
      throw new Error(result.error);
    }

    toast.success(result.message);
    setMultipleBulkDeleteOpen(false);
    setPendingMultipleDeleteData([]);
  }, [pendingMultipleDeleteData]);

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleMassAdd = useCallback(() => {
    setMassAddOpen(true);
  }, []);

  const handleEdit = useCallback((item: LancamentoItem) => {
    setSelectedLancamento(item);
    setEditOpen(true);
  }, []);

  const handleConfirmDelete = useCallback((item: LancamentoItem) => {
    if (item.seriesId) {
      setPendingDeleteData(item);
      setBulkDeleteOpen(true);
    } else {
      setLancamentoToDelete(item);
      setDeleteOpen(true);
    }
  }, []);

  const handleViewDetails = useCallback((item: LancamentoItem) => {
    setSelectedLancamento(item);
    setDetailsOpen(true);
  }, []);

  const handleAnticipate = useCallback((item: LancamentoItem) => {
    setSelectedForAnticipation(item);
    setAnticipateOpen(true);
  }, []);

  const handleViewAnticipationHistory = useCallback((item: LancamentoItem) => {
    setSelectedForAnticipation(item);
    setAnticipationHistoryOpen(true);
  }, []);

  const [bulkEditMultipleOpen, setBulkEditMultipleOpen] = useState(false);
  const [selectedForBulkEdit, setSelectedForBulkEdit] = useState<
    LancamentoItem[]
  >([]);

  const handleMultipleBulkEdit = useCallback((items: LancamentoItem[]) => {
    // Filter only "À vista" items or handle mixed types if needed
    // For now, we might want to restrict to "À vista" or just allow common fields editing
    const validItems = items.filter(
      (item) => item.condition === "À vista" || item.condition === "Parcelado"
    );

    if (validItems.length === 0) {
      toast.error("Nenhum lançamento válido selecionado para edição.");
      return;
    }

    if (validItems.length !== items.length) {
      toast.warning(
        "Alguns itens foram ignorados pois não suportam edição em massa."
      );
    }

    // Validate that all items have the same transaction type
    const firstType = validItems[0].transactionType;
    const hasMixedTypes = validItems.some(
      (item) => item.transactionType !== firstType
    );

    if (hasMixedTypes) {
      toast.error(
        "Selecione apenas lançamentos do mesmo tipo (Despesa, Receita ou Transferência) para edição em massa."
      );
      return;
    }

    setSelectedForBulkEdit(validItems);
    setBulkEditMultipleOpen(true);
  }, []);

  const confirmMultipleBulkEdit = useCallback(
    async (data: {
      categoriaId?: string;
      pagadorId?: string;
      contaId?: string;
      cartaoId?: string;
    }) => {
      if (selectedForBulkEdit.length === 0) {
        return;
      }

      const ids = selectedForBulkEdit.map((item) => item.id);
      const result = await updateMultipleLancamentosAction({
        ids,
        ...data,
      });

      if (!result.success) {
        toast.error(result.error);
        throw new Error(result.error);
      }

      toast.success(result.message);
      setBulkEditMultipleOpen(false);
      setSelectedForBulkEdit([]);
    },
    [selectedForBulkEdit]
  );

  return (
    <>
      <LancamentosTable
        data={lancamentos}
        pagadorFilterOptions={pagadorFilterOptions}
        categoriaFilterOptions={categoriaFilterOptions}
        contaCartaoFilterOptions={contaCartaoFilterOptions}
        onCreate={allowCreate ? handleCreate : undefined}
        onMassAdd={allowCreate ? handleMassAdd : undefined}
        onEdit={handleEdit}
        onConfirmDelete={handleConfirmDelete}
        onBulkDelete={handleMultipleBulkDelete}
        onBulkEdit={handleMultipleBulkEdit}
        onViewDetails={handleViewDetails}
        onToggleSettlement={handleToggleSettlement}
        onAnticipate={handleAnticipate}
        onViewAnticipationHistory={handleViewAnticipationHistory}
        isSettlementLoading={(id) => settlementLoadingId === id}
      />

      {allowCreate ? (
        <LancamentoDialog
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          pagadorOptions={pagadorOptions}
          splitPagadorOptions={splitPagadorOptions}
          defaultPagadorId={defaultPagadorId}
          contaOptions={contaOptions}
          cartaoOptions={cartaoOptions}
          categoriaOptions={categoriaOptions}
          estabelecimentos={estabelecimentos}
          defaultPeriod={selectedPeriod}
          defaultCartaoId={defaultCartaoId}
          defaultPaymentMethod={defaultPaymentMethod}
          lockCartaoSelection={lockCartaoSelection}
          lockPaymentMethod={lockPaymentMethod}
        />
      ) : null}

      <LancamentoDialog
        mode="update"
        open={editOpen && !!selectedLancamento}
        onOpenChange={setEditOpen}
        pagadorOptions={pagadorOptions}
        splitPagadorOptions={splitPagadorOptions}
        defaultPagadorId={defaultPagadorId}
        contaOptions={contaOptions}
        cartaoOptions={cartaoOptions}
        categoriaOptions={categoriaOptions}
        estabelecimentos={estabelecimentos}
        lancamento={selectedLancamento ?? undefined}
        defaultPeriod={selectedPeriod}
        onBulkEditRequest={handleBulkEditRequest}
      />

      <LancamentoDetailsDialog
        open={detailsOpen && !!selectedLancamento}
        onOpenChange={(open) => {
          setDetailsOpen(open);
          if (!open) {
            setSelectedLancamento(null);
          }
        }}
        lancamento={detailsOpen ? selectedLancamento : null}
      />

      <ConfirmActionDialog
        open={deleteOpen && !!lancamentoToDelete}
        onOpenChange={setDeleteOpen}
        title={
          lancamentoToDelete
            ? `Remover lançamento "${lancamentoToDelete.name}"?`
            : "Remover lançamento?"
        }
        description="Essa ação é irreversível e removerá o lançamento de forma permanente."
        confirmLabel="Remover"
        pendingLabel="Removendo..."
        confirmVariant="destructive"
        onConfirm={handleDelete}
        disabled={!lancamentoToDelete}
      />

      <BulkActionDialog
        open={bulkDeleteOpen && !!pendingDeleteData}
        onOpenChange={setBulkDeleteOpen}
        actionType="delete"
        seriesType={
          pendingDeleteData?.condition === "Parcelado"
            ? "installment"
            : "recurring"
        }
        currentNumber={pendingDeleteData?.currentInstallment ?? undefined}
        totalCount={
          pendingDeleteData?.installmentCount ??
          pendingDeleteData?.recurrenceCount ??
          undefined
        }
        onConfirm={handleBulkDelete}
      />

      <BulkActionDialog
        open={bulkEditOpen && !!pendingEditData}
        onOpenChange={setBulkEditOpen}
        actionType="edit"
        seriesType={
          pendingEditData?.lancamento.condition === "Parcelado"
            ? "installment"
            : "recurring"
        }
        currentNumber={
          pendingEditData?.lancamento.currentInstallment ?? undefined
        }
        totalCount={
          pendingEditData?.lancamento.installmentCount ??
          pendingEditData?.lancamento.recurrenceCount ??
          undefined
        }
        onConfirm={handleBulkEdit}
      />

      {allowCreate ? (
        <MassAddDialog
          open={massAddOpen}
          onOpenChange={setMassAddOpen}
          onSubmit={handleMassAddSubmit}
          pagadorOptions={pagadorOptions}
          contaOptions={contaOptions}
          cartaoOptions={cartaoOptions}
          categoriaOptions={categoriaOptions}
          estabelecimentos={estabelecimentos}
          selectedPeriod={selectedPeriod}
          defaultPagadorId={defaultPagadorId}
        />
      ) : null}

      <ConfirmActionDialog
        open={multipleBulkDeleteOpen && pendingMultipleDeleteData.length > 0}
        onOpenChange={setMultipleBulkDeleteOpen}
        title={`Remover ${pendingMultipleDeleteData.length} ${
          pendingMultipleDeleteData.length === 1 ? "lançamento" : "lançamentos"
        }?`}
        description="Essa ação é irreversível e removerá os lançamentos selecionados de forma permanente."
        confirmLabel="Remover"
        pendingLabel="Removendo..."
        confirmVariant="destructive"
        onConfirm={confirmMultipleBulkDelete}
        disabled={pendingMultipleDeleteData.length === 0}
      />

      {/* Dialogs de Antecipação */}
      {selectedForAnticipation && (
        <AnticipateInstallmentsDialog
          open={anticipateOpen}
          onOpenChange={setAnticipateOpen}
          seriesId={selectedForAnticipation.seriesId!}
          lancamentoName={selectedForAnticipation.name}
          categorias={categoriaOptions.map((c) => ({
            id: c.value,
            name: c.label,
            icon: c.icon ?? null,
          }))}
          pagadores={pagadorOptions.map((p) => ({
            id: p.value,
            name: p.label,
          }))}
          defaultPeriod={selectedPeriod}
        />
      )}

      {selectedForAnticipation && (
        <AnticipationHistoryDialog
          open={anticipationHistoryOpen}
          onOpenChange={setAnticipationHistoryOpen}
          seriesId={selectedForAnticipation.seriesId!}
          lancamentoName={selectedForAnticipation.name}
          onViewLancamento={(lancamentoId) => {
            const lancamento = lancamentos.find((l) => l.id === lancamentoId);
            if (lancamento) {
              setSelectedLancamento(lancamento);
              setDetailsOpen(true);
              setAnticipationHistoryOpen(false);
            }
          }}
        />
      )}

      <BulkEditMultipleDialog
        open={bulkEditMultipleOpen}
        onOpenChange={setBulkEditMultipleOpen}
        count={selectedForBulkEdit.length}
        transactionType={selectedForBulkEdit[0]?.transactionType}
        onConfirm={confirmMultipleBulkEdit}
        pagadorOptions={pagadorOptions}
        contaOptions={contaOptions}
        cartaoOptions={cartaoOptions}
        categoriaOptions={categoriaOptions}
      />
    </>
  );
}
