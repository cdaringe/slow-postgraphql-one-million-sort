const fs = require('fs')
const path = require('path')

const NUM_RECORDS = 1e6

const headers = [
  'id',
  'addr_1',
  'beds_1',
  'beds_10',
  'beds_2',
  'beds_3',
  'beds_4',
  'beds_5',
  'beds_6',
  'beds_7',
  'beds_8',
  'beds_9',
  'city',
  'county',
  'day_on_market',
  'exp_ptax',
  'exp_total_claim_yr',
  'goi_claim',
  'mls',
  'noi_claim',
  'price_list',
  'rent_sub_cur_1',
  'rent_sub_cur_10',
  'rent_sub_cur_2',
  'rent_sub_cur_3',
  'rent_sub_cur_4',
  'rent_sub_cur_5',
  'rent_sub_cur_6',
  'rent_sub_cur_7',
  'rent_sub_cur_8',
  'rent_sub_cur_9',
  'units',
  'units_1',
  'units_10',
  'units_2',
  'units_3',
  'units_4',
  'units_5',
  'units_6',
  'units_7',
  'units_8',
  'units_9',
  'year',
  'zip',
  'zone'
]

const randomString = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 5)

const randomAddr = () =>
  `${Math.random()
    .toString()
    .substr(2, 3)} ${randomString().toUpperCase()} ST`

function go ({ filename, total }) {
  let i = 1
  const currentYear = new Date().getFullYear()
  const stream = fs.createWriteStream(filename)
  stream.write(`${headers.join(',')}\n`)
  while (i < total) {
    const heads = Math.random() > 0.5
    ++i
    const record = [
      i,
      randomAddr(),
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      heads ? 'PORTLAND' : 'PRINEVILLE',
      heads ? 'MULTNOMAH' : 'CROOKE',
      '2018-02-03 00:00:00+00',
      3000,
      0,
      0,
      i,
      0,
      500000 + (Math.random() + 1e6) * (heads ? 1 : -1),
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      currentYear + Math.random() * -100,
      heads ? 97202 : 97754,
      'R2'
    ].map(i => i.toString())
    stream.write(`${record.join(',')}\n`)
  }
}
go({
  filename: path.resolve(__dirname, '../assets/listing.bulk.generated.csv'),
  total: NUM_RECORDS
})
