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
 *
 * Internal on purpose. It's a fact about `Metadata`, so it belongs alongside
 * `Metadata` in iaux-item-metadata; keeping it unexported here means moving it
 * there later isn't a breaking change. Callers don't need the name to call
 * `fetchMetadataField` with a field-name literal.
 */
export type MetadataFieldKey = {
  [K in keyof Metadata]-?: NonNullable<
    Metadata[K]
  > extends MetadataFieldInterface<unknown>
    ? K
    : never;
}[keyof Metadata];
