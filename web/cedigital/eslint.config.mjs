import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    root: true,
    extends: [
      "next",
      "next/core-web-vitals",
      "plugin:@typescript-eslint/recommended",
    ],
    plugins: ["@typescript-eslint"],
    rules: {
      // Desactivar warnings de variables no usadas
      "@typescript-eslint/no-unused-vars": "off",

      // Permitir any
      "@typescript-eslint/no-explicit-any": "off",

      // Desactivar warnings de img vs Image
      "@next/next/no-img-element": "off",

      // Hacer los hooks más flexibles
      "react-hooks/exhaustive-deps": "off",

      // Permitir nombres de variables sin _
      "@typescript-eslint/naming-convention": "off",

      // Permitir comillas sin escape
      "react/no-unescaped-entities": "off",

      // Desactivar reglas de dependencias de hooks
      "react/hook-use-state": "off",
      "react/jsx-key": "off",
      "react-hooks/rules-of-hooks": "off",
    },
    overrides: [
      {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
          "@typescript-eslint/no-explicit-any": "off",
        },
      },
    ],
    ignorePatterns: ["node_modules/", ".next/", "out/"],
  }),
];

export default eslintConfig;
