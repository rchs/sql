import { GroupDataMap, MetaData } from '@rchs/sql-types';
import { MappingData } from './types';

export function Mapping(groupDataMap: GroupDataMap, metaData: MetaData[]) {
  const pivotIdx = metaData.findIndex((m) => {
    return m.table === groupDataMap.table && m.name === groupDataMap.key;
  });
  if (pivotIdx === -1) {
    throw new Error('Could not find the pivot. Please check your sql and the json structure');
  }

  let fields: string[] = [];
  let alignments: MappingData[] = [];
  let children: MappingData[] = [];

  if(groupDataMap.align !== undefined) {
    groupDataMap.align.forEach((alignment: string | GroupDataMap) => {
      if(typeof alignment !== 'string') {
        alignments.push(Mapping(alignment, metaData));
      }
    });
  }
  
  if(groupDataMap.children !== undefined) {
    groupDataMap.children.forEach((child) => {
      children.push(Mapping(child, metaData));
    });
  }
  
  metaData.forEach((meta) => {
    if(groupDataMap.table === meta.table) {
      fields.push(meta.name);
    } else if(groupDataMap.align !== undefined) {
      groupDataMap.align.forEach((alignment: string | GroupDataMap) => {
        if(typeof alignment === 'string') {
          if(alignment === meta.table)
            fields.push(meta.name);
        }
      });
    }
  });

  return {
    name: groupDataMap.name,
    pivot: metaData[pivotIdx].name,
    fields,
    alignments,
    children,
  } as MappingData
}