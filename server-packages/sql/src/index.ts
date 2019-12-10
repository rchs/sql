import { IPool, BaseConfig, IConnection, GroupDataMap } from '@rchs/sql-types';

import { Queryfile } from './queryfile';
import { loadQueryfiles } from './utils/loadQueryfiles';
import { migrate } from './migration/migrate';
import { seed } from './migration/seed';

export type DbSession = {
  query: IConnection["query"],
  queryfile: {[name: string]: Queryfile},
};

export class SqlDb {
  private readonly pool: IPool;
  private readonly queryfilesRaw: {[name: string]: {sql: string, group?: GroupDataMap}};
  private readonly migrations: string | undefined;
  private readonly seed: string | undefined;

  constructor(config: BaseConfig) {
    this.pool = config.pool;
    this.queryfilesRaw = {};
    
    if(config.queryfiles) {
     this.queryfilesRaw = loadQueryfiles(config.queryfiles);
    }

    if(config.migrations) {
      this.migrations = config.migrations;
    }

    if(config.seed) {
      this.seed = config.seed;
    }
  }

  async migrate() {
    // NOTE: MySQL has implicit commit. So rollback on create/alter tables may not work
    if(this.migrations) {
      const connection = await this.pool.acquire();
      await connection.startTransaction();
      try {
        await migrate(connection, this.migrations);
        await connection.commit();
      } catch(e) {
        await connection.rollback();
      } finally {
        await connection.release();
      }
    } else {
      console.error('Migration path is not specified in the config!');
    }
  }

  async runSeed(variables: {[name: string]: any }) {
    if(this.seed) {
      const connection = await this.pool.acquire();
      await connection.startTransaction();
      try {
        await seed(connection, this.seed, variables);
        await connection.commit();
      } catch(e) {
        await connection.rollback();
      } finally {
        await connection.release();
      }
    } else {
      console.error('Seed path is not specified in the config!');
    }
  }

  async execute(cb: (dbSession: DbSession) => Promise<void>) {
    const connection = await this.pool.acquire();
    try {
      await connection.startTransaction();
      const queryfiles: {[name: string]: Queryfile} = {};
      const dbSession: DbSession = {
        query: connection.query.bind(connection),
        queryfile: new Proxy (queryfiles, {
          'get': (obj, prop) => {
            const key = prop.toString();
            if(!obj[key]) {
              obj[key] = new Queryfile(this.queryfilesRaw[key].sql, this.queryfilesRaw[key].group, connection);
            }
            
            return obj[key];
          }
        }),
      }
      await cb(dbSession);
      await connection.commit();
    } catch(e) {
      await connection.rollback();
      throw e;
    } finally {
      await connection.release();
    }
  }
}
