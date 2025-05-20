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
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      // ✅ No errores por variables no usadas (solo advertencias)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      // ✅ Desactiva advertencia por comillas no escapadas (si usas textos con comillas)
      "react/no-unescaped-entities": "off",

      // ✅ (opcional) desactiva advertencia de usar <img>
      // "next/no-img-element": "off",
    },
  }),
];

export default eslintConfig;
