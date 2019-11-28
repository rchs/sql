import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

import { QueryfileReader } from '../utils/QueryfileReader';

export function getSqlRevisions(file: string) {
  const result: string[][] = [[]];
  let rev = 0;
  const lines = readFileSync(file, 'utf-8').split('\n');
  let sql = '';
  lines.forEach((l: string) => {
    const line = l.trim();
    if (line.length === 0) return;
    if (line.startsWith('--')) {
      // Cannot have comment inbetween sql
      if (sql)
        throw new Error(`Incomplete sql in ${file} [${sql}]`);

      // Check for revision number
      let r = null;
      // eslint-disable-next-line no-cond-assign
      if (r = line.match(/[-\s]+rev\s+(\d+)/i)) {
        const newRev = parseInt(r[1], 10);
        if (newRev !== rev + 1) 
          throw new Error(`Invalid revision number in ${file}. Got ${r[1]} when ${rev + 1} is expected`);
        rev = newRev;
        result[rev] = [];
      // eslint-disable-next-line no-cond-assign
      } else if (r = line.match(/[-\s]+IMPORT\s+([\w-.]+)/i)) {
        const importFile = r[1];
        const importedFile = resolve(dirname(file), importFile);
        if (!existsSync(importedFile))
          throw new Error(`Imported sql not found ${importedFile}`);

        const importedSqls = QueryfileReader(importedFile);
        importedSqls.forEach((s: string) => result[rev].push(s));
      }
    } else {
      sql += `${sql ? ' ' : ''}${line}`;
      if (line.endsWith(';')) {
        // Got a complete sql
        result[rev].push(sql);
        sql = '';
      }
    }
  });

  // all sql must end with a semi-colon, do not allow unterminated sql
  if (sql)
    throw new Error(`Unterminated sql in ${file}. All sql must be terminated with (;)`);
  
    return result;
}