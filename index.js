// --- 1. SETUP ---
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(bodyParser.json());

// --- UPDATED LOGIC FOR INITIALIZING FIREBASE ---
// Check if the service account key is in an environment variable (for Render)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("Initializing Firebase from environment variable...");
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    // Otherwise, load from the local file (for local development)
    console.log("Initializing Firebase from local file...");
    const serviceAccount = require('./service-account-key.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// --- THE REST OF YOUR CODE (DATA STORAGE, API ENDPOINTS, etc.) REMAINS THE SAME ---
