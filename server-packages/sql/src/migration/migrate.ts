import { Query, IConnection } from '@rchs/sql-types';

import { MIGRATION_IDENT } from './constants';
import { getCurrentDbHead } from './getCurrentDbHead';
import { getAllVersions } from './versions';
import { getSqlRevisions } from './revisions';

/*
Should create migration table if not exists
*/

export async function migrate(connection: IConnection, folder: string) {
  try {
    // always create table
    await connection.query({
      text: 'CREATE TABLE IF NOT EXISTS rchs_sql_config(id varchar(32) NOT NULL PRIMARY KEY, value json default null)'
    });

    const currentDbVersion = await getCurrentDbHead(connection);
    // eslint-disable-next-line no-console
    console.log(`[Migration] Start Migration from ${currentDbVersion.version}.${currentDbVersion.revision}`);
    const versions = getAllVersions(folder);
    let idx = versions.findIndex(v => v.version >= currentDbVersion.version);
    if (idx === -1)
      idx = versions.length;

    const updated = Object.assign({}, currentDbVersion);

    // Run all sqls starting from idx
    for (let i = idx; i < versions.length; i += 1) {
      const { version, file } = versions[i];

      // Execute sql given in file sequentially
      const revisions = getSqlRevisions(file);
      const fromRevision = version === currentDbVersion.version ? currentDbVersion.revision + 1 : 0;

      for (let j = fromRevision; j < revisions.length; j += 1) {
        // eslint-disable-next-line no-console
        console.log(`[Migration] Running migration ${version}.${j}`);
        const revision = revisions[j]
        for(let k = 0; k < revision.length; k++) {
          await connection.query({text: revision[k]} as Query);
        }
      }

      updated.version = version;
      updated.revision = revisions.length - 1;
    }

    // Commit the version number
    if (updated.version !== currentDbVersion.version) {
      const query = currentDbVersion.revision != 0 ? 
      {
        text: 'UPDATE rchs_sql_config set id=?, value=? where id=?',
        values: [MIGRATION_IDENT, updated, MIGRATION_IDENT],
      }
      :
      {
        text: 'INSERT INTO rchs_sql_config values(?,?)',
        values: [MIGRATION_IDENT, updated]
      };
      await connection.query(query);
    }
    // eslint-disable-next-line no-console
    console.log(`[Migration] Complete migration to ${updated.version}.${updated.revision}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Migration] Error during migration', err);
    throw err;
  }
};