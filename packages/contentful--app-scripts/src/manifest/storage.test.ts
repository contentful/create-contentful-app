/* eslint-disable @typescript-eslint/no-var-requires */
import assert from 'assert';
import {
  assertStorageFunctionsKnown,
  formatStorageValidationError,
  parseStorageDeclaration,
} from './storage';

// RFC "App-manifest-contract" storage POC example (PIC-1333): one namespace,
// one Function, and the brand_guidelines table with topic/guidance columns.
// require() (not `import`) matches the JSON-fixture convention already used
// in build-functions.test.ts, avoiding this Node runtime's ESM JSON-import-
// attribute requirement for statically imported .json files.
const storagePoc = require('./__fixtures__/storage-poc.json');

describe('parseStorageDeclaration', () => {
  it('returns the RFC declaration without rewriting it', () => {
    assert.deepEqual(parseStorageDeclaration(storagePoc.storage), storagePoc.storage);
  });

  it('rejects a missing version', () => {
    const withoutVersion: Record<string, unknown> = { ...storagePoc.storage };
    delete withoutVersion.version;
    assert.throws(() => parseStorageDeclaration(withoutVersion));
  });

  it('rejects a non-1 version', () => {
    assert.throws(() => parseStorageDeclaration({ ...storagePoc.storage, version: 2 }));
  });

  it('rejects an invalid namespace', () => {
    assert.throws(() =>
      parseStorageDeclaration({ ...storagePoc.storage, namespace: 'content ops!' })
    );
  });

  it('parses a declaration with namespace omitted, without injecting one', () => {
    const withoutNamespace: Record<string, unknown> = { ...storagePoc.storage };
    delete withoutNamespace.namespace;
    const parsed = parseStorageDeclaration(withoutNamespace);
    assert.deepEqual(parsed, withoutNamespace);
    assert.ok(!('namespace' in parsed));
  });

  it('rejects an empty functions array', () => {
    assert.throws(() => parseStorageDeclaration({ ...storagePoc.storage, functions: [] }));
  });

  it('rejects duplicate entries in functions', () => {
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        functions: ['brandGuidelines', 'brandGuidelines'],
      })
    );
  });

  it('rejects an empty tables array', () => {
    assert.throws(() => parseStorageDeclaration({ ...storagePoc.storage, tables: [] }));
  });

  it('rejects a table with no columns', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [{ ...table, columns: [] }],
      })
    );
  });

  it('rejects an unsupported column type', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [
          {
            ...table,
            columns: [{ ...table.columns[0], type: 'blob' }, table.columns[1]],
          },
        ],
      })
    );
  });

  it('rejects duplicate table names (case-insensitive)', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [table, { ...table, name: 'Brand_Guidelines' }],
      })
    );
  });

  it('rejects duplicate column names within a table (case-insensitive)', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [
          {
            ...table,
            columns: [table.columns[0], { ...table.columns[1], name: 'Topic' }],
          },
        ],
      })
    );
  });

  it('rejects a reserved _cf_ table name', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [{ ...table, name: '_cf_internal' }],
      })
    );
  });

  it('rejects a reserved _cf_ column name', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [
          {
            ...table,
            columns: [table.columns[0], { ...table.columns[1], name: '_cf_meta' }],
          },
        ],
      })
    );
  });

  it('rejects two primaryKey columns in the same table', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [
          {
            ...table,
            columns: [table.columns[0], { ...table.columns[1], primaryKey: true }],
          },
        ],
      })
    );
  });

  it('rejects primaryKey: true on a json column', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [
          {
            ...table,
            columns: [
              { name: 'metadata', type: 'json', nullable: false, primaryKey: true },
            ],
          },
        ],
      })
    );
  });

  it('rejects an unrecognised key on the storage declaration', () => {
    assert.throws(() =>
      parseStorageDeclaration({ ...storagePoc.storage, unknown: 'nope' } as any)
    );
  });

  it('rejects an unrecognised key on a table', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [{ ...table, unknown: 'nope' }],
      })
    );
  });

  it('rejects an unrecognised key on a column', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [
          { ...table, columns: [{ ...table.columns[0], unknown: 'nope' }, table.columns[1]] },
        ],
      })
    );
  });

  it('rejects a column default field', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [
          {
            ...table,
            columns: [{ ...table.columns[0], default: 'draft' }, table.columns[1]],
          },
        ],
      })
    );
  });

  it('rejects a table name longer than 64 characters', () => {
    const [table] = storagePoc.storage.tables;
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [{ ...table, name: 'a'.repeat(65) }],
      })
    );
  });

  it('rejects a table with 51 columns', () => {
    const [table] = storagePoc.storage.tables;
    const columns = Array.from({ length: 51 }, (_, index) => ({
      name: `column_${index}`,
      type: 'text',
      nullable: true,
    }));
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables: [{ ...table, columns }],
      })
    );
  });

  it('rejects a declaration with 11 tables', () => {
    const [table] = storagePoc.storage.tables;
    const tables = Array.from({ length: 11 }, (_, index) => ({
      ...table,
      name: `table_${index}`,
    }));
    assert.throws(() =>
      parseStorageDeclaration({
        ...storagePoc.storage,
        tables,
      })
    );
  });
});

describe('assertStorageFunctionsKnown', () => {
  it('does not throw when every storage.functions id is known', () => {
    const storage = parseStorageDeclaration(storagePoc.storage);
    assert.doesNotThrow(() =>
      assertStorageFunctionsKnown(storage, new Set(['brandGuidelines']))
    );
  });

  it('does not throw when storage is undefined', () => {
    assert.doesNotThrow(() => assertStorageFunctionsKnown(undefined, new Set()));
  });

  it('throws with the unknown function id when storage.functions references one', () => {
    const storage = parseStorageDeclaration({
      ...storagePoc.storage,
      functions: ['missingFunction'],
    });
    assert.throws(
      () => assertStorageFunctionsKnown(storage, new Set(['brandGuidelines'])),
      /Storage declaration references unknown function id: 'missingFunction'\./
    );
  });
});

describe('formatStorageValidationError', () => {
  it('formats the Zod path for a malformed column', () => {
    try {
      parseStorageDeclaration({ ...storagePoc.storage, tables: [] });
      assert.fail('expected the declaration to be rejected');
    } catch (error) {
      assert.match(formatStorageValidationError(error), /tables/);
    }
  });

  it('returns a message for a non-Zod error', () => {
    assert.strictEqual(formatStorageValidationError(new Error('boom')), 'boom');
  });

  it('stringifies a non-Error value', () => {
    assert.strictEqual(formatStorageValidationError('boom'), 'boom');
  });
});
