// --- 1. SETUP ---
const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(bodyParser.json());

// --- 2. INITIALIZE FIREBASE ---
// This logic checks for the secret key from Render's environment variables.
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("Initializing Firebase from environment variable...");
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    // This part is for local testing and is ignored by Render.
    console.log("Initializing Firebase from local file...");
    const serviceAccount = require('./service-account-key.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// --- 3. DATA STORAGE ---
// In a real app, use a database. This uses memory for simplicity.
let devices = {};
console.log("Server started. No devices registered yet.");

// --- 4. API ENDPOINTS ---

// Endpoint for Android apps to register their FCM token
app.post('/register', (req, res) => {
    const { deviceId, token } = req.body;
    if (!deviceId || !token) {
        return res.status(400).send({ error: 'Device ID and token are required.' });
    }
    devices[deviceId] = token;
    console.log(`Device registered/updated: ${deviceId}`);
    console.log('Current devices:', devices);
    res.status(200).send({ message: 'Device registered successfully.' });
});

// Endpoint for the dashboard to get all registered devices
app.get('/devices', (req, res) => {
    res.status(200).json(Object.keys(devices)); // Sends an array of device IDs
});

// Endpoint for the dashboard to send a command to a device
app.post('/command', async (req, res) => {
    const { deviceId, command, payload } = req.body;

    const token = devices[deviceId];
    if (!token) {
        return res.status(404).send({ error: 'Device not found.' });
    }

    const message = {
        data: {
            command: command || 'default_command',
            ...(payload || {})
        },
        token: token
    };

    try {
        console.log(`Sending command '${command}' to device ${deviceId}`);
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        res.status(200).send({ message: 'Command sent successfully.', response });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send({ error: 'Failed to send command.' });
    }
});

// --- 5. START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('✅ Remote Agent Server is online and running!');
});
