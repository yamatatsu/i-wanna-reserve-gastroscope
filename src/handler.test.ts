import { test, expect } from "vitest";
import { getStatusText } from "./handler";

test("", async () => {
  await expect(getStatusText()).resolves.toEqual("");
});
