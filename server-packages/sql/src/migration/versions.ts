// Read the different versions of db migration available
// based on the .sql files available in the migrations folder
// Make sure the file name part is parsable to a integer value
import { readdirSync, } from 'fs';
import { resolve } from 'path';

import { Version } from './types';

export function toNum(v: string): number {
  return parseInt(v, 10) || 0;
}

export const getAllVersions = (file: string) => {
  return (readdirSync(file)
  .filter((name: string) => {
    return name.endsWith('.sql') && !Number.isNaN(toNum(name));
  })
  .map((name: string): Version => ({
    version: toNum(name),
    file: resolve(file, name),
  }))
  .sort((a: Version, b: Version) => {
    return a.version - b.version;
  })) as Version[];
};