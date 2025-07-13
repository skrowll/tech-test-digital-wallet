"use client";
import { Plus, Minus, ArrowLeftRight } from "lucide-react";

interface TransactionCardProps {
  type: "deposit" | "withdraw" | "transfer";
  title: string;
  description: string;
  onClick?: () => void;
}

const TransactionCard = ({ type, title, description, onClick }: TransactionCardProps) => {
  const getIconAndColor = () => {
    switch (type) {
      case "deposit":
        return {
          iconColor: "bg-green-900 dark:bg-green-500",
          icon: <Plus className="w-5 h-5 text-green-500 dark:text-green-800" />
        };
      case "withdraw":
        return {
          iconColor: "bg-red-900 dark:bg-red-500",
          icon: <Minus className="w-5 h-5 text-red-500 dark:text-red-800" />
        };
      case "transfer":
        return {
          iconColor: "bg-blue-900 dark:bg-blue-500",
          icon: <ArrowLeftRight className="w-5 h-5 text-blue-500 dark:text-blue-800" />
        };
      default:
        return {
          iconColor: "bg-gray-600",
          icon: null
        };
    }
  };

  const { iconColor, icon } = getIconAndColor();

  return (
    <div 
      className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#3a3a3a] rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 cursor-pointer dark:from-gray-100 dark:to-gray-50 dark:border-gray-300"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-white dark:text-gray-900">{title}</h3>
          <p className="text-sm text-gray-400 dark:text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
};

interface TransactionCardsProps {
  onDepositClick?: () => void;
  onWithdrawClick?: () => void;
  onTransferClick?: () => void;
}

export default function TransactionCards({ 
  onDepositClick, 
  onWithdrawClick, 
  onTransferClick 
}: TransactionCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <TransactionCard
        type="deposit"
        title="Depósito"
        description="Adicionar fundos"
        onClick={onDepositClick}
      />
      <TransactionCard
        type="withdraw"
        title="Saque"
        description="Retirar fundos"
        onClick={onWithdrawClick}
      />
      <TransactionCard
        type="transfer"
        title="Transferência"
        description="Enviar dinheiro"
        onClick={onTransferClick}
      />
    </div>
  );
}
