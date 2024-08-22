// src/app/page.tsx

'use client';

import { useState } from 'react';

export default function Home() {
  const [userId, setUserId] = useState<number | ''>('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (typeof userId !== 'number') {
      setError('User ID must be a number');
      return;
    }

    try {
      const response = await fetch('/api/generatejwt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setError(null);
      } else {
        setError(data.error || 'Failed to generate token');
        setToken(null);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setToken(null);
    }
  };

  return (
    <div>
      <h1>Generate JWT Token</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="userId">User ID:</label>
          <input
            type="number"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(Number(e.target.value))}
            required
          />
        </div>
        <button type="submit">Generate Token</button>
      </form>
      {token && (
        <div>
          <h2>Generated Token:</h2>
          <p>{token}</p>
        </div>
      )}
      {error && (
        <div>
          <h2>Error:</h2>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
