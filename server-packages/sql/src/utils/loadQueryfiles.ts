import { existsSync, readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { GroupDataMap } from '@rchs/sql-types';
import { QueryfileReader } from './QueryfileReader';

export function loadQueryfiles(paths: string[]) {
  let result: {[name: string]: {sql: string, group?: GroupDataMap}} = {};
  
  paths.forEach((folder) => {
    if (!existsSync(folder)) {
      throw new Error(`Sql Folder ${folder} does not exist!`)
    }
    const files = readdirSync(folder);
    files.forEach((file: string) => {
      const [name, ext]: string[] = file.split('.');
      if(!result[name])
        result[name] = {sql: ''};

      if(ext === 'sql') {
        const sql = QueryfileReader(resolve(folder, file));
        result[name].sql = sql.reduce((acc, val) => {
          return val.reduce((acc, val) => {
            acc += val; 
            return acc;
          }, acc);
        }, '');
      }
      else if (ext === 'json')
        result[name].group = JSON.parse(readFileSync(resolve(folder, file), 'utf-8')) as GroupDataMap;
    });
  });

  return result;
}