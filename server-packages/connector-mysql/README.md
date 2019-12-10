Connector for MySql Database

import { MySqlPool } from '@rchs/sql-connector-mysql

Creating Pool

const pool = new MySqlPool({
  host: "xyz";
  user: "xyz";
  password: "xyz";
  port: 1234;
  database: "xyz";
});

Acquire Connection
async function conn() {
  const connection = await pool.accquire();
}