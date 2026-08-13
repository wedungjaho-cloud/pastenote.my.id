const fs = require('fs');
const har = JSON.parse(fs.readFileSync('contoh.har', 'utf8'));
const entries = har.log.entries;

// Focus on the /api/read-inbox call
const readInbox = entries.find(e => e.request.url.includes('/api/read-inbox'));

if (readInbox) {
  console.log('=== /api/read-inbox REQUEST ===');
  console.log('Method:', readInbox.request.method);
  console.log('URL:', readInbox.request.url);
  
  console.log('\nRequest Body:');
  if (readInbox.request.postData) {
    try {
      const body = JSON.parse(readInbox.request.postData.text);
      console.log(JSON.stringify(body, null, 2));
      
      if (body.credentials) {
        console.log('\n--- Credentials Format ---');
        const parts = body.credentials.split('\t');
        console.log('Tab-separated parts:', parts.length);
        parts.forEach((p, i) => console.log(`  Part[${i}]: ${p.substring(0, 120)}${p.length > 120 ? '...' : ''}`));
        
        if (parts[1]) {
          const pipeParts = parts[1].split('|');
          console.log('\nPipe fields:');
          pipeParts.forEach((p, i) => {
            const labels = ['email', 'password', 'refresh_token', 'client_id'];
            console.log(`  ${labels[i] || 'unknown'}: ${p.substring(0, 60)}${p.length > 60 ? '...' : ''}`);
          });
        }
      }
    } catch(e) {
      console.log(readInbox.request.postData.text);
    }
  }
  
  console.log('\n\n=== /api/read-inbox RESPONSE ===');
  console.log('Status:', readInbox.response.status);
  
  if (readInbox.response.content && readInbox.response.content.text) {
    let text = readInbox.response.content.text;
    // Check if base64 encoded
    if (readInbox.response.content.encoding === 'base64') {
      text = Buffer.from(text, 'base64').toString('utf8');
    }
    try {
      const resp = JSON.parse(text);
      console.log('Top-level keys:', Object.keys(resp));
      
      if (Array.isArray(resp.emails)) {
        console.log(`Emails count: ${resp.emails.length}`);
        if (resp.emails[0]) {
          console.log('Email keys:', Object.keys(resp.emails[0]));
          console.log('\nFirst 3 emails:');
          resp.emails.slice(0, 3).forEach((email, i) => {
            console.log(`\n  [${i+1}]`);
            Object.entries(email).forEach(([k, v]) => {
              const val = typeof v === 'string' ? (v.length > 150 ? v.substring(0, 150) + '...' : v) : JSON.stringify(v);
              console.log(`    ${k}: ${val}`);
            });
          });
        }
      } else {
        console.log(JSON.stringify(resp, null, 2).substring(0, 3000));
      }
    } catch(e) {
      console.log('Parse error:', e.message);
      console.log('Raw (first 2000 chars):', text.substring(0, 2000));
    }
  }
}

// Decode and show frontend files
console.log('\n\n========================================');
console.log('=== FRONTEND: app.js ===');
console.log('========================================');
const appJs = entries.find(e => e.request.url.includes('app.js'));
if (appJs && appJs.response.content) {
  let text = appJs.response.content.text;
  if (appJs.response.content.encoding === 'base64') {
    text = Buffer.from(text, 'base64').toString('utf8');
  }
  console.log(text);
}

console.log('\n\n========================================');
console.log('=== FRONTEND: style.css ===');
console.log('========================================');
const styleCss = entries.find(e => e.request.url.includes('style.css'));
if (styleCss && styleCss.response.content) {
  let text = styleCss.response.content.text;
  if (styleCss.response.content.encoding === 'base64') {
    text = Buffer.from(text, 'base64').toString('utf8');
  }
  console.log(text);
}

console.log('\n\n========================================');
console.log('=== FRONTEND: index.html ===');
console.log('========================================');
const mainHtml = entries.find(e => e.request.url.endsWith('.my.id/'));
if (mainHtml && mainHtml.response.content) {
  let text = mainHtml.response.content.text;
  if (mainHtml.response.content.encoding === 'base64') {
    text = Buffer.from(text, 'base64').toString('utf8');
  }
  console.log(text);
}
