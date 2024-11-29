const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config(); // Load environment variables from .env file

// Load client secret JSON directly (optional, if you want to keep using this)
const clientSecret = JSON.parse(fs.readFileSync('client_secret.json'));

// Extract client ID from the JSON or use environment variable
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || clientSecret.web.client_id;



// Initialize Google OAuth2 Client
const client = new OAuth2Client(CLIENT_ID);

// MongoDB connection URI
const mongoUri = 'mongodb://localhost:27017/hostels';

// Connect to MongoDB
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define Mongoose schemas
const hostelSchema = new mongoose.Schema({
    name: String,
    location: String,
    price: Number,
    amenities: [String],
    rating: Number,
});

const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    imageUrl: String,
});

const Hostel = mongoose.model('Hostel', hostelSchema);
const User = mongoose.model('User ', userSchema);

const app = express();
app.use(cors());
app.use(express.json());

// Google Sign-In API
app.post('/api/google-signin', async (req, res) => {
    const { token } = req.body;

    try {
        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;

        // Check if the user exists in the database
        let user = await User.findOne({ googleId });
        if (!user) {
            // If not, create a new user
            user = new User({
                googleId,
                name: payload.name,
                email: payload.email,
                imageUrl: payload.picture,
            });
            await user.save();
        }

        res.status(200).json({ success: true, userId: user._id });
    } catch (error) {
        console.error('Error verifying Google token:', error);
        res.status(400).json({ success: false, message: 'Invalid token' });
    }
});

const path = require('path');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/callback', (req, res) => {
    // Handle the response from Google
    // You might want to check for the authorization code or token here
    res.send('Callback received!');
});
// API to get all hostels
app.get('/hostels', async (req, res) => {
    try {
        const hostels = await Hostel.find({});
        res.json(hostels);
    } catch (error) {
        res.status(500).send(error);
    }
});

// API to add a single hostel
app.post('/hostels', async (req, res) => {
    try {
        const newHostel = new Hostel(req.body);
        await newHostel.save();
        res.send(newHostel);
    } catch (error) {
        res.status(400).send(error);
    }
});

// API to add multiple hostels
app.post('/bulk-hostels', async (req, res) => {
    try {
        const hostels = req.body;
        await Hostel.insertMany(hostels);
        res.send({ message: 'Hostels added successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

// API to delete all hostels
app.delete('/hostels', async (req, res) => {
    try {
        await Hostel.deleteMany({});
        res.send({ message: 'All hostels deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

// API to search hostels by price range
app.get('/hostels/search', async (req, res) => {
    try {
        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
        const hostels = await Hostel.find({ price: { $gte: minPrice, $lte: maxPrice } });
        res.json(hostels);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});