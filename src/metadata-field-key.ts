import type {
  Metadata,
  MetadataFieldInterface,
} from '@internetarchive/iaux-item-metadata';

/**
 * The names of `Metadata`'s fields, i.e. its members that are a
 * `MetadataField`. Excludes members like `identifier` and `rawMetadata`, which
 * are a plain string and a plain record.
 *
 * Derived from `Metadata` rather than listed here, so a field added there is
 * available without a matching change in this package.
 */
export type MetadataFieldKey = {
  [K in keyof Metadata]-?: NonNullable<
    Metadata[K]
  > extends MetadataFieldInterface<unknown>
    ? K
    : never;
}[keyof Metadata];
