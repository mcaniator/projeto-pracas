//This is the only migration that does not use the SQLiteMigration class
import { SQLiteMigration } from "@/lib/capacitor/sqlite/SQLiteMigration";

const a_v1_20260729212100_prepare_database = new SQLiteMigration({
  version: 1,
  date: new Date("2026-07-29T21:21:00.000Z"),
  name: "add_initial_tables",
  transaction: [
    {
      statement:
        "CREATE TABLE migration_history (version INTEGER PRIMARY KEY, name TEXT, timestamp TEXT);",
    },
  ],
});

export default a_v1_20260729212100_prepare_database;
