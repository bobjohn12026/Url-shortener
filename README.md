# URL Shortener

A simple URL shortener service that converts long URLs into short, easy-to-share links.

## Features

- Shorten long URLs into compact short codes
- Redirect short URLs to original URLs
- Store URL mappings in a database
- RESTful API endpoints
- Clean and intuitive interface

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (or MongoDB)
- **Frontend**: HTML/CSS/JavaScript

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bobjohn12026/url-shortener.git
   cd url-shortener
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### POST /api/shorten
- Creates a short URL
- **Request**: `{ "url": "https://example.com/very/long/url" }`
- **Response**: `{ "shortCode": "abc123", "shortUrl": "http://localhost:3000/abc123" }`

### GET /:shortCode
- Redirects to the original URL
- **Example**: `GET /abc123` → Redirects to original URL

### GET /api/stats/:shortCode
- Gets statistics for a shortened URL
- **Response**: `{ "shortCode": "abc123", "originalUrl": "...", "clicks": 42, "createdAt": "..." }`

## Usage

1. Enter a long URL in the web interface
2. Click "Shorten"
3. Copy the generated short URL
4. Share it with others

## License

MIT
