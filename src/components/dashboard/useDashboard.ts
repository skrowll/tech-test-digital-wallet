/**
 * Hooks customizados para a página de dashboard
 * Centraliza lógica de estado seguindo o princípio DRY
 */

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useAccounts, useDeposit, useWithdraw, useTransfer } from '@/hooks';
import { useErrorHandler } from '@/components/base';
import { showToast } from '@/utils/toast';
import { formatCurrency } from '@/utils/currency';
import type { TransactionSummary } from '@/types';

/**
 * Interface para estado do painel de transação
 */
interface TransactionPanelState {
  isOpen: boolean;
  type: "deposit" | "withdraw" | "transfer" | null;
}

/**
 * Interface para estado do modal de confirmação
 */
interface ConfirmationModalState {
  isOpen: boolean;
  transaction: TransactionSummary | null;
  isLoading: boolean;
}

/**
 * Interface para sidebar state
 */
interface SidebarState {
  isExpanded: boolean;
}

/**
 * Hook customizado para gerenciar o estado do dashboard
 * Aplica o princípio Single Responsibility separando concerns
 */
export function useDashboardState() {
  const { data: session, status } = useSession();
  const handleError = useErrorHandler('Dashboard');

  // Hooks para operações (devem ser chamados sempre)
  const { data: accounts, loading: isLoading, error } = useAccounts();
  const { deposit } = useDeposit();
  const { withdraw } = useWithdraw();
  const { transfer } = useTransfer();

  // Estados da UI
  const [sidebarState, setSidebarState] = useState<SidebarState>({
    isExpanded: false
  });

  const [transactionPanel, setTransactionPanel] = useState<TransactionPanelState>({
    isOpen: false,
    type: null,
  });

  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
    isOpen: false,
    transaction: null,
    isLoading: false,
  });

  // Verificar autenticação depois dos hooks
  if (status === "loading") {
    return { 
      loading: true,
      session: null,
      user: null,
      accounts: null,
      isLoading: true,
      error: null,
      deposit,
      withdraw,
      transfer,
      sidebarState,
      transactionPanel,
      confirmationModal,
      setSidebarState,
      setTransactionPanel,
      setConfirmationModal,
      handleError
    };
  }

  if (!session?.user) {
    redirect("/auth/login");
  }

  return {
    // Dados da sessão
    session,
    user: session.user,
    
    // Dados das contas
    accounts,
    isLoading,
    error,
    
    // Operações
    deposit,
    withdraw,
    transfer,
    
    // Estados da UI
    sidebarState,
    transactionPanel,
    confirmationModal,
    
    // Setters
    setSidebarState,
    setTransactionPanel,
    setConfirmationModal,
    
    // Utils
    handleError,
    loading: false
  };
}

/**
 * Hook para ações do dashboard
 * Centraliza toda a lógica de ações seguindo o princípio DRY
 */
export function useDashboardActions(
  dashboardState: ReturnType<typeof useDashboardState>
) {
  const {
    deposit,
    withdraw,
    transfer,
    accounts,
    setSidebarState,
    setTransactionPanel,
    setConfirmationModal,
    handleError
  } = dashboardState;

  /**
   * Alterna o estado da sidebar
   */
  const handleSidebarToggle = useCallback(() => {
    setSidebarState?.(prev => ({
      ...prev,
      isExpanded: !prev.isExpanded
    }));
  }, [setSidebarState]);

  /**
   * Abre o painel de transação
   */
  const handleTransactionClick = useCallback((type: "deposit" | "withdraw" | "transfer") => {
    setTransactionPanel?.({
      isOpen: true,
      type: type,
    });
  }, [setTransactionPanel]);

  /**
   * Fecha o painel de transação
   */
  const closeTransactionPanel = useCallback(() => {
    setTransactionPanel?.({
      isOpen: false,
      type: null,
    });
  }, [setTransactionPanel]);

  /**
   * Manipula sucesso de transação
   */
  const handleTransactionSuccess = useCallback(() => {
    closeTransactionPanel();
    setConfirmationModal?.({
      isOpen: false,
      transaction: null,
      isLoading: false,
    });
  }, [closeTransactionPanel, setConfirmationModal]);

  /**
   * Mostra modal de confirmação
   */
  const handleShowConfirmation = useCallback((transaction: TransactionSummary) => {
    setConfirmationModal?.({
      isOpen: true,
      transaction,
      isLoading: false,
    });
  }, [setConfirmationModal]);

  /**
   * Executa a transação confirmada
   */
  const handleConfirmTransaction = useCallback(async () => {
    const transaction = dashboardState.confirmationModal?.transaction;
    
    if (!transaction || !accounts?.[0]?.id) return;

    setConfirmationModal?.(prev => ({ ...prev, isLoading: true }));

    try {
      const accountId = accounts[0].id;
      let result;

      // Executar transação baseada no tipo
      switch (transaction.type) {
        case 'deposit':
          result = await deposit({
            accountId,
            amount: transaction.amount,
            ...(transaction.description && { description: transaction.description })
          });
          break;
          
        case 'withdraw':
          result = await withdraw({
            accountId,
            amount: transaction.amount,
            ...(transaction.description && { description: transaction.description })
          });
          break;
          
        case 'transfer':
          result = await transfer({
            sourceAccountId: accountId,
            targetEmail: transaction.targetEmail!,
            amount: transaction.amount,
            ...(transaction.description && { description: transaction.description })
          });
          break;
          
        default:
          throw new Error('Tipo de transação inválido');
      }

      if (result?.success) {
        // Mostrar notificação de sucesso
        const transactionTypeMap: Record<string, string> = {
          deposit: 'Depósito',
          withdraw: 'Saque',
          transfer: 'Transferência'
        };
        
        const transactionTypeText = transactionTypeMap[transaction.type] || 'Transação';
        
        showToast.success(
          `${transactionTypeText} de R$ ${formatCurrency(transaction.amount)} realizado com sucesso!`
        );
        
        // Fechar modal e painel
        handleTransactionSuccess();
      } else {
        showToast.error(result?.error || 'Erro ao processar transação');
        setConfirmationModal?.(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      handleError(error as Error, 'confirm transaction');
      setConfirmationModal?.(prev => ({ ...prev, isLoading: false }));
    }
  }, [
    dashboardState.confirmationModal,
    accounts,
    deposit,
    withdraw,
    transfer,
    setConfirmationModal,
    handleTransactionSuccess,
    handleError
  ]);

  /**
   * Cancela a transação
   */
  const handleCancelTransaction = useCallback(() => {
    setConfirmationModal?.({
      isOpen: false,
      transaction: null,
      isLoading: false,
    });
  }, [setConfirmationModal]);

  return {
    handleSidebarToggle,
    handleTransactionClick,
    closeTransactionPanel,
    handleTransactionSuccess,
    handleShowConfirmation,
    handleConfirmTransaction,
    handleCancelTransaction
  };
}
