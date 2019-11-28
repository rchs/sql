import { Query, IConnection } from '@rchs/sql-types';

import { MIGRATION_IDENT } from './constants';
import { CONFIG_TABLE_NAME } from '../constants';
import { Revision } from './types';

export async function getCurrentDbHead(connection: IConnection): Promise<Revision> {
  try {
    const query: Query = {
      text: 'SELECT value FROM rchs_sql_config WHERE id=?',
      values: [MIGRATION_IDENT],
    };
    const result = await connection.query(query);
    if (result.records.length === 0) 
      return {version: 0, revision: 0};

    if (result.records.length === 1 && result.records[0]) {
      const revision = JSON.parse(result.records[0].value);
      if(revision !== undefined) {
        return revision;
      }
    }
    
    throw new Error(`Corrupted migration! Table: ${CONFIG_TABLE_NAME}! ident ${MIGRATION_IDENT}`);
  } catch(e) {
    throw e;
  }
}