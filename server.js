const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env file

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

const Hostel = mongoose.model('Hostel', hostelSchema);

const app = express();
app.use(cors());
app.use(express.json());

const path = require('path');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to get all hostels
// app.get('/hostels', async (req, res) => {
//     try {
//         const hostels = await Hostel.find({});
//         res.json(hostels);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

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
