import { RecordElement } from '@rchs/sql-types';

export type MappingData = {
  name: string,
  pivot: string,
  fields: string[],
  alignments: MappingData[],
  children: MappingData[],
};

export type GroupingData = {
  [name: string]: RecordElement | GroupingData | GroupingData[],
};