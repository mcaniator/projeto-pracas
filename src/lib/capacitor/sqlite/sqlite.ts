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

export type SQLiteBulkUpsertOperation = {
  table: string;
  insertColumns: readonly string[];
  updateColumns: readonly string[];
  conflictColumns: readonly string[];
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

  /**
   * Executes bulk upserts in a single transaction without relying on SQLite's
   * `ON CONFLICT ... DO UPDATE` syntax. By doing this way, we can avoid needing SQLite 3.24+
   *
   * Each row first updates a matching record and then inserts only when no
   * record matches all conflict columns. Every generated statement stays
   * within SQLite's parameter limit.
   *
   * @param upserts Tables, insert/update columns, conflict columns and rows.
   */
  public async executeBulkUpsertTransaction(
    upserts: readonly SQLiteBulkUpsertOperation[],
  ) {
    const db = await this.getDb();
    const operations = upserts.flatMap((upsert) =>
      this.prepareBulkUpsertOperations(upsert),
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

  /**
   * Returns UPDATE/conditional INSERT operations for a bulk upsert.
   *
   * A one-row CTE lets the conditional INSERT reuse the values already bound
   * for the row, so conflict columns do not consume parameters twice.
   */
  private prepareBulkUpsertOperations({
    table,
    insertColumns,
    updateColumns,
    conflictColumns,
    rows,
  }: SQLiteBulkUpsertOperation): SQLiteDriverTransactionOperation[] {
    // An upsert needs insert columns to describe the positional values in each row.
    if (insertColumns.length === 0) {
      throw new Error(`Cannot upsert into ${table} without insert columns.`);
    }

    // At least one conflict column is required to identify an existing row.
    if (conflictColumns.length === 0) {
      throw new Error(`Cannot upsert into ${table} without conflict columns.`);
    }

    // A Set both detects duplicate insert columns and provides efficient
    // membership checks for the update and conflict column validations below.
    const uniqueInsertColumns = new Set(insertColumns);
    if (uniqueInsertColumns.size !== insertColumns.length) {
      throw new Error(`Insert columns for ${table} must be unique.`);
    }

    // Duplicate update columns would generate repeated assignments in SET.
    if (new Set(updateColumns).size !== updateColumns.length) {
      throw new Error(`Update columns for ${table} must be unique.`);
    }

    // Duplicate conflict columns would generate redundant WHERE predicates.
    if (new Set(conflictColumns).size !== conflictColumns.length) {
      throw new Error(`Conflict columns for ${table} must be unique.`);
    }

    // Values are supplied according to insertColumns, so every column used by
    // UPDATE or conflict matching must have a corresponding value in each row.
    const validateInsertColumn = (
      column: string,
      columnKind: "update" | "conflict",
    ) => {
      if (!uniqueInsertColumns.has(column)) {
        throw new Error(
          `${columnKind === "update" ? "Update" : "Conflict"} column ${column} is not present in the insert columns for ${table}.`,
        );
      }
    };
    updateColumns.forEach((column) => validateInsertColumn(column, "update"));
    conflictColumns.forEach((column) =>
      validateInsertColumn(column, "conflict"),
    );

    // Conflict columns identify the existing row and cannot also be updated.
    // Supporting key changes would require separate old and new column values.
    const conflictColumnSet = new Set(conflictColumns);
    const overlappingColumn = updateColumns.find((column) =>
      conflictColumnSet.has(column),
    );
    if (overlappingColumn) {
      throw new Error(
        `Column ${overlappingColumn} cannot be both an update and conflict column for ${table}.`,
      );
    }

    // The conditional INSERT binds one parameter for every insert column.
    if (insertColumns.length > MAX_SQLITE_PARAMETERS_PER_STATEMENT) {
      throw new Error(
        `A row for ${table} requires ${insertColumns.length} parameters, exceeding the SQLite limit of ${MAX_SQLITE_PARAMETERS_PER_STATEMENT}.`,
      );
    }

    // UPDATE binds the new values first and the conflict values used by WHERE
    // afterwards. Check their combined count against SQLite's parameter limit.
    const updateParameterCount = updateColumns.length + conflictColumns.length;
    if (updateParameterCount > MAX_SQLITE_PARAMETERS_PER_STATEMENT) {
      throw new Error(
        `An update for ${table} requires ${updateParameterCount} parameters, exceeding the SQLite limit of ${MAX_SQLITE_PARAMETERS_PER_STATEMENT}.`,
      );
    }

    // Each row must match the positional schema defined by insertColumns.
    rows.forEach((row, index) => {
      if (row.length !== insertColumns.length) {
        throw new Error(
          `Row ${index} for ${table} has ${row.length} values, but ${insertColumns.length} insert columns were provided.`,
        );
      }
    });

    // Quote every dynamic identifier before adding it to a SQL statement.
    const quotedTable = quoteSQLiteIdentifier(table);
    const quotedIncoming = quoteSQLiteIdentifier("incoming");
    const quotedExisting = quoteSQLiteIdentifier("existing");
    const quotedInsertColumns = insertColumns.map(quoteSQLiteIdentifier);

    // Map column names to their positions so UPDATE and WHERE values can be
    // extracted from each row regardless of the insert column order.
    const columnIndexByName = new Map(
      insertColumns.map((column, index) => [column, index]),
    );
    const getRowValue = (row: readonly unknown[], column: string) =>
      row[columnIndexByName.get(column)!];

    // Combine every conflict column with AND to support composite unique keys.
    const conflictPredicate = conflictColumns
      .map(
        (column) =>
          `${quotedExisting}.${quoteSQLiteIdentifier(column)} = ${quotedIncoming}.${quoteSQLiteIdentifier(column)}`,
      )
      .join(" AND ");
    const rowPlaceholders = insertColumns.map(() => "?").join(", ");

    // Store one incoming row in a CTE so its bound values can be reused by the
    // SELECT and NOT EXISTS check without binding conflict values a second time.
    const conditionalInsertStatement = `
      WITH ${quotedIncoming} (${quotedInsertColumns.join(", ")}) AS (
        VALUES (${rowPlaceholders})
      )
      INSERT INTO ${quotedTable} (${quotedInsertColumns.join(", ")})
      SELECT ${quotedInsertColumns
        .map((column) => `${quotedIncoming}.${column}`)
        .join(", ")}
      FROM ${quotedIncoming}
      WHERE NOT EXISTS (
        SELECT 1
        FROM ${quotedTable} AS ${quotedExisting}
        WHERE ${conflictPredicate}
      );
    `;

    // When there are update columns, create an UPDATE that changes only those
    // columns and locates the existing row using all conflict columns.
    const updateStatement =
      updateColumns.length > 0 ?
        `UPDATE ${quotedTable}
         SET ${updateColumns
           .map((column) => `${quoteSQLiteIdentifier(column)} = ?`)
           .join(", ")}
         WHERE ${conflictColumns
           .map((column) => `${quoteSQLiteIdentifier(column)} = ?`)
           .join(" AND ")};`
      : null;

    // Preserve input order by producing an UPDATE followed by a conditional
    // INSERT for each row. All operations are later run in one transaction.
    return rows.flatMap((row) => {
      const operations: SQLiteDriverTransactionOperation[] = [];
      if (updateStatement) {
        operations.push({
          statement: updateStatement,
          values: [
            ...updateColumns.map((column) => getRowValue(row, column)),
            ...conflictColumns.map((column) => getRowValue(row, column)),
          ],
        });
      }

      // If UPDATE found no match, this statement inserts the row. If it found
      // one, NOT EXISTS prevents a duplicate insert.
      operations.push({
        statement: conditionalInsertStatement,
        values: [...row],
      });
      return operations;
    });
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
