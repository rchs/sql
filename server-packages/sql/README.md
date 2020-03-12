Sql Database interface

1. Create a pool
import { MySqlPool } from '@rchs/sql-connector-mysql

Creating Pool

const pool = new MySqlPool({
  host: "xyz";
  user: "xyz";
  password: "xyz";
  port: 1234;
  database: "xyz";
});

2. Create the db instanace
import { SqlDb } from '@rchs/sql';

const db = new SqlDb({
  pool: pool,
  migrations: "/path/to/migrationsFolder",
  seed: "/path/to/seedFolder",
  "queryfiles": ["/path/to/queryfileFolder", "/path/to/queryfileFolder"]
})

3. Run migrations
async function migrate() {
  await db.migrate();
}

4. Run seed
async function seed() {
  await db.seed({
    VARIABLE_1: "var1",
  });
}

5. Start a db transaction and run queries
async function sampleCRUD() {
  await db.execute((dbSession) => {
    const result1 = await dbSession.query({text: "select * from test;"})
    const result2 = await dbSession.queryfile.user.getAllUser(["1"])
  })
}