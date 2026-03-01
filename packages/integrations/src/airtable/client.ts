import Airtable from "airtable";
import type { FieldSet } from "airtable";

export interface AirtableConfig {
  apiKey: string;
  baseId: string;
}

/**
 * Thin wrapper around the Airtable SDK providing typed CRUD operations.
 */
export class AirtableClient {
  private base: Airtable.Base;

  constructor(config: AirtableConfig) {
    const airtable = new Airtable({ apiKey: config.apiKey });
    this.base = airtable.base(config.baseId);
  }

  /** Create a record in a table. Returns the created record ID. */
  async create(
    tableName: string,
    fields: Record<string, unknown>,
  ): Promise<string> {
    const record = await this.base(tableName).create(
      fields as Partial<FieldSet>,
    );
    return record.getId();
  }

  /** Update a record by its Airtable record ID. */
  async update(
    tableName: string,
    recordId: string,
    fields: Record<string, unknown>,
  ): Promise<void> {
    await this.base(tableName).update(
      recordId,
      fields as Partial<FieldSet>,
    );
  }

  /** Find records matching a formula. Returns raw Airtable records. */
  async find(
    tableName: string,
    formula: string,
    maxRecords = 100,
  ): Promise<Array<{ id: string; fields: Record<string, unknown> }>> {
    const records = await this.base(tableName)
      .select({ filterByFormula: formula, maxRecords })
      .all();

    return records.map((r) => ({
      id: r.getId(),
      fields: r.fields as Record<string, unknown>,
    }));
  }

  /** Get a single record by ID. */
  async get(
    tableName: string,
    recordId: string,
  ): Promise<{ id: string; fields: Record<string, unknown> }> {
    const record = await this.base(tableName).find(recordId);
    return {
      id: record.getId(),
      fields: record.fields as Record<string, unknown>,
    };
  }
}
