# CS-312 Mini Project 3

Author: Dhruti Patel

A blog application built with Node.js, Express.js, EJS, and PostgreSQL. Users can create accounts, sign in, view posts, and manage their own posts.

## Features

- Account signup with duplicate user ID checking
- Sign-in and sign-out using sessions
- PostgreSQL storage for users and blog posts
- Create, view, edit, and delete posts
- Only the creator can edit or delete their posts
- Post titles, content, authors, categories, and creation dates
- Responsive layout for desktop and mobile screens
- Three demo accounts and five initial blog posts

## Requirements

- Node.js and npm
- PostgreSQL
- pgAdmin

## Setup

1. Download or clone this repository.
2. Open a terminal in the project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

   On Windows PowerShell, use `npm.cmd install` if npm scripts are blocked.

4. In pgAdmin, create a new empty database named `BlogDB`.
5. Open the Query Tool for that database.
6. Open `database.sql` and run the entire file once. It creates the tables and inserts the sample users and posts.
7. Copy `.env.example` to a new file named `.env`.
8. In `.env`, set `PGPASSWORD` to your local PostgreSQL password.
9. Set `SESSION_SECRET` to a long random value. Generate one with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

10. Check the database connection:

    ```bash
    node db.js
    ```

11. Start the application:

    ```bash
    npm start
    ```

    On Windows PowerShell, use `npm.cmd start` if needed.

12. Open http://localhost:3000 in your browser.

Keep your actual `.env` file private. It is excluded from Git by `.gitignore`.

## Demo Accounts

These accounts are created by `database.sql`.

| User ID | Password       | Name         |
| ------- | -------------- | ------------ |
| dhruti  | DemoDhruti123! | Dhruti Patel |
| alex    | DemoAlex123!   | Alex Morgan  |
| maya    | DemoMaya123!   | Maya Shah    |

These are demonstration credentials only.

## Project Files

- `app.js`: Express routes, authentication, sessions, and blog operations
- `db.js`: PostgreSQL connection pool and connection check
- `database.sql`: Table definitions and initial sample data
- `views/index.ejs`: Blog feed and new-post form
- `views/edit.ejs`: Edit-post form
- `views/signup.ejs`: Signup form
- `views/signin.ejs`: Sign-in form
- `public/style.css`: Styling and responsive layout
- `.env.example`: Example environment settings
- `.gitignore`: Excludes local credentials and installed dependencies
- `package.json`: Dependencies and start command

## Database Operations

Signup uses SELECT to check for an existing user ID and INSERT to save a new account.

Sign-in uses SELECT with WHERE to check the submitted credentials.

The blog feed uses SELECT. Creating a post uses INSERT, editing uses UPDATE, and deletion uses DELETE.

Edit and delete queries include the signed-in user's ID in the WHERE condition to enforce ownership. Queries use parameters such as $1 and $2.

## Testing Performed

- Signed in with an existing demo account
- Rejected an incorrect password
- Rejected a duplicate user ID
- Confirmed that signup inserted a new user
- Created, edited, and deleted a test post
- Confirmed the edited post remained after restarting the server
- Confirmed another user's edit URL was blocked
- Checked the mobile layout using Chrome's device preview
- Checked page rendering and sign-in in Microsoft Edge

## Current Limitations

Passwords are currently stored as plain text for the basic assignment. The optional password-hashing and account-update features are not implemented.

Sessions are stored in memory, so restarting the server signs users out. Blog posts and user accounts remain in PostgreSQL.
