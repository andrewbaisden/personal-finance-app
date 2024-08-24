'use client';
import { useState } from 'react';
import Header from './components/Header';

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

      if (response.ok && userId !== 0) {
        setToken(data.token);
        setError(null);
      } else if (userId === 0) {
        setError('Id needs to be higher than zero');
        setToken(null);
      } else {
        setError(data.error || 'Failed to generate token');
        setToken(null);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setToken(null);
    }
  };

  const curlCommand = `curl -v POST http://localhost:3000/api/transaction \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyLCJpYXQiOjE3MjQ1MDMwMTUsImV4cCI6MTcyNDUwNjYxNX0.h2i9_-PgEq2W76rAABRqTQesBIf1LSugK6_ILE9pKM8" \
-H "Content-Type: application/json" \
-d '{"recipientAccount": "ACC616021", "amount": 1000}'`;

  return (
    <div>
      <Header />
      <main className="flex flex-col flex-wrap justify-center">
        <article className="text-center m-4">
          <h1 className="text-6xl uppercase mb-4">
            A single account for all your money needs worldwide!
          </h1>
          <p className="pt-4 pr-4 pb-4 pl-4 text-2xl md:pl-4 md:pr-4 sm:pl-4 sm:pr-4">
            Sending money should not be difficult. Easily generate income
            worldwide with just a few clicks.
          </p>
        </article>

        <section className="bg-rose-400 p-6 text-white">
          <article className="text-left m-4">
            <h1 className="text-3xl mb-4">
              How to add money to the balance of a user account
            </h1>
            <p className="mt-4 mb-4">
              Sign-in and registration forms work; however, all users start with
              zero balance in their account.
            </p>
            <p>
              We can simulate a bank transfer by using an SQL query to add funds
              to a user's bank balance. We can also simulate bank transfers
              between users by generating a valid JWT Token for a user in the
              database. These methods will let us send money to a user's bank
              account as long as the user who is sending the money has the funds
              available. All users start with a balance of zero when they
              register for an account, and users will need money in their bank
              accounts so that we can test internal bank transactions between
              users.
            </p>
            <h2 className="text-2xl mt-4 mb-4">Add money using SQL</h2>
            <p className="mt-4 mb-4">
              First, register some users and create accounts for them if you
              still need to do so. Now connect to your SQLite database, find a
              user whose account you want to add funds to, and make a note of
              their ID. Now copy this SQL query; you can change the balance if
              you want to. The important thing is that you change the ID to the
              account that you want to credit. Run the SQL query and refresh or
              check your database. The user should now have funds in their
              account under balance.
            </p>
            <textarea className="text-black p-2 h-40 w-full">
              UPDATE User SET balance = 100000000 WHERE id = 10;
            </textarea>
            <h2 className="text-2xl mt-4 mb-4">
              Use a Curl command to add money into a user's account
            </h2>
            <p>
              Remember that users need funds inside their accounts before they
              can make bank transfers. So, you have to do this using an SQL
              query first; otherwise, the user will have insufficient funds to
              send.
            </p>
            <p className="mt-4 mb-4">
              Locate the user's ID inside the SQLite database and then enter the
              ID number into the form input. If you are using VSCode you can use
              the SQLite Viewer extension to view the data inside of the SQLite
              database located inside <code>prisma/dev.db</code>.
            </p>
            <p className="mt-4 mb-4">
              Generate a token and then go to the next step where we create the
              Curl command.
            </p>
          </article>

          <section className="flex justify-center text-center">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col justify-center bg-slate-800 p-4 rounded"
            >
              <div className="flex flex-col">
                <label htmlFor="userId">User Id:</label>
                <input
                  type="number"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(Number(e.target.value))}
                  required
                  className="text-black p-1"
                />
              </div>
              <div className="mt-4">
                <button type="submit" className="bg-slate-600 p-2 rounded">
                  Generate Token
                </button>
              </div>
            </form>
          </section>
          <section className="text-center mt-10">
            {token && (
              <div>
                <p className="font-bold">Generated Token:</p>
                <textarea
                  value={token}
                  className="text-black w-full h-20 mt-4 p-2"
                ></textarea>
              </div>
            )}
            {error && (
              <div>
                <h2>Error:</h2>
                <p>{error}</p>
              </div>
            )}
          </section>
          <section>
            <p className="mt-4 mb-4">
              Now copy the curl command below into your code editor so that you
              can edit it.
            </p>
            <textarea
              value={curlCommand}
              className="text-black p-2 h-40 w-full"
            ></textarea>
            <p className="mt-4 mb-4">
              1. It's crucial to replace the example JWT token with your
              generated token. Next, go to your SQLite database and find the
              account number of a user to whom you want to send money. Make sure
              that you choose a different user from the one you generated a
              token for because obviously a user is not going to be sending
              money to themselves in this case. Its only between different
              users. The user for whom you generated a token should obviously
              have a balance in their account so that they have funds to send.
              Now replace the value for the <code>recipientAccount</code> number
              with the other user you chose.
            </p>
            <p className="mt-4 mb-4">
              2. Next, change the value of the amount to whatever you want. Just
              remember that it can't be higher than the balance the user has
              available in their account; otherwise, you will get the
              insufficient balance error when you run the curl command.
            </p>
            <p className="mt-4 mb-4">
              3. Finally, run the curl command in your command line. This action
              will successfully simulate a bank transfer between users' bank
              accounts, marking a successful completion of the process.
            </p>
          </section>
        </section>
      </main>
    </div>
  );
}
