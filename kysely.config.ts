import { defineConfig } from "kysely-ctl";

export default defineConfig({
  dialect: "pg",
  dialectConfig: {
    connectionString: process.env.DATABASE_URL,
  },
});
