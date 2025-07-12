'use client';
import { useState } from 'react';
import { mutate } from 'swr';

export default function DepositForm({ accountId }: { accountId: string }) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          amount: parseFloat(amount)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Depósito de R$ ${amount} realizado!`);
        setAmount('');
        
        mutate('/api/accounts');
        
        mutate(`/api/accounts/${accountId}`);

        mutate('/api/transactions');
        
        mutate(`/api/transactions/${accountId}`);
      } else {
        setMessage(data.error || 'Erro ao depositar');
      }
    } catch (error) {
      console.error(error);
      setMessage('Falha na conexão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor"
          className="w-full p-2 border rounded"
          required
          step="0.01"
          min="0.01"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-blue-300"
        >
          {isLoading ? 'Processando...' : 'Depositar'}
        </button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}