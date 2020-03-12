export type Query = {
  name?: string;
  text: string;
  values?: RecordElement[];
};
export type GroupDataMap = {
  name: string;
  table: string;
  key: string;
  align?: GroupDataMap[] | string[];
  children?: GroupDataMap[];
};
export type BaseDbConfig = {
  host: string;
  user: string;
  password: string;
  port: number | string;
  database: string;
};
export type Table = {
  name: string;
  type: string;
};
export type MetaData = {
  table: string;
  name: string;
  dataTypeId: string | number;
};
export type RecordElement = any;
export type RecordSet = {
  rowCount: number;
  records: {[name: string]: RecordElement}[];
  metaData: MetaData[];
};
export interface IConnection {
  startTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(error?: string): Promise<void>;
  query(query: Query): Promise<RecordSet>;
  release(): Promise<boolean>;
  getAllTables(): Promise<Table[]>;
  getDatabase(): string;
  escape(s: string): string,
};
export interface IPool {
  acquire(): Promise<IConnection>;
  end(): Promise<boolean>;
};
export type BaseConfig = {
  pool: IPool,
  migrations?: string,
  seed?: string,
  queryfiles?: string[],
};