import { z } from 'zod';

/**
 * Identifier character set for RFC table, column, and namespace names: a
 * leading letter or underscore, followed by letters, digits, or underscores.
 * Confirmed against the downstream Functions API's `StorageDeclarationSchema`
 * (functions-api PR #2572), not invented locally.
 */
export const IDENTIFIER_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Prefix reserved by the platform; table and column names may not start
 * with it (case-insensitive), regardless of `IDENTIFIER_REGEX`.
 */
const RESERVED_NAME_PREFIX = '_cf_';

/**
 * Identifier length and per-declaration count caps, mirroring
 * `functions-api-client`'s `StorageDeclarationSchema` (PIC-1338) so a
 * locally-valid declaration isn't later rejected by the authoritative
 * server-side check.
 */
export const IDENTIFIER_MAX_LENGTH = 64;
export const TABLE_MAX_COLUMNS = 50;
export const TABLES_MAX_COUNT = 10;

const storageColumnTypeSchema = z.enum(['text', 'integer', 'real', 'boolean', 'json']);

// The RFC does not define a column `default` field (custom SQL defaults are
// not expressible in the manifest), so `.strict()` rejects it along with any
// other unrecognised key. `default` will need to be revisited when schema
// versioning/migrations land, since authoring migrations is explicitly out
// of scope for this ticket (PIC-1333).
const storageColumnSchema = z
  .object({
    name: z.string().regex(IDENTIFIER_REGEX, 'Invalid column name').max(IDENTIFIER_MAX_LENGTH),
    type: storageColumnTypeSchema,
    nullable: z.boolean(),
    index: z.boolean().optional(),
    primaryKey: z.boolean().optional(),
  })
  .strict();

const storageTableSchema = z
  .object({
    name: z.string().regex(IDENTIFIER_REGEX, 'Invalid table name').max(IDENTIFIER_MAX_LENGTH),
    columns: z
      .array(storageColumnSchema)
      .min(1, 'a table must declare at least one column')
      .max(TABLE_MAX_COLUMNS, 'a table may declare at most 50 columns'),
  })
  .strict();

const storageDeclarationSchema = z
  .object({
    version: z.literal(1),
    namespace: z
      .string()
      .regex(IDENTIFIER_REGEX, 'Invalid namespace')
      .max(IDENTIFIER_MAX_LENGTH)
      .optional(),
    functions: z.array(z.string()).min(1),
    tables: z
      .array(storageTableSchema)
      .min(1)
      .max(TABLES_MAX_COUNT, 'a storage declaration may declare at most 10 tables'),
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

/**
 * Shared cross-field check used by both the build-time Function manifest
 * validation and the upload-time bundle validation: every Function id
 * referenced in `storage.functions` must be present in `functionIds`. Throws
 * on the first unknown id; callers are responsible for their own error
 * wrapping/prefixing.
 */
export const assertStorageFunctionsKnown = (
  storage: StorageDeclaration | undefined,
  functionIds: Set<string>
): void => {
  for (const functionId of storage?.functions ?? []) {
    if (!functionIds.has(functionId)) {
      throw new Error(`Storage declaration references unknown function id: '${functionId}'.`);
    }
  }
};

export const formatStorageValidationError = (error: unknown): string => {
  if (error instanceof z.ZodError) {
    return JSON.stringify(error.issues);
  }

  return error instanceof Error ? error.message : String(error);
};
