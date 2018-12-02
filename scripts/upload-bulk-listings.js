require('perish')

const { assetsRoot } = require('./common/paths')
const { from } = require('pg-copy-streams')
const { getDb } = require('./common/db')
const fs = require('fs')
const path = require('path')

function log (...args) {
  console.log('[bulk listing uploader]', ...args)
}

const onError = err => {
  console.error(err)
  process.exit(1)
}

async function go () {
  const db = getDb()
  await db.connect()
  log('purge table')
  await db.query('delete from listings')
  log('start bulk upload')
  var stream = db.query(from('copy listings from stdin csv header'))
  var fileStream = fs.createReadStream(path.resolve(assetsRoot, 'listing.bulk.generated.csv'))
  fileStream.on('error', onError)
  stream.on('error', onError)
  stream.on('end', async () => {
    log('finish bulk upload')
    db.end()
  })
  fileStream.pipe(stream)
}
go()
