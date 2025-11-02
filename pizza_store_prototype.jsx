# PizzaStore - Single-file React prototype (multi-file project shown here)

This document contains a ready-to-run React + Firebase starter project for a pizza ordering web app (mobile-friendly). Copy the files into a new project folder, follow the README steps, and you'll have a working MVP.

---

// FILE: package.json
{
  "name": "pizzastore",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.2",
    "firebase": "^10.11.0",
    "axios": "^1.4.0",
    "tailwindcss": "^3.5.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}

---

// FILE: public/index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Chinna's Pizza</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>

---

// FILE: tailwind.config.cjs
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: { extend: {} },
  plugins: [],
};

---

// FILE: postcss.config.cjs
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

---

// FILE: src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

---

// FILE: src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// REPLACE the values below with your Firebase project's config
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

---

// FILE: src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

---

// FILE: src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";

function App(){
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <header className="p-4 border-b flex justify-between items-center bg-white">
          <Link to="/" className="text-2xl font-bold">Chinna's Pizza</Link>
          <nav>
            <Link to="/cart" className="mr-4">Cart</Link>
            <Link to="/admin">Admin</Link>
          </nav>
        </header>
        <main className="p-4 flex-1">
          <Routes>
            <Route path="/" element={<MenuPage/>}/>
            <Route path="/cart" element={<CartPage/>}/>
            <Route path="/checkout" element={<CheckoutPage/>}/>
            <Route path="/admin" element={<AdminPage/>}/>
          </Routes>
        </main>
        <footer className="p-4 text-center text-sm text-gray-600">© {new Date().getFullYear()} Chinna's Pizza</footer>
      </div>
    </BrowserRouter>
  );
}

export default App;

---

// FILE: src/pages/MenuPage.js
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function MenuPage(){
  const [pizzas, setPizzas] = useState([]);
  useEffect(()=>{
    async function load(){
      try{
        const snap = await getDocs(collection(db,"pizzas"));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPizzas(data);
      }catch(e){
        console.error(e);
        setPizzas([]);
      }
    }
    load();
  },[]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Menu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pizzas.length===0 && (<div className="text-sm text-gray-600">No items found. Add sample pizzas to Firestore collection <code>pizzas</code>.</div>)}
        {pizzas.map(p => (
          <div key={p.id} className="border p-4 rounded bg-white shadow-sm">
            <div className="h-44 w-full bg-gray-100 mb-3 flex items-center justify-center overflow-hidden">
              {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/> : <div className="text-gray-500">No image</div>}
            </div>
            <h2 className="text-lg font-medium">{p.name}</h2>
            <p className="text-sm text-gray-700">{p.description}</p>
            <div className="mt-2">
              <strong>From ₹{p.basePrice}</strong>
            </div>
            <button
              onClick={()=> {
                const cart = JSON.parse(localStorage.getItem("cart")||"[]");
                cart.push({ pizzaId: p.id, name: p.name, qty:1, price: p.basePrice });
                localStorage.setItem("cart", JSON.stringify(cart));
                alert("Added to cart");
              }}
              className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
export default MenuPage;

---

// FILE: src/pages/CartPage.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function CartPage(){
  const [cart, setCart] = useState([]);
  useEffect(()=> setCart(JSON.parse(localStorage.getItem("cart")||"[]")),[]);
  function remove(index){
    const c = [...cart]; c.splice(index,1); setCart(c); localStorage.setItem("cart", JSON.stringify(c));
  }
  const total = cart.reduce((s,i)=> s + i.price * i.qty, 0);
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Your Cart</h1>
      {cart.length===0 ? <p>No items. <Link to="/">Go to menu</Link></p> : (
        <>
          <ul>
            {cart.map((it,idx)=>(
              <li key={idx} className="flex justify-between p-2 border-b">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div>Qty: {it.qty} • ₹{it.price}</div>
                </div>
                <div>
                  <button onClick={()=> remove(idx)} className="text-red-600">Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <div className="font-semibold">Total: ₹{total}</div>
            <Link to="/checkout" className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded">Checkout</Link>
          </div>
        </>
      )}
    </div>
  );
}
export default CartPage;

---

// FILE: src/pages/CheckoutPage.js
import React from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function CheckoutPage(){
  const cart = JSON.parse(localStorage.getItem("cart")||"[]");
  const total = cart.reduce((s,i)=> s + i.price * i.qty, 0);

  async function createOrder(){
    if(cart.length===0){ alert("Cart is empty"); return; }
    const orderDoc = {
      items: cart,
      total,
      paymentStatus: "pending",
      orderStatus: "new",
      createdAt: serverTimestamp()
    };
    try{
      const docRef = await addDoc(collection(db,"orders"), orderDoc);
      alert("Order created (id: " + docRef.id + "). Next step: integrate Razorpay flow.");
      localStorage.removeItem("cart");
      window.location.href = "/";
    }catch(e){
      console.error(e);
      alert("Failed to create order: " + e.message);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Checkout</h1>
      <div>Total: ₹{total}</div>
      <button onClick={createOrder} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Place Order (Pay later)</button>
      <p className="mt-3 text-sm text-gray-600">This demo saves an order in Firestore. Payment integration (Razorpay) is the next step.</p>
    </div>
  );
}

export default CheckoutPage;

---

// FILE: src/pages/AdminPage.js
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function AdminPage(){
  const [orders, setOrders] = useState([]);
  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"orders"), snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return ()=> unsub();
  },[]);
  async function updateStatus(id, status){
    await updateDoc(doc(db,"orders",id), { orderStatus: status });
  }
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Admin — Orders</h1>
      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.id} className="border p-3 rounded bg-white shadow-sm">
            <div className="font-medium">Order #{o.id}</div>
            <div>Total: ₹{o.total}</div>
            <div>Status: {o.orderStatus} • Payment: {o.paymentStatus}</div>
            <div className="mt-2">
              <button onClick={() => updateStatus(o.id,"preparing")} className="mr-2">Preparing</button>
              <button onClick={() => updateStatus(o.id,"out_for_delivery")} className="mr-2">Out for delivery</button>
              <button onClick={() => updateStatus(o.id,"delivered")} className="mr-2">Delivered</button>
            </div>
            <div className="mt-2 text-sm text-gray-600">Items:</div>
            <ul className="text-sm">
              {o.items?.map((it,idx)=> <li key={idx}>{it.name} × {it.qty} — ₹{it.price}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPage;

---

// FILE: README.md
# Chinna's Pizza - Prototype

This is a minimal React + Firebase prototype for a pizza ordering web app.

## What this includes
- Menu page (reads `pizzas` collection)
- Cart stored in `localStorage`
- Checkout that creates orders in Firestore
- Admin page listing orders (real-time)

## How to run (quick)
1. `npx create-react-app pizzastore` (or use existing CRA project)
2. Replace `package.json` dependencies or just `npm install firebase react-router-dom axios tailwindcss`.
3. Add the files from this document into your project (replace `src` and `public` files as shown).
4. Configure Tailwind (if using) and run `npm start`.
5. Create a Firebase project, enable Firestore and Auth (optional), then paste config into `src/firebase.js`.
6. In Firestore, create a `pizzas` collection and add sample documents. Example document fields: `name`, `description`, `basePrice`, `images` (array)

## Next steps (recommended)
- Add Razorpay integration (serverless function to create order + client side checkout)
- Add authentication (Firebase Auth) for admin protection
- Add images upload (Firebase Storage)
- Improve UI (product options: sizes, toppings)

---

// END OF DOCUMENT
