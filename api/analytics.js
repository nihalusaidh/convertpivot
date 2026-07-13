const crypto = require('crypto');

function dateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function generateMockDaily(period) {
  const rows = [];
  for (let i = period - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    rows.push({
      date: dateStr,
      pageviews: 200 + Math.floor(Math.random() * 800) + (period - i) * 10,
      users: 30 + Math.floor(Math.random() * 100),
      sessions: 80 + Math.floor(Math.random() * 200),
    });
  }
  return rows;
}

function getMockData(period) {
  const daily = generateMockDaily(period);
  const totals = daily.reduce(
    (acc, d) => ({
      pageviews: acc.pageviews + d.pageviews,
      activeUsers: Math.max(acc.activeUsers, d.users),
      sessions: acc.sessions + d.sessions,
      bounceRate: 38.7,
      avgSessionDuration: 245,
      newUsers: 5678,
    }),
    { pageviews: 0, activeUsers: 0, sessions: 0, bounceRate: 38.7, avgSessionDuration: 245, newUsers: 5678 }
  );
  totals.bounceRate = 38.7;
  totals.avgSessionDuration = 245;
  totals.newUsers = Math.floor(totals.sessions * 0.46);

  return {
    configured: false,
    usingFallback: true,
    period,
    totals,
    daily,
    topPages: [
      { path: '/', pageviews: 8234 },
      { path: '/epub-to-pdf', pageviews: 4512 },
      { path: '/mobi-to-pdf', pageviews: 3120 },
      { path: '/fb2-to-pdf', pageviews: 2780 },
      { path: '/azw3-to-pdf', pageviews: 1980 },
      { path: '/lrf-to-pdf', pageviews: 1450 },
      { path: '/convert-to-docx', pageviews: 1210 },
      { path: '/compress-pdf', pageviews: 980 },
      { path: '/merge-pdf', pageviews: 870 },
      { path: '/pdf-to-epub', pageviews: 720 },
    ],
    sources: [
      { source: 'google', sessions: 4234 },
      { source: 'direct', sessions: 3456 },
      { source: 'bing', sessions: 1234 },
      { source: 'github', sessions: 890 },
      { source: 'twitter', sessions: 567 },
    ],
    countries: [
      { country: 'United States', sessions: 3456 },
      { country: 'India', sessions: 2341 },
      { country: 'United Kingdom', sessions: 1234 },
      { country: 'Germany', sessions: 987 },
      { country: 'Canada', sessions: 765 },
    ],
  };
}

async function getAccessToken() {
  const key = JSON.parse(process.env.GA_SERVICE_ACCOUNT);

  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const claimB64 = Buffer.from(JSON.stringify(claim)).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(headerB64 + '.' + claimB64);
  const signature = sign.sign(key.private_key, 'base64url');

  const jwt = headerB64 + '.' + claimB64 + '.' + signature;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await resp.json();
  if (!data.access_token) {
    throw new Error('Failed to get access token: ' + JSON.stringify(data));
  }
  return data.access_token;
}

async function runReport(token, propertyId, body) {
  const resp = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  return resp.json();
}

function extractMetric(row, name) {
  const m = row.metricValues.find((v) => v.name === name);
  return m ? parseFloat(m.value) : 0;
}

function gaValue(v) {
  const n = parseFloat(v);
  return Number.isNaN(n) ? v : n;
}

function buildResponse(period, reportTotals, reportDaily, reportPages, reportSources, reportCountries) {
  const totalsRow = (reportTotals.rows && reportTotals.rows[0]) || {};
  const metricValues = totalsRow.metricValues || [];
  const mapMetric = (idx) => (metricValues[idx] ? parseFloat(metricValues[idx].value) : 0);

  const totals = {
    pageviews: mapMetric(2),
    activeUsers: mapMetric(1),
    sessions: mapMetric(3),
    bounceRate: mapMetric(4),
    avgSessionDuration: mapMetric(5),
    newUsers: mapMetric(6),
  };

  const dailyRows = (reportDaily.rows || []).map((r) => ({
    date: r.dimensionValues[0].value,
    pageviews: extractMetric(r, 'screenPageViews'),
    users: extractMetric(r, 'activeUsers'),
    sessions: extractMetric(r, 'sessions'),
  }));

  const topPages = (reportPages.rows || []).map((r) => ({
    path: r.dimensionValues[0].value,
    pageviews: extractMetric(r, 'screenPageViews'),
  }));

  const sources = (reportSources.rows || []).map((r) => ({
    source: r.dimensionValues[0].value,
    sessions: extractMetric(r, 'sessions'),
  }));

  const countries = (reportCountries.rows || []).map((r) => ({
    country: r.dimensionValues[0].value,
    sessions: extractMetric(r, 'sessions'),
  }));

  return {
    configured: true,
    period,
    totals,
    daily: dailyRows,
    topPages,
    sources,
    countries,
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const period = parseInt(req.query.period, 10) || 30;
    const clampedPeriod = Math.max(1, Math.min(365, period));

    if (!process.env.GA_SERVICE_ACCOUNT || !process.env.GA_PROPERTY_ID) {
      return res.status(200).json(getMockData(clampedPeriod));
    }

    const token = await getAccessToken();
    const propertyId = process.env.GA_PROPERTY_ID;
    const endDate = dateNDaysAgo(0);
    const startDate = dateNDaysAgo(clampedPeriod);

    const commonDateRange = { dateRanges: [{ startDate, endDate }] };

    const [reportTotals, reportDaily, reportPages, reportSources, reportCountries] = await Promise.all([
      runReport(token, propertyId, {
        ...commonDateRange,
        metrics: [
          { name: 'totalUsers' },
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'newUsers' },
        ],
      }),
      runReport(token, propertyId, {
        ...commonDateRange,
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
          { name: 'sessions' },
        ],
      }),
      runReport(token, propertyId, {
        ...commonDateRange,
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBy: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
      runReport(token, propertyId, {
        ...commonDateRange,
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
        orderBy: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      runReport(token, propertyId, {
        ...commonDateRange,
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }],
        orderBy: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
    ]);

    const result = buildResponse(clampedPeriod, reportTotals, reportDaily, reportPages, reportSources, reportCountries);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Analytics API error:', err);
    return res.status(200).json({
      error: true,
      message: err.message,
      ...getMockData(30),
    });
  }
};
