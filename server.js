const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hostels');

// Define Hostel Schema
const hostelSchema = new mongoose.Schema({
    name: String,
    location: String,
    price: Number,
    amenities: [String],
    rating: Number
});

const Hostel = mongoose.model('Hostel', hostelSchema);

// Get All Hostels
app.get('/hostels', async (req, res) => {
    const hostels = await Hostel.find({});
    res.json(hostels);
});

// Add a New Hostel
app.post('/hostels', async (req, res) => {
    const newHostel = new Hostel(req.body);
    await newHostel.save();
    res.send(newHostel);
});

// Bulk Insert Hostels
app.post('/bulk-hostels', async (req, res) => {
    const hostels = req.body;
    await Hostel.insertMany(hostels);
    res.send({ message: 'Hostels added successfully' });
});

// Delete All Hostels
app.delete('/hostels', async (req, res) => {
    await Hostel.deleteMany({});
    res.send({ message: 'All hostels deleted successfully' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:3000`);
});