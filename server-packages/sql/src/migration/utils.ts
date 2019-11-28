import { IConnection, Table } from '@rchs/sql-types';

export async function doesTableExist(connection: IConnection, table: Table) {
  const tables = await connection.getAllTables();
  for(let i = 0; i < tables.length; i++) {
    if(
      tables[i].name.toLowerCase() === table.name.toLowerCase() 
      && 
      tables[i].type.toLowerCase() === table.type.toLowerCase()
      )
      return true;
  }

  return false;
}