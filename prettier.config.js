module.exports = {
  printWidth: 150,
  trailingComma: "all",
  semi: true,
  importOrder: ["^@core/(.*)$", "^@server/(.*)$", "^@ui/(.*)$", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  singleAttributePerLine: false,
  tabWidth: 2,
  useTabs: false,
  tailwindFunctions: ["cva", "clsx", "cn"],
  tailwindConfig: "./apps/www/tailwind.config.ts",
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
};
