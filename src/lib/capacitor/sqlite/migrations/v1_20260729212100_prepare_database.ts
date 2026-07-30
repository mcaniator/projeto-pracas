//This is the only migration that does not use the SQLiteMigration class
import { SQLite } from "../sqlite";

const v1_20260729212100_prepare_database = async (db: SQLite) => {
  await db.executeTransaction([
    {
      statement: "PRAGMA user_version = 1;",
    },
    {
      statement:
        "CREATE TABLE migration_history (version INTEGER PRIMARY KEY, name TEXT, timestamp TEXT);",
    },
  ]);
};

export default v1_20260729212100_prepare_database;
