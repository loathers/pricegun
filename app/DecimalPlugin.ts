import { Decimal } from "decimal.js";
import type {
  KyselyPlugin,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
  QueryResult,
  RootOperationNode,
  UnknownRow,
} from "kysely";
import { walkObject } from "./utils";

/**
 * Kysely plugin that converts Decimal.js instances to strings before
 * they are sent to PostgreSQL. This prevents the pg driver from
 * JSON.stringify-ing the Decimal objects (which causes double-quoting).
 */
export class DecimalPlugin implements KyselyPlugin {
  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    return walkObject(args.node, (value) => {
      if (value instanceof Decimal) {
        return { value: value.toString(), stop: true };
      }
      return { value, stop: false };
    });
  }

  async transformResult(
    args: PluginTransformResultArgs,
  ): Promise<QueryResult<UnknownRow>> {
    return args.result;
  }
}
