import { 
  BaseDbConfig,
  IConnection,
  IPool,
  Query,
  RecordSet,
  Table,
  MetaData,
} from '@rchs/sql-types';

const mysql = require('mysql2/promise');

class MySqlConnection implements IConnection {
  private readonly connection: any;
  private readonly db: string;

  constructor(connection: any, db: string) {
    this.connection = connection;
    this.db = db;
  }
  async query(query: Query) {
    const [relations, fields] = await this.connection.execute({
      sql: query.text,
      values: query.values,
    });
    const meta = (fields !== undefined 
    ? 
    fields.map((field: any) => {
      const buf = field._buf;
      const tableName = buf.toString(
        field._clientEncoding,
        field._tableStart, 
        field._tableStart + field._tableLength,
      );
      return {
        name: field.name,
        dataTypeId: field.columnType,
        table: tableName,
      } as MetaData;
    })
    :
    []) as MetaData[];
    
    return {
      rowCount: meta.length ? relations.length : 0,
      records: meta.length ? relations : [],
      metaData: meta,
    } as RecordSet;
  }
  
  async commit() {
    await this.connection.commit();
  }
  
  async getAllTables() {
    const recordSet = await this.query({
      text: 'SELECT * FROM information_schema.TABLES WHERE TABLE_CATALOG = ? AND TABLE_SCHEMA = ?',
      values: ['def', this.db],
    });

    const tables: Table[] = recordSet.records.map((record) => {
      return {
        name: record.TABLE_NAME,
        type: record.TABLE_TYPE,
      };
    });

    return tables;
  }

  getDatabase() {
    return this.db;
  }

  async release() {
    await this.connection.release();
    return true;
  }

  async rollback() {
    await this.connection.rollback();
  }

  async startTransaction() {
    await this.connection.beginTransaction();
  }

  escape(s: string) {
    return this.connection.escape(s);
  }
}

export class MySqlPool implements IPool {
  private readonly pool: any;
  private readonly db: string;

  constructor(config: BaseDbConfig) {
    this.pool = mysql.createPool(config);
    this.db = config.database;
  }
  
  async accquire() {
    let connection = await this.pool.getConnection();
    return new MySqlConnection(connection, this.db);
  }

  async end() {
    await this.pool.end();
    return true;
  }
}