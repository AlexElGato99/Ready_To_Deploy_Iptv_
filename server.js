const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load channel configuration
function loadChannels() {
  try {
    const configPath = path.join(__dirname, 'config', 'channels.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading channels:', error);
  }
  return [];
}

// Generate M3U playlist
function generateM3U(channels) {
  let m3u = '#EXTM3U\n';
  channels.forEach(channel => {
    m3u += `#EXTINF:-1 tvg-id="${channel.id}" tvg-name="${channel.name}" tvg-logo="${channel.logo}" group-title="${channel.group}",${channel.name}\n`;
    m3u += `${channel.url}\n`;
  });
  return m3u;
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'IPTV Server Ready',
    version: '1.0.0',
    endpoints: {
      playlist: '/playlist.m3u',
      channels: '/api/channels',
      epg: '/api/epg',
      health: '/health'
    }
  });
});

app.get('/playlist.m3u', (req, res) => {
  const channels = loadChannels();
  const m3u = generateM3U(channels);
  res.setHeader('Content-Type', 'application/x-mpegurl');
  res.setHeader('Content-Disposition', 'attachment; filename="playlist.m3u"');
  res.send(m3u);
});

app.get('/api/channels', (req, res) => {
  const channels = loadChannels();
  res.json(channels);
});

app.get('/api/epg', (req, res) => {
  try {
    const epgPath = path.join(__dirname, 'config', 'epg.json');
    if (fs.existsSync(epgPath)) {
      const epg = JSON.parse(fs.readFileSync(epgPath, 'utf8'));
      res.json(epg);
    } else {
      res.json({ programs: [] });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to load EPG' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`IPTV Server running on port ${PORT}`);
  console.log(`Playlist available at: http://localhost:${PORT}/playlist.m3u`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
