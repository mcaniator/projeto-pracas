import { SQLiteMigration } from "../../SQLiteMigration";

const a_v2_20260729220400_add_initial_tables = new SQLiteMigration({
  version: 2,
  date: new Date("2026-07-29T21:04:00.000Z"),
  name: "add_initial_tables",
  transaction: [
    {
      statement:
        "CREATE TABLE last_sync (timestamp TEXT PRIMARY KEY, city_id INTEGER, city_name TEXT);",
    },
    {
      //This table is used for the current logged in user access the admin panel while offline
      statement: `CREATE TABLE "current_user" (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          image TEXT,
          username TEXT NOT NULL UNIQUE,
          roles TEXT NOT NULL DEFAULT '[]',
          active INTEGER NOT NULL CHECK (active IN (0, 1))
          );`,
    },
    {
      statement: `CREATE TABLE "user" (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT NOT NULL UNIQUE,
          emailVerified TEXT,
          image TEXT,
          username TEXT NOT NULL UNIQUE,
          roles TEXT NOT NULL DEFAULT '[]',
          active INTEGER NOT NULL CHECK (active IN (0, 1)),
          created_at TEXT NOT NULL,
           updated_at TEXT NOT NULL
          );`,
    },
    {
      statement: `CREATE TABLE city (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        state TEXT NOT NULL,
        narrow_administrative_unit_title TEXT,
        intermediate_administrative_unit_title TEXT,
        broad_administrative_unit_title TEXT,
        created_at TEXT,
        updated_at TEXT,
        UNIQUE (name, state)
      )`,
    },
    {
      statement: `CREATE TABLE narrow_administrative_unit(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        city_id INTEGER NOT NULL REFERENCES city(id),
        UNIQUE (name, city_id)
        )`,
    },
    {
      statement: `CREATE TABLE intermediate_administrative_unit(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        city_id INTEGER NOT NULL REFERENCES city(id),
        UNIQUE (name, city_id)
        )`,
    },
    {
      statement: `CREATE TABLE broad_administrative_unit(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        city_id INTEGER NOT NULL REFERENCES city(id),
        UNIQUE (name, city_id)
        )`,
    },
    {
      statement: `CREATE TABLE location_category (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        UNIQUE (name)
      )`,
    },
    {
      statement: `CREATE TABLE location_type (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        UNIQUE (name)
      )`,
    },
    {
      statement: `CREATE TABLE location (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        popular_name TEXT,
        first_street TEXT NOT NULL,
        second_street TEXT,
        third_street TEXT,
        fourth_street TEXT,
        notes TEXT,
        city_id INTEGER NOT NULL REFERENCES city(id),
        creation_year INTEGER,
        last_maintenance_year INTEGER,
        legislation TEXT,
        usable_area REAL,
        legal_area REAL,
        incline REAL,
        is_park INTEGER NOT NULL CHECK (is_park IN (0, 1)),
        inactive_not_found INTEGER NOT NULL CHECK (inactive_not_found IN (0, 1)),
        polygon_area REAL,
        type_id INTEGER REFERENCES location_type(id),
        category_id INTEGER REFERENCES location_category(id),
        polygon TEXT,
        is_public INTEGER NOT NULL CHECK (is_public IN (0, 1)),
        main_image_id INTEGER,
        narrow_administrative_unit_id INTEGER REFERENCES narrow_administrative_unit(id),
        intermediate_administrative_unit_id INTEGER REFERENCES intermediate_administrative_unit(id),
        broad_administrative_unit_id INTEGER REFERENCES broad_administrative_unit(id),
        created_at TEXT,
        updated_at TEXT
      )`,
    },
    {
      statement: `CREATE INDEX idx_location_city ON location (city_id);`,
    },
    {
      statement: `CREATE TABLE "assessment" (
        id INTEGER PRIMARY KEY,
        start_date TEXT NOT NULL,
        end_date TEXT,
        is_finalized INTEGER NOT NULL CHECK (is_finalized IN (0, 1)),
        id_public INTEGER NOT NULL CHECK (id_public IN (0, 1)),
        drive_folder_url TEXT,
        user_id TEXT NOT NULL REFERENCES "user"(id),
        location_id INTEGER NOT NULL REFERENCES location(id),
        form_id INTEGER NOT NULL REFERENCES form(id),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    },
  ],
});

export default a_v2_20260729220400_add_initial_tables;
