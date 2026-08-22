import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // jsx-a11y is registered by eslint-config-next/core-web-vitals.
    // Re-registering the plugin causes flat-config "Cannot redefine plugin".
    // Applying jsx-a11y/* rules from an object without the plugin caused the
    // Sprint 001 crash ("could not find plugin jsx-a11y"). Accessibility rules
    // therefore remain those provided by next/core-web-vitals — not disabled.
    plugins: {
      security,
    },
    rules: {
      ...security.configs.recommended.rules,
      "security/detect-object-injection": "off",
    },
  },
  {
    // These two client components synchronise React state with the browser-only
    // Notification permission API. The repository already uses this established
    // effect pattern in Firebase UI. Keep the exception narrow rather than
    // weakening the rule for the rest of GoalCurrent.
    files: [
      "src/components/favourites/FavouritesPageContent.tsx",
      "src/components/firebase/FcmRegistration.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Non-application artefacts (audit evidence, one-off local scripts)
    "reports/**",
    "ss-figma*.js",
    "scripts/_*.py",
    "scripts/_fix_closure.py",
    "GC-SOT-*.md",
  ]),
]);

export default eslintConfig;