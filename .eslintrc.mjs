import { libraryConfig } from "@repo/eslint-config/library";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["apps/**", "packages/**", "dist/**", "node_modules/**"],
  },
  ...libraryConfig,
  {
    parser: tsParser,
    parserOptions: {
      project: true,
    },
  },
  {
    rules: {
      // Re-enable for stricter type checking
      "@typescript-eslint/no-explicit-any": "warn", // Change to 'error' if you want to enforce it strictly
      "@typescript-eslint/unbound-method": "warn", // Change to 'error' if you want to enforce it strictly
    },
  },
];
