import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/components/common/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*"],
              message:
                "Shared components must stay domain-agnostic. Move this logic to a feature or pass data via props.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/admin/**/*.{ts,tsx,js,jsx}"],
    ignores: [
      "src/features/admin/dashboard/components/legacy-pages/**",
      "src/features/admin/dashboard/components/property-submissions/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/agent/*"],
              message:
                "Admin feature must not import from agent internals. Extract shared code to components/common, lib, or a dedicated shared feature module.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/agent/**/*.{ts,tsx,js,jsx}"],
    ignores: [
      "src/features/agent/dashboard/api/adminPropertySubmissions.api.ts",
      "src/features/agent/dashboard/components/add-property/AddPropertyWizard.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/admin/*"],
              message:
                "Agent feature must not import from admin internals. Extract shared code to components/common, lib, or a dedicated shared feature module.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
