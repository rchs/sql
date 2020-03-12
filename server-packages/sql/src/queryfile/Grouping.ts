import { RecordElement } from '@rchs/sql-types';
import { MappingData, GroupingData } from './types';

export class Grouping {
  private records: {[name: string]: GroupingData} = {};
  private name: string;
  private pivot: string;
  private fields: string[];
  private alignments: Grouping[];
  private children: Grouping[];
  constructor(mapping:MappingData) {
    this.name = mapping.name;
    this.fields = mapping.fields;
    this.pivot = mapping.pivot;
    this.alignments = mapping.alignments.map(alignment => new Grouping(alignment));
    this.children = mapping.children.map(child => new Grouping(child));
  }

  reset() {
    this.records = {};
  }

  consume(record: {[name: string]: RecordElement}) {
    const id = record[this.pivot];
    // Can't consume a record wihtout a pivot
    if (id === null) return false;

    const existing = this.records[id] !== undefined;
    const result = existing ? this.records[id] : {};

    if (!existing) {
      this.alignments.forEach((alignment) => alignment.reset());
      this.children.forEach((child) => child.reset());

      this.records[id] = result;
      this.fields.forEach((field) => {
        result[field] = record[field];
      });
    }

    this.alignments.forEach((alignment) => {
      const alignRecord = alignment.consume(record);
      if (typeof alignRecord === 'object') {
        result[alignment.name] = alignRecord;
      }
    });

    this.children.forEach((child) => {
      if(result[child.name] === undefined)
        result[child.name] = [];
      const childRecord = child.consume(record);
      if (typeof childRecord === 'object') {
        result[child.name].push(childRecord);
      }
    });

    return existing || result;
  }
}