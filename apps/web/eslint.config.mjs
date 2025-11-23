import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    rules: {
      // React specific rules
      "react/react-in-jsx-scope": "off", // Not needed for Next.js 13+
      "react/prop-types": "off", // Use TypeScript instead
      "react/jsx-uses-react": "off",
      "react/jsx-no-leaked-render": ["error", { validStrategies: ["coerce", "ternary"] }],

      // React Hooks specific rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // General code quality rules
      "no-console": ["warn", { allow: ["warn", "error"] }], // Warn for console.log, allow warn/error
      "no-debugger": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "prefer-const": "error",
    },
  },
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
  }
];
