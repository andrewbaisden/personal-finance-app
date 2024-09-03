# Personal Finance App

![Personal Finance App](/img/personal-finance-app-homepage.png 'Personal Finance App')

## Install and setup

1. Create an account on [Arcjet](https://arcjet.com/)
2. Create a `.env.local` file and put it in the root folder

We need an `ARCJET_KEY`, which you will find in the SDK CONFIGURATION section on your account.

We can generate a JWT secret key using the built-in Node.js `crypto` module by running this code in the command line:

```shell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add both keys to the `.env.local` file:

```shell
ARCJET_KEY=your_arcjet_key
JWT_SECRET=your_jwt_secret
```

3. Install the depenencies using the command `npm install`
4. Run the application with the command `npm run dev`

## Managing the SQLite database

All users are saved inside of the SQLite database inside of the directory `prisma/dev.db`.

If you want to view the data inside your SQLite database, you can use a VS Code extension like [SQLite Viewer](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer), although you won't be able to run any SQL queries. Alternatively, you can use the command line by referring to the [SQLite Documentation](https://www.sqlite.org/docs.html) or a database management tool like [TablePlus](https://tableplus.com/).
