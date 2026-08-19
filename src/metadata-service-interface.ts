import type { Metadata } from '@internetarchive/iaux-item-metadata';
import type { MetadataFieldKey } from './metadata-field-key';
import type { Result } from '@internetarchive/result-type';
import type { MetadataServiceError } from './metadata-service-error';
import type { MetadataResponse } from './responses/metadata-response';

export interface MetadataServiceInterface {
  /**
   * Fetch metadata for a given identifier
   *
   * @param {string} identifier
   * @returns {Promise<Result<MetadataResponse, MetadataServiceError>>}
   */
  fetchMetadata(
    identifier: string,
  ): Promise<Result<MetadataResponse, MetadataServiceError>>;

  /**
   * Fetch the metadata value for a given identifier and keypath
   *
   * The response from this request can take any form, object, array, string, etc.
   * depending on the query. You can provide return typing in the response by
   * specifying the type. Note, there is no automatic type conversion since it can be anything.
   *
   * For example:
   *
   * ```ts
   * const collection = await searchService.fetchMetadataValue<string>('goody', 'metadata/collection/0');
   * console.debug('collection:', collection); => 'Goody Collection'
   *
   * const files_count = await searchService.fetchMetadataValue<number>('goody', 'files_count');
   * console.debug('files_count:', files_count); => 12
   * ```
   *
   * Keypath examples:
   *
   * /metadata/:identifier/metadata // returns the entire metadata object
   * /metadata/:identifier/server // returns the server for the given identifier
   * /metadata/:identifier/files_count
   * /metadata/:identifier/files?start=1&count=2 // query for files
   * /metadata/:identifier/metadata/collection // all collections
   * /metadata/:identifier/metadata/collection/0 // first collection
   * /metadata/:identifier/metadata/title
   * /metadata/:identifier/files/0/name // first file name
   *
   * @param identifier
   * @param keypath
   */
  fetchMetadataValue<T>(
    identifier: string,
    keypath: string,
  ): Promise<Result<T, MetadataServiceError>>;

  /**
   * Fetch a single item metadata field, modeled as its `MetadataField` type.
   *
   * Like {@link fetchMetadataValue}, but hands back a constructed field rather
   * than the raw value, so callers get its parsing and normalization instead of
   * reimplementing them.
   *
   * This matters most for fields the API sends inconsistently. `collection` is
   * an array on an item in several collections but a bare string on an item in
   * one, so reading `[0]` off the raw value is wrong half the time, while
   * `value` is the first entry either way.
   *
   * ```ts
   * const result = await metadataService.fetchMetadataField(
   *   'bra-bfr',
   *   'collection',
   * );
   * result.success?.value; // 'kodi_archive'
   * result.success?.values; // ['kodi_archive', 'community']
   * ```
   *
   * The field name is any field `Metadata` declares, and the returned type
   * follows from it, so a date comes back parsed:
   *
   * ```ts
   * const added = await metadataService.fetchMetadataField(
   *   'bra-bfr',
   *   'addeddate',
   * );
   * added.success?.value; // Date
   * ```
   *
   * A field `Metadata` doesn't declare isn't reachable here — add a typed
   * getter there rather than working around it, so every caller shares one
   * definition of a field's type. For anything that isn't an item metadata
   * field (`files_count`, `server`, `files/0/name`), use
   * {@link fetchMetadataValue}.
   *
   * A value the field's parser rejects leaves `value` undefined while
   * `rawValue` keeps the original, and an empty array leaves `value` undefined
   * too; `values.length` tells those apart.
   *
   * Errors match {@link fetchMetadataValue}. Note the API reports both an
   * unknown identifier and an unknown field as a payload `error`, which
   * surfaces as `searchEngineError` rather than `itemNotFound`.
   *
   * @param identifier
   * @param field Name of a field declared on `Metadata`
   */
  fetchMetadataField<K extends MetadataFieldKey>(
    identifier: string,
    field: K,
  ): Promise<Result<NonNullable<Metadata[K]>, MetadataServiceError>>;
}
