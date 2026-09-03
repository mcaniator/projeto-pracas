import { SQLiteDBConnection } from "@microbit/capacitor-sqlite-vanilla";

interface SQLiteMigrationI {
  version: number;
  date: Date;
  name: string;
  transaction: Parameters<SQLiteDBConnection["executeTransaction"]>[0];
}

export { SQLiteMigration };

class SQLiteMigration {
  version: number;
  date: Date;
  name: string;
  transaction: Parameters<SQLiteDBConnection["executeTransaction"]>[0];
  constructor({ version, date, name, transaction }: SQLiteMigrationI) {
    this.version = version;
    this.date = date;
    this.name = name;
    this.transaction = transaction;
  }

  public async execute({
    dbName,
    db,
  }: {
    dbName: string;
    db: SQLiteDBConnection;
  }) {
    const currentVersion = await db.getVersion();
    if (currentVersion >= this.version || this.version - currentVersion > 1) {
      throw new Error(
        `Tried to migrate ${dbName} to version ${this.version}, but current version is ${currentVersion}`,
      );
    }
    await db.executeTransaction([
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
