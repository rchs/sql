import { Query, IConnection, RecordElement } from '@rchs/sql-types';

import { QueryfileReader } from '../utils/QueryfileReader';

import { getCurrentDbSeedHead } from './getCurrentDbSeedHead';
import { getAllVersions } from './versions';
import { SEED_IDENT } from './constants';

export async function seed(
  connection: IConnection, 
  folder: string, 
  variables: {[name: string]: RecordElement}) {
  try {
    await connection.query({
      text: 'CREATE TABLE IF NOT EXISTS rchs_sql_config(id varchar(32) NOT NULL PRIMARY KEY, value json default null)'
    });

    const currentDbSeedVersion = await getCurrentDbSeedHead(connection);
    // eslint-disable-next-line no-console
    console.log(`[Seed] Start Seed from ${currentDbSeedVersion.version}.${currentDbSeedVersion.revision}`);
    const versions = getAllVersions(folder);
    let idx = versions.findIndex(v => v.version >= currentDbSeedVersion.version);
    if (idx === -1)
      idx = versions.length;

    const updated = Object.assign({}, currentDbSeedVersion);

    // Run all sqls starting from idx
    for (let i = idx; i < versions.length; i += 1) {
      const { version, file } = versions[i];

      // Execute sql given in file sequentially
      const revisions = QueryfileReader(file);
      const fromRevision = version === currentDbSeedVersion.version ? currentDbSeedVersion.revision + 1 : 0;

      for (let j = fromRevision; j < revisions.length; j += 1) {
        // eslint-disable-next-line no-console
        console.log(`[Migration] Running migration ${version}.${j}`);
        const revision = revisions[j]
        for(let k = 0; k < revision.length; k++) {
          let sql = revision[k];
          (sql.match(new RegExp('\\${([^}]+)}')) || []).forEach((m) => {
            const key = m.replace(new RegExp('\\$|{|}', 'g'), '');
            const value = variables[key];
            sql = sql.replace(m, value);
          });
          await connection.query({text: revision[k]} as Query);
        }
      }

      updated.version = version;
      updated.revision = revisions.length - 1;
    }

    // Commit the version number
    if (updated.version !== currentDbSeedVersion.version) {
      const query = currentDbSeedVersion.revision != 0 ? 
      {
        text: 'UPDATE rchs_sql_config set id=?, value=? where id=?',
        values: [SEED_IDENT, updated, SEED_IDENT],
      }
      :
      {
        text: 'INSERT INTO rchs_sql_config values(?,?)',
        values: [SEED_IDENT, updated]
      };
      await connection.query(query);
    }
    // eslint-disable-next-line no-console
    console.log(`[Seed] Complete Seed to ${updated.version}.${updated.revision}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Seed] Error during Seed', err);
    throw err;
  }
};