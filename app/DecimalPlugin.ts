import { Decimal } from "decimal.js";
import type {
  KyselyPlugin,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
  QueryResult,
  RootOperationNode,
  UnknownRow,
} from "kysely";

function isPOJO(value: unknown) {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Kysely plugin that converts Decimal.js instances to strings before
 * they are sent to PostgreSQL. This prevents the pg driver from
 * JSON.stringify-ing the Decimal objects (which causes double-quoting).
 */
export class DecimalPlugin implements KyselyPlugin {
  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    return this.transformNode(args.node);
  }

  private transformNode<T>(node: T): T {
    if (node === null || node === undefined) {
      return node;
    }

    if (node instanceof Decimal) {
      return node.toString() as T;
    }

    if (Array.isArray(node)) {
      return node.map((item) => this.transformNode(item)) as T;
    }

    if (typeof node === "object" && isPOJO(node)) {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(node)) {
        result[key] = this.transformNode(value);
      }
      return result as T;
    }

    return node;
  }

  async transformResult(
    args: PluginTransformResultArgs,
  ): Promise<QueryResult<UnknownRow>> {
    return args.result;
  }
}
