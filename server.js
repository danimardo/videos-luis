const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { pool, initDatabase } = require('./database');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Create a new video marker
app.post('/markers', async (req, res) => {
    let conn;
    try {
        const { id, title, url, seconds, note } = req.body;
        conn = await pool.getConnection();
        const result = await conn.query(
            'INSERT INTO video_markers (id, title, url, seconds, note) VALUES (?, ?, ?, ?, ?)',
            [id, title || null, url, seconds, note || null]
        );
        res.status(201).json({ message: 'Marker created successfully', id });
    } catch (error) {
        console.error('Error creating marker:', error);
        res.status(500).json({ message: 'Error creating marker', error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Get all video markers
app.get('/markers', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const markers = await conn.query('SELECT * FROM video_markers ORDER BY created DESC');
        res.json(markers);
    } catch (error) {
        console.error('Error fetching markers:', error);
        res.status(500).json({ message: 'Error fetching markers', error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Update a video marker
app.put('/markers/:id', async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        const { title, url, seconds, note } = req.body;
        conn = await pool.getConnection();
        const result = await conn.query(
            'UPDATE video_markers SET title = ?, url = ?, seconds = ?, note = ? WHERE id = ?',
            [title || null, url, seconds, note || null, id]
        );
        res.json({ message: 'Marker updated successfully', id });
    } catch (error) {
        console.error('Error updating marker:', error);
        res.status(500).json({ message: 'Error updating marker', error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Delete a video marker
app.delete('/markers/:id', async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        conn = await pool.getConnection();
        const result = await conn.query('DELETE FROM video_markers WHERE id = ?', [id]);
        res.json({ message: 'Marker deleted successfully', id });
    } catch (error) {
        console.error('Error deleting marker:', error);
        res.status(500).json({ message: 'Error deleting marker', error: error.message });
    } finally {
        if (conn) conn.release();
    }
});

// Start server
const PORT = process.env.SERVER_PORT || 3011;
app.listen(PORT, async () => {
    await initDatabase();
    console.log(`🚀 Video Markers Server running on port ${PORT}`);
    console.log(`📍 Access the app at: http://localhost:${PORT}`);
});
