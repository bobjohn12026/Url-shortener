const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Helper function to generate short code
function generateShortCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let shortCode = '';
  for (let i = 0; i < length; i++) {
    shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return shortCode;
}

// Helper function to validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Initialize database
db.init();

// Routes

// POST /api/shorten - Create a short URL
app.post('/api/shorten', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    // Check if URL already exists
    const existing = await db.getByUrl(url);
    if (existing) {
      return res.json({
        shortCode: existing.short_code,
        shortUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/${existing.short_code}`,
        originalUrl: existing.original_url
      });
    }

    // Generate unique short code
    let shortCode = generateShortCode();
    while (await db.getByShortCode(shortCode)) {
      shortCode = generateShortCode();
    }

    // Save to database
    await db.create(shortCode, url);

    res.status(201).json({
      shortCode,
      shortUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/${shortCode}`,
      originalUrl: url
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Failed to shorten URL' });
  }
});

// GET /:shortCode - Redirect to original URL
app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  try {
    const urlRecord = await db.getByShortCode(shortCode);

    if (!urlRecord) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    // Increment click count
    await db.incrementClicks(shortCode);

    // Redirect to original URL
    res.redirect(301, urlRecord.original_url);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Failed to process redirect' });
  }
});

// GET /api/stats/:shortCode - Get statistics
app.get('/api/stats/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  try {
    const urlRecord = await db.getByShortCode(shortCode);

    if (!urlRecord) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({
      shortCode,
      originalUrl: urlRecord.original_url,
      clicks: urlRecord.clicks,
      createdAt: urlRecord.created_at,
      updatedAt: urlRecord.updated_at
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/urls - Get all shortened URLs (for admin)
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await db.getAll();
    res.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});

module.exports = app;
