const express = require('express');
const app = express();
const dotenv = require('dotenv');
const url = require('url');
const { default: axios } = require('axios');

// ENV Variables
dotenv.config();

// Simple inmemory, global scope
var loginDetails = null;

// For production HTTPS redirects only
/*
const requireHTTPS = (req, res, next) => {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
};
*/
//app.use(requireHTTPS);

app.use(express.json());

app.use(express.static('./dist'));

app.get('/', (req, res) => {
  if (loginDetails) {
    // Logged in OR attempted
    res.json(loginDetails);
  } else {
    // Not logged in
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  const authUrl = 'https://webexapis.com/v1/authorize';

  console.log('Redirecting to Webex Login Page..');

  res.redirect(
    url.format({
      pathname: authUrl,
      query: {
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        scope: 'cjp:config cjp:config_read cjp:config_write',
        state: '',
      },
    })
  );
});

app.get('/auth/webex/callback', async (req, res) => {
  const code = req.query.code ? req.query.code : null;
  //?code=_____
  if (!code) {
    console.error(`Error occured during the OAuth flow: ${error}`);
    res.code(500);
    res.send({ error: 'An error occured while fetching the code' });
  }

  console.log(`Fetched Code: ${code}`);

  // Get access Token - submit required payload
  const payload = {
    grant_type: 'authorization_code',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: code,
    redirect_uri: process.env.REDIRECT_URI,
  };
  // Parameterize
  const data = Object.keys(payload)
    .map((key, index) => `${key}=${encodeURIComponent(payload[key])}`)
    .join('&');

  console.log(`Params: ${data}`);

  const response = await axios.post(
    'https://webexapis.com/v1/access_token',
    data,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  console.log(`Got Response: ${response}`);

  loginDetails = response.data
    ? response.data
    : { error: 'Error while fetching access token' };

  // Redirect to Home
  res.redirect('/');
});

// Data - TASKS
app.get('/tasks', async (req, res) => {
  let from = new Date('2021-10-10').getTime();
  let to = new Date('2021-10-20').getTime();

  const options = {
    method: 'GET',
    url: 'https://api.wxcc-us1.cisco.com/v1/tasks',
    params: {
      channelTypes: 'telephony',
      from: from,
      to: to,
      pageSize: '100',
      orgId: process.env.ORG_ID,
    },
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${loginDetails.access_token}`,
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.json({ error: error });
  }
});

// CRUD - USERS
app.get('/users', async (req, res) => {
  const options = {
    method: 'GET',
    url: `https://api.wxcc-us1.cisco.com/organization/${process.env.ORG_ID}/user`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${loginDetails.access_token}`,
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.json({ error: error });
  }
});

// AGENT STATS - LAST 15 days
app.get('/agents', (req, res) => {
  let from = new Date('2021-10-01').getTime();
  let to = new Date('2021-10-20').getTime();
  let orgId = process.env.ORG_ID;

  options = {
    method: 'GET',
    url: 'https://api.wxcc-us1.cisco.com/v1/agents/statistics',
    params: {
      from: from,
      to: to,

      interval: '15',
      orgId: orgId,
    },

    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${loginDetails.access_token}`,
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.json({ error: error });
  }
});

// QUEUE STATS - Last 15 days
app.get('/queues', (req, res) => {
  let begin = new Date('2021-10-01').getTime();
  let end = new Date('2021-10-20').getTime();
  let orgId = process.env.ORG_ID;
});

// LIST Sites
app.get('/sites', (req, res) => {
  let orgId = process.env.ORG_ID;

  const options = {
    method: 'GET',
    url: `https://api.wxcc-us1.cisco.com/organization/${orgId}/site`,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${loginDetails.access_token}`,
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.json({ error: error });
  }
});

app.get('/*', function (req, res) {
  res.sendFile('index.html', { root: 'dist/' });
});

app.listen(process.env.PORT || 8080, process.env.HOST || '0.0.0.0', () => {
  console.log(
    `Server listening on PORT: http://${process.env.HOST || '0.0.0.0'}:${
      process.env.PORT || 8080
    }`
  );
});
