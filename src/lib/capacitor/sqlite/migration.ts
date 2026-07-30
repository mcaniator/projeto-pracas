import { SQLiteDBConnection } from "@microbit/capacitor-sqlite-vanilla";

import { SQLite } from "./sqlite";

interface SQLiteMigrationI {
  db: SQLite;
  version: number;
  date: Date;
  name: string;
  transaction: Parameters<SQLiteDBConnection["executeTransaction"]>[0];
}

export { SQLiteMigration };

class SQLiteMigration {
  db: SQLite;
  version: number;
  date: Date;
  name: string;
  transaction: Parameters<SQLiteDBConnection["executeTransaction"]>[0];
  constructor({ db, version, date, name, transaction }: SQLiteMigrationI) {
    this.db = db;
    this.version = version;
    this.date = date;
    this.name = name;
    this.transaction = transaction;
  }

  public async execute() {
    const currentVersion = await this.db.getVersion();
    if (currentVersion >= this.version || this.version - currentVersion > 1) {
      throw new Error(
        `Tried to migrate ${this.db.getDbName()} version ${this.version}, but current version is ${currentVersion}`,
      );
    }
    await this.db.executeTransaction([
      ...this.transaction,
      {
        statement:
          "INSERT INTO migration_history (version, name, timestamp) VALUES (?, ?, ?);",
        values: [this.version, this.name, this.date.toISOString()],
      },
      {
        statement: "PRAGMA user_version = " + this.version + ";",
      },
    ]);
  }
}
