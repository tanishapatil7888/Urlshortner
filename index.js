require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use('/public', express.static(`${process.cwd()}/public`));

// Routes
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

let urlDatabase = [];
let counter = 1;

app.post('/api/shorturl', (req, res) => {
  const inputUrl = req.body.url; 


  const urlPattern = /^(http:\/\/|https:\/\/)(www\.)?.+/;
  if (!urlPattern.test(inputUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const urlObj = new URL(inputUrl);

    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const existing = urlDatabase.find(
        (entry) => entry.original_url === inputUrl
      );
      if (existing) return res.json(existing);

      const newEntry = {
        original_url: inputUrl,
        short_url: counter++,
      };
      urlDatabase.push(newEntry);

      res.json(newEntry);
    });
  } catch (e) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const short = parseInt(req.params.short_url);
  const found = urlDatabase.find((entry) => entry.short_url === short);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'invalid url' });
  }
});

// Start server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
