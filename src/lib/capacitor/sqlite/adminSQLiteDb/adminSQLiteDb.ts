import a_v2_20260729220400_add_initial_tables from "@/lib/capacitor/sqlite/adminSQLiteDb/migrations/a_v2_20260729220400_add_initial_tables";
import {
  SQLite,
  SQLiteTransactionOperation,
} from "@/lib/capacitor/sqlite/sqlite";

const adminSQLiteDbClearTransaction: SQLiteTransactionOperation[] = [
  {
    statement: `DELETE FROM "location";`,
  },
  {
    statement: `DELETE FROM "narrow_administrative_unit";`,
  },
  {
    statement: `DELETE FROM "intermediate_administrative_unit";`,
  },
  {
    statement: `DELETE FROM "broad_administrative_unit";`,
  },
  {
    statement: `DELETE FROM "location_category";`,
  },
  {
    statement: `DELETE FROM "location_type";`,
  },
  {
    statement: `DELETE FROM "city";`,
  },
  {
    statement: `DELETE FROM "user";`,
  },
];

const adminSQLiteDb = new SQLite({
  name: "adminSQLiteDb",
  migrations: [a_v2_20260729220400_add_initial_tables],
  clearTransaction: adminSQLiteDbClearTransaction,
});

export default adminSQLiteDb;
