import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Transaction from './models/Transaction.js';
import Client from './models/Client.js';
import City from './models/City.js';
import Item from './models/Item.js';
import User from './models/User.js';
const GITHUB_TOKEN = process.env.BACKUP_GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER; // Riddhi162
const GITHUB_REPO  = process.env.GITHUB_REPO;  // grainledger-backup

async function pushToGitHub(filename, data) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const apiUrl  = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/backups/${filename}`;

  // Check if file already exists (need its SHA to overwrite)
  let sha = null;
  try {
    const check = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (check.ok) {
      const existing = await check.json();
      sha = existing.sha;
    }
  } catch (_) {
    // File doesn't exist yet — that's fine
  }

  const today = new Date().toISOString().split('T')[0]; // e.g. 2026-05-16

  const body = {
    message: `backup: ${filename} — ${today}`,
    content,
    ...(sha ? { sha } : {}), // include sha only if overwriting
  };

  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub push failed for ${filename}: ${JSON.stringify(err)}`);
  }

  console.log(`✓ ${filename} pushed to GitHub`);
}

// ─── Main backup function ──────────────────────────────────────────────────────
async function runBackup() {
  console.log('🔄 Starting backup...');

  // Connect to MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ MongoDB connected');

  // Fetch all collections
  const [transactions, clients, cities, items, users] = await Promise.all([
    Transaction.find({}).lean(),
    Client.find({}).lean(),
    City.find({}).lean(),
    Item.find({}).lean(),
    User.find({}).lean(),
  ]);

  console.log(`📦 Fetched: ${transactions.length} transactions, ${clients.length} clients, ${cities.length} cities, ${items.length} items, ${users.length} users`);

  // Push each collection to GitHub
  await pushToGitHub('transactions.json', transactions);
  await pushToGitHub('clients.json', clients);
  await pushToGitHub('cities.json', cities);
  await pushToGitHub('items.json', items);
  await pushToGitHub('users.json', users);

  console.log('✅ Backup complete!');
  await mongoose.disconnect();
  process.exit(0);
}

runBackup().catch((err) => {
  console.error('✗ Backup failed:', err.message);
  process.exit(1);
});