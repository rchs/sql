import { readFileSync, existsSync, } from 'fs';
import { dirname, resolve } from 'path';

export function QueryfileReader(file: string): string[] {
  if (!existsSync(file))
    throw new Error(`Sql file named ${file} not found`);
  
  const lines = readFileSync(file, 'utf-8').split('\n');
  let sql = '';
  const result: string[] = [];
  lines.forEach((l: string, idx: number) => {
    const line = l.trim();
    if (line.length === 0)
      return;
    if (line.startsWith('--')) {
      if (sql) 
        throw new Error(`Incomplete sql in ${file} Line ${idx} [${sql}]`);
      
      let r = null;
      if (r = line.match(/[-\s]+IMPORT\s+([\w-.]+)/i)) {
        const importFile = r[1];
        const importedFile = resolve(dirname(file), importFile);
        if (!existsSync(importedFile)) {
          throw new Error(`Imported sql not found ${importedFile}`);
        }

        const importedSqls = QueryfileReader(importedFile);
        importedSqls.forEach((s: string) => result.push(s));
      }
    } else {
      sql += `${sql ? ' ' : ''}${line}`;
      if (line.endsWith(';')) {
        result.push(sql);
        sql = '';
      }
    }
  });

  if (sql) 
    throw new Error(`Unterminated sql in ${file} [${sql}]`);
  
  return result;
}