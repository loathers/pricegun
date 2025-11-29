import { defineConfig } from "kysely-ctl";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  dialect: "pg",
  dialectConfig: {
    pool: new Pool({ connectionString: process.env.DATABASE_URL }),
  },
});
