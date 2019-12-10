import { TransactionInterface, ClientInterface } from '../Client';

class MySQLXTransaction implements TransactionInterface {
  connection: any;

  constructor(connection: any) {
    this.connection = connection;    
  }

  async begin(value?: any): Promise<any> {
    return await this.connection.startTransaction();
  }

  async commit(value?: any): Promise<any> {
    return await this.connection.commit();
  }

  async rollback(error?: any): Promise<any> {
    return await this.connection.rollback();
  }
}

export class MySQLXClient implements ClientInterface {
  readonly client: any;

  //config will be passed with custom types
  constructor(config: any) {
    //configure client here
    let mysqlx = require('@xdevapi/mysqlx');
    this.client = mysqlx;
  }
  
  async accquireConnection(): Promise<any> {
    return await this.client.getSession();
  }
  
  async releaseConnection() : Promise<boolean> {
    return await Promise.resolve(true);
  }

  async destroyConnection() : Promise<boolean> {
    return await Promise.resolve(true);
  }

  transaction(connection: any): TransactionInterface {
    return new MySQLXTransaction(connection);
  }

  async close(): Promise<boolean> {
    return await Promise.resolve(true);
  }
}