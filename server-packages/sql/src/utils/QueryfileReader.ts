import { readFileSync, existsSync, } from 'fs';
import { dirname, resolve } from 'path';

export function QueryfileReader(file: string): string[][] {
  if (!existsSync(file))
    throw new Error(`Sql file named ${file} not found`);
  
  const lines = readFileSync(file, 'utf-8').split('\n');
  let sql = '';
  let rev = 0;
  const result: string[][] = [[]];
  lines.forEach((l: string, idx: number) => {
    const line = l.trim();
    if (line.length === 0)
      return;
    if (line.startsWith('--')) {
      if (sql) 
        throw new Error(`Incomplete sql in ${file} Line ${idx} [${sql}]`);
      
      let r = null;
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
        if (!existsSync(importedFile)) {
          throw new Error(`Imported sql not found ${importedFile}`);
        }

        const importedSqls = QueryfileReader(importedFile);
        importedSqls.forEach((s) => { 
          s.forEach((sql) => {
            result[rev].push(sql);
          });
        });
      }
    } else {
      sql += `${sql ? ' ' : ''}${line}`;
      if (line.endsWith(';')) {
        result[rev].push(sql);
        sql = '';
      }
    }
  });

  if (sql) 
    throw new Error(`Unterminated sql in ${file} [${sql}]`);
  
  return result;
}