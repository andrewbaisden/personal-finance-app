'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
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

    if (res.ok && amount > 0) {
      setMessage('Transaction successful!');
      fetchUserInfo(token); // Refresh user info after successful transaction
      setRecipientAccount('');
      setAmount(0);
    } else if (amount <= 0) {
      setMessage(`Error: The amount you send, needs to be higher than 0`);
    } else {
      const errorData = await res.json();
      setMessage(`Error: ${errorData.error}`);
    }
  };

  if (!userInfo) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div>
        <Header />
      </div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Transaction Page</h1>
        <div className="mb-4">
          <h1 className="text-2xl">{userInfo.name}</h1>
          <p className="mt-4 mb-4">Email: {userInfo.email}</p>
          <p className="mt-4 mb-4">Account Number: {userInfo.accountNumber}</p>
          <p className="bg-slate-200 p-4">
            Balance: ${userInfo.balance.toFixed(2)}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-slate-800 text-white px-4 py-2 rounded mb-4"
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
            className="bg-green-400 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </form>
        {message && <p className="mt-4 text-center font-bold">{message}</p>}
      </div>
    </div>
  );
}
