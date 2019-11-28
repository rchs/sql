import { GroupDataMap, RecordSet } from '@rchs/sql-types';

import { Mapping } from './Mapping';
import { Grouping } from './Grouping';
import { GroupingData } from './types';

export function GroupData(sqlRecordMapper: GroupDataMap | undefined, recordSet: RecordSet) {
  if(sqlRecordMapper === undefined) {
    return recordSet.records;
  }

  const mapping = Mapping(sqlRecordMapper, recordSet.metaData);
  const grouping = new Grouping(mapping);
  let result: GroupingData[] = [];
  recordSet.records.forEach((record) => {
    const res = grouping.consume(record);
    if(typeof res !== 'boolean')
      // else a side effect has occured on an element on result
      result.push(res);
  });

  return result;
}