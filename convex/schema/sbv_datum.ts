import { defineTable } from "convex/server";
import { v } from "convex/values";

export const sbv_datum = defineTable({
  instance_id: v.string(),
  patch: v.string(),
  repo: v.string(),
  base_commit: v.string(),
  hints_text: v.string(),
  created_at: v.string(),
  test_patch: v.string(),
  problem_statement: v.string(),
  version: v.string(),
  environment_setup_commit: v.string(),
  FAIL_TO_PASS: v.string(),
  PASS_TO_PASS: v.string(),
}).index('by_instance_id', ['instance_id']);