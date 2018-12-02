# problem :turtle:

- generated sql is << slower than simple sql when doing basic sorting on large dataset

# example

- `node demo.js`. this script:
  - creates a db (docker, pg:alpine@latest)
  - upserts a schema
  - creates a bunch of fake data
  - `COPY`s all records to the DB.  (the scripts are a little much, but i had the boilerplate ready!)
  - starts postgraphile
- open up graphiql

```gql
{
  allListings(last: 10) {
    edges {
      node {
        id
      }
    }
  }
}
```

nice and quick! let's run a more interesting query:

```graphql
{
  allListings(last: 10, orderBy: [MLS_DESC]) {
    edges {
      node {
        addr1
        beds1
        city
        county
        mls
        priceList
        zip
        zone
      }
    }
  }
}
```

this yields a 15+ second query.  hmmm. graphiql also sorted by `id`, which my query doesn't specify. :rage1:

```
postgraphile:postgres with __local_0__ as (
postgraphile:postgres         with __local_1__ as (
postgraphile:postgres
postgraphile:postgres       select to_json((jsonb_build_object('@node'::text, (jsonb_build_object('addr1'::text, (__local_2__."addr_1"), 'beds1'::text, (__local_2__."beds_1"), 'city'::text, (__local_2__."city"), 'county'::text, (__local_2__."county"), 'mls'::text, (__local_2__."mls"), 'priceList'::text, (__local_2__."price_list"), 'zip'::text, (__local_2__."zip"), 'zone'::text, (__local_2__."zone")))))) as "@edges"
postgraphile:postgres       from "public"."listings" as __local_2__
postgraphile:postgres
postgraphile:postgres       where (TRUE) and (TRUE)
postgraphile:postgres       order by __local_2__."mls" ASC,__local_2__."id" DESC
postgraphile:postgres       limit 10
postgraphile:postgres
postgraphile:postgres
postgraphile:postgres         )
postgraphile:postgres         select *
postgraphile:postgres         from __local_1__
postgraphile:postgres         order by (row_number() over (partition by 1)) desc
postgraphile:postgres         ), __local_3__ as (select json_agg(to_json(__local_0__)) asdata from __local_0__) select coalesce((select __local_3__.data from __local_3__), '[]'::json) as "data"  +0ms
0 error(s) in 15046.36ms :: { allListings(last: 10, orderBy: [MLS_DESC]) { edges { node { addr1 beds1 city county mls priceList zipzone } } } }
```

using that generated sql, let's now jump just into a `psql` context.  let's take _just_ that subquery `postgraphile` generated for us:

```sh
$ ./scripts/db/psql.sh
psql (10.5)
Type "help" for help.
```

```sql
-- adding `EXPLAIN (ANALYZE, BUFFERS)`,
EXPLAIN (ANALYZE, BUFFERS)
select to_json((jsonb_build_object('@node'::text, (jsonb_build_object('addr1'::text, (__local_2__."addr_1"), 'beds1'::text, (__local_2__."beds_1"), 'city'::text, (__local_2__."city"), 'county'::text, (__local_2__."county"), 'mls'::text, (__local_2__."mls"), 'priceList'::text, (__local_2__."price_list"), 'zip'::text, (__local_2__."zip"), 'zone'::text, (__local_2__."zone")))))) as "@edges"
from "public"."listings" as __local_2__
where (TRUE) and (TRUE)
order by __local_2__."mls" ASC,__local_2__."id" DESC
limit 10;
-- 31132.781 ms :(. same w/ `EXPLAIN (ANALYZE, BUFFERS) ...`
-- without explain analyze, ~13 seconds, repeatably

-- Limit  (cost=68521.60..68521.63 rows=10 width=40) (actual time=31614.179..31614.425 rows=10 loops=1)
--   Buffers: shared hit=2208 read=27204
--   ->  Sort  (cost=68521.60..71021.60 rows=999999 width=40) (actual time=31614.159..31614.241 rows=10 loops=1)
--         Sort Key: mls, id DESC
--         Sort Method: top-N heapsort  Memory: 27kB
--         Buffers: shared hit=2208 read=27204
--         ->  Seq Scan on listings __local_2__  (cost=0.00..46911.98 rows=999999 width=40) (actual time=0.200..23706.512 rows=999999loops=1)
```

ok. bummer. let's realllly simplify the generated sql:

```sql
select *
from "public"."listings"
order by "mls" DESC, "id" DESC
limit 10;
-- almost instant!
```

so, it would seem that the json operations are really hurting perf!

i can do more debugging, but my pg-fu is weak, so i'd prefer to pair, or be assigned homework :)

finally,

`docker rm -f slowpo` to clean up the db!
