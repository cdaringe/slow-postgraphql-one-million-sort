#!/usr/bin/env node
require('perish')
const execa = require('execa')
const bluebird = require('bluebird')
const SPAWN_OPTS =  {
  stdio: 'inherit',
  cwd: __dirname,
  env: {
    ...process.env,
    DEBUG: 'postgraphile:postgres'
  }
}

const log = (...args) => console.log('[slowpo-demo]', ...args)

async function run () {
  log('purging old demo db')
  await execa.shell('docker rm -f slowpo || true')
  log('starting db (docker postgres)')
  await execa.shell('docker run -itd --name slowpo -p 5432:5432 postgres:alpine')
  log('sloppily waiting for the db to ready itself')
  await bluebird.delay(4000)
  log('creating schema, one index on `mls` column')
  log('generating 1M dummy records to csv')
  await Promise.all([
    execa('node', ['scripts/generate-listings.js'], SPAWN_OPTS),
    execa('bash', ['scripts/db/create-schema.sh'], SPAWN_OPTS)
  ])
  log('postgres COPY of 1M records')
  await execa('node', ['scripts/upload-bulk-listings.js'], SPAWN_OPTS)
  log('starting postgraphile. now switch back to the readme!')
  await execa('npx', ['postgraphile', '-c', 'postgres://postgres:postgres@localhost:5432/postgres'], SPAWN_OPTS)
}
run()
