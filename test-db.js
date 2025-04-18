const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://muhammadfuzailayaz:postgres@localhost:5432/collabconnect'
});

client.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ Connection error:', err.stack))
  .finally(() => client.end());
