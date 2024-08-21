'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfo {
  name: string;
  email: string;
  accountNumber: string;
  balance: number;
}

export default function TransactionPage() {
  const [recipientAccount, setRecipientAccount] = useState('');
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    } else {
      fetchUserInfo(token);
    }
  }, []); // Empty dependency array to run only once on mount

  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUserInfo(data);
      } else {
        // Token might be invalid or expired
        localStorage.removeItem('token');
        router.push('/signin');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setMessage('Error fetching user information');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    router.push('/signin');
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    const res = await fetch('/api/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recipientAccount, amount }),
    });

    if (res.ok) {
      setMessage('Transaction successful!');
      fetchUserInfo(token); // Refresh user info after successful transaction
    } else {
      const errorData = await res.json();
      setMessage(`Error: ${errorData.error}`);
    }
  };

  if (!userInfo) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transaction Page</h1>
      <div className="mb-4">
        <p>Name: {userInfo.name}</p>
        <p>Email: {userInfo.email}</p>
        <p>Account Number: {userInfo.accountNumber}</p>
        <p>Balance: ${userInfo.balance.toFixed(2)}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
      >
        Sign Out
      </button>
      <form onSubmit={handleTransaction} className="space-y-4">
        <input
          type="text"
          value={recipientAccount}
          onChange={(e) => setRecipientAccount(e.target.value)}
          placeholder="Recipient Account Number"
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Amount"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
      {message && <p className="mt-4 text-center font-bold">{message}</p>}
    </div>
  );
}
