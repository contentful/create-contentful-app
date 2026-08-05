import { z } from 'zod';

/**
 * Namespace character set for the RFC "storage" declaration's `namespace`
 * field. Accepts hyphens and underscores in addition to alphanumerics,
 * distinct from the Function-ID charset (`ID_REGEX` in `../utils`).
 */
export const NAMESPACE_REGEX = /^[A-Za-z0-9_-]+$/;

/**
 * Identifier character set for RFC table and column names: a leading
 * letter or underscore, followed by letters, digits, or underscores.
 * Deliberately separate from `NAMESPACE_REGEX` so it can preserve the
 * underscore used by the RFC's own `brand_guidelines` example.
 */
export const IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Prefix reserved by the platform; table and column names may not start
 * with it (case-insensitive), regardless of `IDENTIFIER_REGEX`.
 */
const RESERVED_NAME_PREFIX = '_cf_';

const storageColumnTypeSchema = z.enum(['text', 'integer', 'real', 'boolean', 'json']);

// The RFC does not define a column `default` field (custom SQL defaults are
// not expressible in the manifest), so `.strict()` rejects it along with any
// other unrecognised key.
const storageColumnSchema = z
  .object({
    name: z.string().regex(IDENTIFIER_REGEX, 'Invalid column name'),
    type: storageColumnTypeSchema,
    nullable: z.boolean(),
    index: z.boolean().optional(),
    primaryKey: z.boolean().optional(),
  })
  .strict();

const storageTableSchema = z
  .object({
    name: z.string().regex(IDENTIFIER_REGEX, 'Invalid table name'),
    columns: z.array(storageColumnSchema),
  })
  .strict();

const storageDeclarationSchema = z
  .object({
    version: z.literal(1),
    namespace: z.string().regex(NAMESPACE_REGEX, 'Invalid namespace'),
    functions: z.array(z.string()).min(1),
    tables: z.array(storageTableSchema).min(1),
  })
  .strict()
  .superRefine((storage, ctx) => {
    const seenFunctionIds = new Set<string>();
    storage.functions.forEach((functionId, functionIndex) => {
      if (seenFunctionIds.has(functionId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['functions', functionIndex],
          message: `Duplicate function id in storage.functions: '${functionId}'`,
        });
      }
      seenFunctionIds.add(functionId);
    });

    const seenTableNames = new Set<string>();
    storage.tables.forEach((table, tableIndex) => {
      const lowerCaseTableName = table.name.toLowerCase();

      if (seenTableNames.has(lowerCaseTableName)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tables', tableIndex, 'name'],
          message: `Duplicate table name (case-insensitive): '${table.name}'`,
        });
      }
      seenTableNames.add(lowerCaseTableName);

      if (lowerCaseTableName.startsWith(RESERVED_NAME_PREFIX)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tables', tableIndex, 'name'],
          message: `Table name uses the reserved '${RESERVED_NAME_PREFIX}' prefix: '${table.name}'`,
        });
      }

      const seenColumnNames = new Set<string>();
      let primaryKeyColumnCount = 0;

      table.columns.forEach((column, columnIndex) => {
        const lowerCaseColumnName = column.name.toLowerCase();

        if (seenColumnNames.has(lowerCaseColumnName)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['tables', tableIndex, 'columns', columnIndex, 'name'],
            message: `Duplicate column name (case-insensitive) in table '${table.name}': '${column.name}'`,
          });
        }
        seenColumnNames.add(lowerCaseColumnName);

        if (lowerCaseColumnName.startsWith(RESERVED_NAME_PREFIX)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['tables', tableIndex, 'columns', columnIndex, 'name'],
            message: `Column name uses the reserved '${RESERVED_NAME_PREFIX}' prefix: '${column.name}'`,
          });
        }

        if (column.primaryKey) {
          primaryKeyColumnCount += 1;

          if (column.type === 'json') {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['tables', tableIndex, 'columns', columnIndex, 'primaryKey'],
              message: `Column '${column.name}' cannot be a primary key because its type is 'json'`,
            });
          }
        }
      });

      if (primaryKeyColumnCount > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tables', tableIndex, 'columns'],
          message: `Table '${table.name}' declares more than one primary key column`,
        });
      }
    });
  });

export type StorageColumnDeclaration = z.infer<typeof storageColumnSchema>;
export type StorageTableDeclaration = z.infer<typeof storageTableSchema>;
export type StorageDeclaration = z.infer<typeof storageDeclarationSchema>;

export const parseStorageDeclaration = (storage: unknown): StorageDeclaration =>
  storageDeclarationSchema.parse(storage);

export const formatStorageValidationError = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    return JSON.stringify(error.issues);
  }

  return error instanceof Error ? error.message : String(error);
};
