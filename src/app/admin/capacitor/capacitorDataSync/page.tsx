"use client";

import CAdminHeader from "@/components/ui/cAdminHeader";
import CButton from "@/components/ui/cButton";
import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { IconWifiOff } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const CapacitorDataSync = () => {
  const [sqliteMetaData, setSqliteMetaData] = useState<{
    version: number;
    lastSync: Date;
  }>();
  const loadSqliteMetaData = async () => {
    const lastSync = await adminSQLiteDb.query("SELECT * FROM last_sync");
    const migrationHistory = await adminSQLiteDb.query(
      "SELECT * FROM migration_history",
    );
    console.log("last_sync", lastSync);
    console.log("migration_history", migrationHistory);
  };

  useEffect(() => {
    void loadSqliteMetaData();
  }, []);

  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-2 text-black">
      <CAdminHeader titleIcon={<IconWifiOff />} title="Uso offline" />
      <div className="flex h-full overflow-auto">
        <p className="text-lg">
          Prepare o aplicativo para realizar avaliações offline
        </p>
        <CButton
          onClick={() => {
            void loadSqliteMetaData();
          }}
        >
          Reload
        </CButton>
      </div>
    </div>
  );
};

export default CapacitorDataSync;
