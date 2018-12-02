const { Client } = require('pg')

module.exports = {
  getDb () {
    return new Client({
      host: 'localhost',
      user: 'postgres',
      password: 'postgres',
      database: 'postgres',
      searchPath: ['public']
    })
  }
}
