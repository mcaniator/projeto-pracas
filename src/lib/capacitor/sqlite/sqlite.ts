import { SQLiteMigration } from "@/lib/capacitor/sqlite/SQLiteMigration";
import v1_20260729212100_prepare_database from "@/lib/capacitor/sqlite/allDbMigrations/v1_20260729212100_prepare_database";
import { Capacitor } from "@capacitor/core";
import {
  SQLiteConnection,
  type SQLiteDBConnection,
  SQLiteVanilla,
} from "@microbit/capacitor-sqlite-vanilla";

const MAX_SQLITE_PARAMETERS_PER_STATEMENT = 999; //Max number of parameters in a SQLite statement for SQLite 3.31.1 and older

export type SQLiteTransactionOperation = {
  statement: string;
  values?: unknown[];
};

export type SQLiteBulkInsertOperation = {
  table: string;
  columns: readonly string[];
  rows: readonly (readonly unknown[])[];
};

type SQLiteDriverTransactionOperation = {
  statement: string;
  values?: unknown[];
};

const quoteSQLiteIdentifier = (identifier: string) =>
  `"${identifier.replaceAll('"', '""')}"`;

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
  public async executeTransaction(set: SQLiteTransactionOperation[]) {
    const db = await this.getDb();
    return db.executeTransaction(set);
  }

  /**
   * Executes bulk inserts in a single transaction.
   *
   * Inserts are automatically split so that no generated statement exceeds
   * SQLite's parameter limit. The resulting statements still belong to the
   * same transaction, so if any of them fails, none are persisted.
   *
   * @param inserts Tables, columns and rows to insert.
   */
  public async executeBulkInsertTransaction(
    inserts: readonly SQLiteBulkInsertOperation[],
  ) {
    const db = await this.getDb();
    const operations = inserts.flatMap((insert) =>
      this.prepareBulkInsertOperations(insert),
    );
    return db.executeTransaction(operations);
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
   * Gets database name.
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

  /**
   * Returns INSERT operations for a bulk insert. Each INSERT does not exceed SQLite's parameter limit.
   *
   * @returns Database name
   */
  private prepareBulkInsertOperations({
    table,
    columns,
    rows,
  }: SQLiteBulkInsertOperation): SQLiteDriverTransactionOperation[] {
    // An INSERT needs at least one target column to produce valid SQL.
    if (columns.length === 0) {
      throw new Error(`Cannot insert into ${table} without columns.`);
    }

    // A single row cannot be split across statements, so its column count must
    // fit within SQLite's parameter limit by itself.
    if (columns.length > MAX_SQLITE_PARAMETERS_PER_STATEMENT) {
      throw new Error(
        `A row for ${table} requires ${columns.length} parameters, exceeding the SQLite limit of ${MAX_SQLITE_PARAMETERS_PER_STATEMENT}.`,
      );
    }

    // Each value is bound to the column at the same index. Reject malformed
    // rows before starting the transaction instead of generating invalid SQL.
    rows.forEach((row, index) => {
      if (row.length !== columns.length) {
        throw new Error(
          `Row ${index} for ${table} has ${row.length} values, but ${columns.length} columns were provided.`,
        );
      }
    });

    // Calculate how many complete rows fit in one statement without exceeding
    // the maximum number of bound parameters.
    const rowsPerStatement = Math.floor(
      MAX_SQLITE_PARAMETERS_PER_STATEMENT / columns.length,
    );

    // Build the placeholder group for one row, for example: "(?, ?, ?)".
    const rowPlaceholders = `(${columns.map(() => "?").join(", ")})`;

    // Quote table and column names so reserved words and embedded quotes are
    // handled as SQLite identifiers rather than SQL syntax.
    const quotedTable = quoteSQLiteIdentifier(table);
    const quotedColumns = columns.map(quoteSQLiteIdentifier).join(", ");

    // This array will contain the driver-level statements produced from the
    // structured bulk insert.
    const preparedOperations: SQLiteDriverTransactionOperation[] = [];

    // Process one parameter-safe batch at a time.
    for (let start = 0; start < rows.length; start += rowsPerStatement) {
      const batch = rows.slice(start, start + rowsPerStatement);
      preparedOperations.push({
        // Repeat the placeholder group once for every row in this batch.
        statement: `INSERT INTO ${quotedTable} (${quotedColumns}) VALUES ${batch
          .map(() => rowPlaceholders)
          .join(", ")};`,
        // Flatten the rows in the same order as their placeholder groups.
        values: batch.flatMap((row) => [...row]),
      });
    }

    // All operations are later passed together to one SQLite transaction.
    return preparedOperations;
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
