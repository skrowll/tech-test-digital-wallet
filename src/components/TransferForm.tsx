'use client';
import { useState } from 'react';
import { mutate } from 'swr';

export default function TransferForm({ accountId }: { accountId: string }) {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceAccountId: accountId,
          targetEmail: email,
          amount: parseFloat(amount)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Transferência de R$ ${amount} realizada para ${email}!`);
        setAmount('');
        setEmail('');
        
        mutate('/api/accounts');
      } else {
        setMessage(data.error || 'Erro na transferência');
      }
    } catch (error) {
      console.log(error);
      setMessage('Falha na conexão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-lg mb-3">Transferir</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Para (e-mail)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Processando...' : 'Transferir'}
        </button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}