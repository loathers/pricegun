import { describe, it, expect, vi } from "vitest";
import { loader } from "./api.sales.$itemid";
import * as db from "~/db.server.js";

vi.mock("~/db.server.js");

describe("Sales API", () => {
  it("should return sales data for a valid date range", async () => {
    const mockSalesData = [{ date: new Date(), unitPrice: 100, quantity: 5 }];
    vi.spyOn(db, "getSalesByDateRange").mockResolvedValue(mockSalesData);

    const request = new Request(
      "http://localhost/api/sales/123?start=2025-01-01&end=2025-12-10T23:20:07.000Z&limit=11",
    );
    const params = { itemid: "123" };

    const response = await loader({
      params,
      request,
      context: {},
      unstable_pattern: "",
    });

    expect(response.init?.status).toBe(200);
    expect(response.data).toBe(mockSalesData);
    expect(db.getSalesByDateRange).toHaveBeenCalledWith(
      123,
      new Date("2025-01-01"),
      new Date("2025-12-10T23:20:07.000Z"),
      11,
    );
  });

  it("should use default limit if missing", async () => {
    const mockSalesData = [{ date: new Date(), unitPrice: 100, quantity: 5 }];
    vi.spyOn(db, "getSalesByDateRange").mockResolvedValue(mockSalesData);

    const request = new Request(
      "http://localhost/api/sales/123?start=2025-01-01&end=2025-12-10T23:20:07.000Z",
    );
    const params = { itemid: "123" };

    const response = await loader({
      params,
      request,
      context: {},
      unstable_pattern: "",
    });

    expect(response.init?.status).toBe(200);
    expect(response.data).toBe(mockSalesData);
    expect(db.getSalesByDateRange).toHaveBeenCalledWith(
      123,
      new Date("2025-01-01"),
      new Date("2025-12-10T23:20:07.000Z"),
      20,
    );
  });

  it.each(["start=2025-01-31", "end=2025-01-31"])(
    "should return 400 if start/end date missing (%s)",
    async (args) => {
      const request = new Request(`http://localhost/api/sales/123?${args}`);
      const params = { itemid: "123" };

      const response = await loader({
        request,
        params,
        context: {},
        unstable_pattern: "",
      });

      expect(response.init?.status).toBe(400);
      expect(response.data).toEqual({
        error: "Missing 'start' or 'end' date",
      });
    },
  );

  it("should return 400 if end is before start", async () => {
    const request = new Request(
      "http://localhost/api/sales/123?start=2025-12-10T23:20:07.000Z&end=2024-01-31",
    );
    const params = { itemid: "123" };

    const response = await loader({
      request,
      params,
      context: {},
      unstable_pattern: "",
    });

    expect(response.init?.status).toBe(400);
    expect(response.data).toEqual({
      error: "'start' date must be before 'end' date",
    });
  });

  it("should return 400 if date is invalid", async () => {
    const request = new Request(
      "http://localhost/api/sales/123?start=2025-12-10T23:20:07.000Z&end=times_are_coming",
    );
    const params = { itemid: "123" };

    const response = await loader({
      request,
      params,
      context: {},
      unstable_pattern: "",
    });

    expect(response.init?.status).toBe(400);
    expect(response.data).toEqual({
      error: "Invalid date format for 'start' or 'end'",
    });
  });

  it.each(["everything", "9999", "-1", "0"])(
    "should return 400 with invalid limit (%s)",
    async (limit: string) => {
      const request = new Request(
        `http://localhost/api/sales/123?start=2025-12-10T23:20:07.000Z&end=2025-12-31&limit=${limit}`,
      );
      const params = { itemid: "123" };

      const response = await loader({
        request,
        params,
        context: {},
        unstable_pattern: "",
      });

      expect(response.init?.status).toBe(400);
      expect(response.data).toEqual({
        error: "Limit must be between 1 & 100",
      });
    },
  );
});
