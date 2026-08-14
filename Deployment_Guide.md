# Complete Deployment Guide

This guide walks you through deploying the **NextGen HRMS** stack to production for free. We will use:
- **MongoDB Atlas:** For hosting the Database.
- **Render:** For hosting the Express (Node.js) Backend API.
- **Vercel:** For hosting the React (Vite) Frontend.

---

## Phase 1: MongoDB Atlas (Database)

If you haven't already set up MongoDB Atlas:
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up/log in.
2. Create a new **Free Tier (M0)** Cluster.
3. In the sidebar under "Security", go to **Database Access** and create a new database user (save the username and password).
4. Go to **Network Access** and add the IP address `0.0.0.0/0` (this allows connections from anywhere, which is required since Render's IP addresses change).
5. Go to **Database** (under Deployment), click **Connect**, choose **Connect your application**, and copy the connection string.
   - It will look like: `mongodb+srv://<username>:<password>@cluster0...`
   - Replace `<username>` and `<password>` with your database user credentials.

---

## Phase 2: Render (Backend)

Render is great for hosting Node.js applications.

1. Ensure your code is pushed to a GitHub repository (which you have already done!).
2. Go to [render.com](https://render.com/) and sign up with GitHub.
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository (`Dhruvgahlot14/Onboarding-verification-website`).
5. Configure the Web Service:
   - **Name:** `nextgen-backend` (or whatever you prefer)
   - **Root Directory:** `server` *(Important: Since your backend is in the `server` folder)*
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` *(Note: if your `package.json` in the `server` folder doesn't have a start script, edit `server/package.json` to add `"start": "node src/index.js"` under the scripts section before deploying).*
6. **Environment Variables:**
   Scroll down to Advanced and add your Environment Variables (from your `.env` file):
   - `PORT`: `5001` (Render will override this, but it's good practice)
   - `MONGODB_URI`: *<Paste your MongoDB Atlas Connection String here>*
   - `JWT_SECRET`: *<Enter a secure random string>*
   - `CLIENT_URL`: *<Paste your live Vercel URL here>* (e.g., `https://nextgen-hrms-three.vercel.app`. **This is critical to prevent CORS errors!**)
7. Click **Create Web Service**.
8. Render will now build and deploy your backend. Once it says "Live", copy the generated URL (e.g., `https://nextgen-backend.onrender.com`).

---

## Phase 3: Vercel (Frontend)

Vercel is the industry standard for hosting React/Vite frontends.

1. First, make sure your frontend looks for an environment variable for its API URL. Open `client/src/services/api.js` and ensure it has:
   `baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api'`
2. Go to [vercel.com](https://vercel.com/) and sign up with GitHub.
3. Click **Add New...** -> **Project**.
4. Import your GitHub repository (`Dhruvgahlot14/Onboarding-verification-website`).
5. Configure the Project:
   - **Project Name:** `nextgen-hrms`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit this and select the `client` folder.
6. **Environment Variables:**
   Open the Environment Variables section and add:
   - `VITE_API_URL`: *<Paste your Render Backend URL here>* + `/api` 
     *(e.g., `https://nextgen-backend.onrender.com/api`)*
7. Click **Deploy**.
8. Vercel will build your React app. Once finished, it will give you a live URL (e.g., `https://nextgen-hrms.vercel.app`).

---

## Phase 4: Final Checks

1. Open your live Vercel URL in your browser.
2. Try to log in or create an account. Open the Chrome Developer Tools (Network Tab) if you have issues, to ensure the API requests are successfully going to your Render URL (`https://nextgen-backend.onrender.com/api/...`) and returning `200 OK`.
3. If everything works, your application is successfully live!

> **Warning:** Render's free tier automatically "spins down" your backend after 15 minutes of inactivity. When you visit the site the next day, the first API request might take 30-50 seconds to respond while the server wakes up. This is perfectly normal for the free tier!
