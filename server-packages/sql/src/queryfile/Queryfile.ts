import { GroupDataMap, IConnection, RecordElement } from "@rchs/sql-types";

import { GroupData } from "./GroupData";

export class Queryfile {
  private readonly sql: string;
  private readonly groupDataMap: GroupDataMap | undefined;
  private readonly connection: IConnection;

  constructor(
    sql: string, 
    groupDataMap: GroupDataMap | undefined,
    connection: IConnection,
  ) {
    this.sql = sql;
    this.groupDataMap = groupDataMap;
    this.connection =connection;
  }

  async execute(...args: RecordElement[]) {
    const recordSet = await this.connection.query({text: this.sql, values: args});
    const result = GroupData(this.groupDataMap, recordSet);

    return result;
  }
}