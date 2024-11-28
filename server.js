const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');

app.use(cors());
app.use(express.json());

// Load client secret JSON file
const clientSecret = JSON.parse(fs.readFileSync('client_secret.json'));

// Initialize OAuth2Client using the client ID from the JSON file
const CLIENT_ID = clientSecret.web.client_id;
const client = new OAuth2Client(CLIENT_ID);

// MongoDB URI
const mongoUri = 'mongodb://localhost:27017/hostels';

mongoose.connect(mongoUri);

const hostelSchema = new mongoose.Schema({
    name: String,
    location: String,
    price: Number,
    amenities: [String],
    rating: Number
});

const Hostel = mongoose.model('Hostel', hostelSchema);

const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    imageUrl: String,
});

const User = mongoose.model('User', userSchema);

// Callback route to handle Google Sign-In response
app.get('/callback', async (req, res) => {
    const { code } = req.query; // Capture authorization code from query parameters
    console.log('Authorization Code:', code);

    if (code) {
        try {
            const { tokens } = await client.getToken(code); // Exchange authorization code for tokens
            const ticket = await client.verifyIdToken({
                idToken: tokens.id_token,
                audience: CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const userid = payload['sub'];

            // Check if user exists in your database
            let user = await User.findOne({ googleId: userid });
            if (!user) {
                user = new User({
                    googleId: userid,
                    name: payload['name'],
                    email: payload['email'],
                    imageUrl: payload['picture'],
                });
                await user.save();
            }

            // Create a session or token for the user (e.g., JWT)
            res.status(200).send({ success: true, userid: user._id });
        } catch (error) {
            console.error('Error during token exchange or verification:', error);
            res.status(400).send({ success: false, message: 'Invalid token' });
        }
    } else {
        res.status(400).send({ success: false, message: 'Authorization code not found' });
    }
});

// Existing routes and server setup
app.get('/hostels', async (req, res) => {
    try {
        const hostels = await Hostel.find({});
        res.json(hostels);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/hostels', async (req, res) => {
    try {
        const newHostel = new Hostel(req.body);
        await newHostel.save();
        res.send(newHostel);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post('/bulk-hostels', async (req, res) => {
    try {
        const hostels = req.body;
        await Hostel.insertMany(hostels);
        res.send({ message: 'Hostels added successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/hostels', async (req, res) => {
    try {
        await Hostel.deleteMany({});
        res.send({ message: 'All hostels deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
