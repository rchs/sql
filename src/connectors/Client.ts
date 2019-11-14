//Better if transaction can have query attribute for current SQL executing
// also begin, release...savepoints...rollbacksavepoints
// support for transaction levels
export interface TransactionInterface {
  connection: any,
  begin(value?: any): Promise<any>,//might be used to return transaction id
  commit(value?: any): Promise<any>,
  rollback(error?: any): Promise<any>,
}

export interface ClientInterface {
  client: any,
  accquireConnection(): Promise<any>,
  releaseConnection() : Promise<boolean>,
  destroyConnection() : Promise<boolean>,
  transaction(connection: any): TransactionInterface,
  close(): Promise<boolean>,   
}