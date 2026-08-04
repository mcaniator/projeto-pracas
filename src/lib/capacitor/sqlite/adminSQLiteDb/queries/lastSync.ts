import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { APIResponseInfo } from "@/lib/types/backendCalls/APIResponse";
import { z } from "zod";

const lastSyncSchema = z.array(
  z.object({
    timestamp: z.coerce.date(),
    cityId: z.coerce.number(),
    cityName: z.string(),
  }),
);

const fetchAdminSQLiteLastSync = async () => {
  try {
    const lastSyncValues = await adminSQLiteDb.query({
      statement:
        "SELECT timestamp, city_id as cityId, city_name as cityName FROM last_sync",
    });

    const lastSync = lastSyncSchema.parse(lastSyncValues.values)[0];

    return {
      responseInfo: {
        statusCode: 200,
      } as APIResponseInfo,
      data: {
        lastSync,
      },
    };
  } catch (e) {
    return {
      responseInfo: {
        statusCode: 500,
      } as APIResponseInfo,
      data: {
        lastSync: null,
      },
    };
  }
};

export { fetchAdminSQLiteLastSync };
