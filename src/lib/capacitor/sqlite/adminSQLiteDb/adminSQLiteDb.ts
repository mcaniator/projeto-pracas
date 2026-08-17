import a_v2_20260729220400_add_initial_tables from "@/lib/capacitor/sqlite/adminSQLiteDb/migrations/a_v2_20260729220400_add_initial_tables";
import {
  SQLite,
  SQLiteBulkInsertOperation,
  SQLiteTransactionOperation,
} from "@/lib/capacitor/sqlite/sqlite";
import { FetchSQLiteSyncDataResponse } from "@/lib/serverFunctions/queries/sqliteSync";

const adminSQLiteDbClearTransaction: SQLiteTransactionOperation[] = [
  {
    statement: `DELETE FROM "last_sync";`,
  },
  {
    statement: `DELETE FROM "response_option";`,
  },
  {
    statement: `DELETE FROM "response_geometry";`,
  },
  {
    statement: `DELETE FROM "response";`,
  },
  {
    statement: `DELETE FROM "assessment";`,
  },
  {
    statement: `DELETE FROM "calculation";`,
  },
  {
    statement: `DELETE FROM "form_item";`,
  },
  {
    statement: `DELETE FROM "option";`,
  },
  {
    statement: `DELETE FROM "question";`,
  },
  {
    statement: `DELETE FROM "subcategory";`,
  },
  {
    statement: `DELETE FROM "category";`,
  },
  {
    statement: `DELETE FROM "form";`,
  },
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

const adminSQLiteDbDataSync = async ({
  data,
  selectedCity,
}: {
  data: FetchSQLiteSyncDataResponse;
  selectedCity: { id: number; name: string };
}) => {
  await adminSQLiteDb.clear();
  const {
    currentUser,
    city,
    narrowAdministrativeUnits,
    intermediateAdministrativeUnits,
    broadAdministrativeUnits,
    locationCategory,
    locationType,
    locations,
    forms,
    calculations,
    formItems,
    categories,
    subcategories,
    questions,
    options,
  } = data;
  const bulkInserts: SQLiteBulkInsertOperation[] = [
    {
      table: "last_sync",
      columns: ["timestamp", "city_id", "city_name"],
      rows: [[new Date(), selectedCity.id, selectedCity.name]],
    },
    {
      table: "user",
      columns: [
        "id",
        "name",
        "email",
        "emailVerified",
        "image",
        "username",
        "roles",
        "active",
        "created_at",
        "updated_at",
      ],
      rows: [
        [
          currentUser.id,
          currentUser.name,
          currentUser.email,
          currentUser.emailVerified,
          currentUser.image,
          currentUser.username,
          JSON.stringify(currentUser.roles),
          currentUser.active,
          currentUser.createdAt,
          currentUser.updatedAt,
        ],
      ],
    },
    {
      table: "city",
      columns: [
        "id",
        "name",
        "state",
        "narrow_administrative_unit_title",
        "intermediate_administrative_unit_title",
        "broad_administrative_unit_title",
        "created_at",
        "updated_at",
      ],
      rows: [
        [
          city.id,
          city.name,
          city.state,
          city.narrowAdministrativeUnitTitle,
          city.intermediateAdministrativeUnitTitle,
          city.broadAdministrativeUnitTitle,
          city.createdAt,
          city.updatedAt,
        ],
      ],
    },
    {
      table: "location_category",
      columns: ["id", "name"],
      rows: locationCategory.map((item) => [item.id, item.name]),
    },
    {
      table: "location_type",
      columns: ["id", "name"],
      rows: locationType.map((item) => [item.id, item.name]),
    },
    {
      table: "narrow_administrative_unit",
      columns: ["id", "name", "city_id"],
      rows: narrowAdministrativeUnits.map((item) => [
        item.id,
        item.name,
        item.cityId,
      ]),
    },
    {
      table: "intermediate_administrative_unit",
      columns: ["id", "name", "city_id"],
      rows: intermediateAdministrativeUnits.map((item) => [
        item.id,
        item.name,
        item.cityId,
      ]),
    },
    {
      table: "broad_administrative_unit",
      columns: ["id", "name", "city_id"],
      rows: broadAdministrativeUnits.map((item) => [
        item.id,
        item.name,
        item.cityId,
      ]),
    },
    {
      table: "location",
      columns: [
        "id",
        "name",
        "popular_name",
        "first_street",
        "second_street",
        "third_street",
        "fourth_street",
        "notes",
        "city_id",
        "creation_year",
        "last_maintenance_year",
        "legislation",
        "usable_area",
        "legal_area",
        "incline",
        "is_park",
        "inactive_not_found",
        "polygon_area",
        "type_id",
        "category_id",
        "polygon",
        "is_public",
        "main_image_id",
        "narrow_administrative_unit_id",
        "intermediate_administrative_unit_id",
        "broad_administrative_unit_id",
        "created_at",
        "updated_at",
      ],
      rows: locations.map((item) => [
        item.id,
        item.name,
        item.popularName,
        item.firstStreet,
        item.secondStreet,
        item.thirdStreet,
        item.fourthStreet,
        item.notes,
        item.cityId,
        item.creationYear,
        item.lastMaintenanceYear,
        item.legislation,
        item.usableArea,
        item.legalArea,
        item.incline,
        item.isPark,
        item.inactiveNotFound,
        item.polygonArea,
        item.typeId,
        item.categoryId,
        item.polygon,
        item.isPublic,
        item.mainImageId,
        item.narrowAdministrativeUnitId,
        item.intermediateAdministrativeUnitId,
        item.broadAdministrativeUnitId,
        item.createdAt,
        item.updatedAt,
      ]),
    },
    {
      table: "category",
      columns: [
        "id",
        "name",
        "optional",
        "active",
        "notes",
        "created_at",
        "updated_at",
      ],
      rows: categories.map((item) => [
        item.id,
        item.name,
        item.optional,
        item.active,
        item.notes,
        item.createdAt,
        item.updatedAt,
      ]),
    },
    {
      table: "subcategory",
      columns: ["id", "name", "optional", "active", "notes", "category_id"],
      rows: subcategories.map((item) => [
        item.id,
        item.name,
        item.optional,
        item.active,
        item.notes,
        item.categoryId,
      ]),
    },
    {
      table: "question",
      columns: [
        "id",
        "name",
        "icon_key",
        "notes",
        "is_public",
        "allow_response_images",
        "min_value",
        "max_value",
        "question_type",
        "character_type",
        "option_type",
        "geometry_types",
        "category_id",
        "subcategory_id",
        "created_at",
        "updated_at",
      ],
      rows: questions.map((item) => [
        item.id,
        item.name,
        item.iconKey,
        item.notes,
        item.isPublic,
        item.allowResponseImages,
        item.minValue,
        item.maxValue,
        item.questionType,
        item.characterType,
        item.optionType,
        JSON.stringify(item.geometryTypes),
        item.categoryId,
        item.subcategoryId,
        item.createdAt,
        item.updatedAt,
      ]),
    },
    {
      table: "option",
      columns: [
        "id",
        "text",
        "question_id",
        "is_overridable",
        "created_at",
        "updated_at",
      ],
      rows: options.map((item) => [
        item.id,
        item.text,
        item.questionId,
        item.isOverridable,
        item.createdAt,
        item.updatedAt,
      ]),
    },
    {
      table: "form",
      columns: [
        "id",
        "name",
        "archived",
        "finalized",
        "created_at",
        "updated_at",
      ],
      rows: forms.map((item) => [
        item.id,
        item.name,
        item.archived,
        item.finalized,
        item.createdAt,
        item.updatedAt,
      ]),
    },
    {
      table: "form_item",
      columns: [
        "id",
        "form_id",
        "position",
        "category_id",
        "subcategory_id",
        "question_id",
      ],
      rows: formItems.map((item) => [
        item.id,
        item.formId,
        item.position,
        item.categoryId,
        item.subcategoryId,
        item.questionId,
      ]),
    },
    {
      table: "calculation",
      columns: ["id", "expression", "form_id", "target_question_id"],
      rows: calculations.map((item) => [
        item.id,
        item.expression,
        item.formId,
        item.targetQuestionId,
      ]),
    },
  ];

  await adminSQLiteDb.executeBulkInsertTransaction(bulkInserts);
};

export default adminSQLiteDb;
export { adminSQLiteDbDataSync };
