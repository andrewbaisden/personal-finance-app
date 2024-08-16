'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Transaction() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('/api/transaction', { recipient, amount });
    alert('Transaction successful!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="recipient"
        placeholder="Recipient Account Number"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="input"
      />
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input"
      />
      <button type="submit" className="btn">
        Send Money
      </button>
    </form>
  );
}
