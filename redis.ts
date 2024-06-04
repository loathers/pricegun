import { createClient } from "redis";

export const redis = await createClient().connect();
