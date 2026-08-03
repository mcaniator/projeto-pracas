import { SQLiteMigration } from "@/lib/capacitor/sqlite/SQLiteMigration";
import v1_20260729212100_prepare_database from "@/lib/capacitor/sqlite/allDbMigrations/v1_20260729212100_prepare_database";
import { Capacitor } from "@capacitor/core";
import {
  SQLiteConnection,
  type SQLiteDBConnection,
  SQLiteVanilla,
} from "@microbit/capacitor-sqlite-vanilla";

export type SQLiteTransactionOperation = {
  statement: string;
  values?: unknown[];
};

class SQLite
  implements
    Pick<
      SQLiteDBConnection,
      | "close"
      | "execute"
      | "executeSet"
      | "executeTransaction"
      | "getVersion"
      | "isOpen"
      | "run"
    >
{
  /** Holds the connection created when this instance is constructed. */
  private dbPromise: Promise<SQLiteDBConnection> | undefined = undefined;
  private initializationPromise: Promise<void> | undefined = undefined;
  private name: string | undefined = undefined;
  private initialized = false;
  private clearTransaction?: SQLiteTransactionOperation[];

  /**
   * Creates and opens a connection to the specified database file.
   *
   * @param name SQLite database name, without the file extension.
   */
  constructor({
    name,
    migrations,
    clearTransaction,
  }: {
    name: string;
    migrations: SQLiteMigration[];
    clearTransaction?: SQLiteTransactionOperation[];
  }) {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    const sqlite = new SQLiteConnection(SQLiteVanilla);
    this.name = name;
    this.clearTransaction = clearTransaction;
    this.dbPromise = sqlite.createConnection(name);
    this.initializationPromise = this.dbPromise.then(async (db) => {
      await db.execute("PRAGMA foreign_keys = ON;");
      const currentVersion = await db.getVersion();
      await this.executeMigrations({ db, migrations, currentVersion });
      this.initialized = true;
    });
  }

  /**
   * Waits for connection initialization before returning the open database.
   */
  private async getDb(): Promise<SQLiteDBConnection> {
    if (!this.dbPromise || !this.initializationPromise)
      throw new Error("Database not initialized.");
    let tries = 0;
    while (!this.initialized) {
      await Promise.race([
        this.initializationPromise,
        new Promise<void>((resolve) => setTimeout(resolve, 500)),
      ]);
      tries += 1;
      if (tries > 10) throw new Error("Failed to initialize database.");
    }
    return this.dbPromise;
  }

  /** Closes the native database connection. */
  public async close(): Promise<void> {
    const db = await this.getDb();
    await db.close();
  }

  /**
   * Executes one or more SQL statements without parameters, such as table
   * creation and schema changes.
   *
   * @param statements SQL statements to execute.
   */
  public async execute(statements: string) {
    const db = await this.getDb();
    return db.execute(statements);
  }

  /**
   * Executes multiple parameterized SQL statements, optionally in a transaction.
   *
   * @param set Statements and positional values to execute.
   * @param transaction When `true`, executes all statements atomically.
   */
  public async executeSet(
    set: {
      statement: string;
      values?: unknown[];
    }[],
    transaction?: boolean,
  ) {
    const db = await this.getDb();
    return db.executeSet(set, transaction);
  }

  /**
   * Executes multiple parameterized SQL statements in a single transaction.
   *
   * If any statement fails, none of the statements in the list are persisted.
   *
   * @param set Statements and positional values to execute.
   */
  public async executeTransaction(
    set: { statement: string; values?: unknown[] }[],
  ) {
    const db = await this.getDb();
    return db.executeTransaction(set);
  }

  /** Returns whether the database connection is open. */
  public async isOpen() {
    const db = await this.getDb();
    return db.isOpen();
  }

  /**
   * Executes an SQL query and returns the matching rows.
   *
   * @param statement SQL query, usually a `SELECT` statement.
   * @param values Values for the query's `?` parameters.
   */
  public async query({
    statement,
    values,
  }: {
    statement: string;
    values?: unknown[];
  }) {
    const db = await this.getDb();
    return db.query(statement, values);
  }

  /**
   * Executes a parameterized SQL statement that modifies data, such as `INSERT`,
   * `UPDATE`, or `DELETE`.
   *
   * @param statement SQL statement to execute.
   * @param values Values for the statement's `?` parameters.
   */
  public async run(statement: string, values?: unknown[]) {
    const db = await this.getDb();
    return db.run(statement, values);
  }

  /** Returns the current schema version stored in `PRAGMA user_version`. */
  public async getVersion() {
    const db = await this.getDb();
    return db.getVersion();
  }

  /**
   * Gets database name`.
   *
   * @returns Database name
   */
  public getDbName() {
    return this.name;
  }

  public async clear() {
    if (!this.clearTransaction) {
      throw new Error(`No clear transaction for ${this.name}`);
    }
    const db = await this.getDb();
    await db.executeTransaction(this.clearTransaction);
  }

  private async executeMigrations({
    db,
    currentVersion,
    migrations,
  }: {
    db: SQLiteDBConnection;
    currentVersion: number;
    migrations: SQLiteMigration[];
  }) {
    if (!this.name) throw new Error("Database name not set.");
    if (currentVersion === 0) {
      await v1_20260729212100_prepare_database.execute({
        dbName: this.name,
        db,
      });
      currentVersion = 1;
    }
    for (let i = currentVersion - 1; i < migrations.length; i++) {
      const migration = migrations[i];
      if (!migration) {
        throw new Error(`${i + 1}º migration for ${this.name} not found`);
      }
      await migration.execute({ dbName: this.name, db });
    }
  }
}

export { SQLite };
