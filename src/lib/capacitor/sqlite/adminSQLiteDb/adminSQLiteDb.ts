import a_v1_20260729212100_prepare_database from "@/lib/capacitor/sqlite/adminSQLiteDb/migrations/a_v1_20260729212100_prepare_database";
import a_v2_20260729220400_add_initial_tables from "@/lib/capacitor/sqlite/adminSQLiteDb/migrations/a_v2_20260729220400_add_initial_tables";
import { SQLite } from "@/lib/capacitor/sqlite/sqlite";

const adminSQLiteDb = new SQLite({
  name: "adminSQLiteDb",
  migrations: [
    a_v1_20260729212100_prepare_database,
    a_v2_20260729220400_add_initial_tables,
  ],
});

export default adminSQLiteDb;
