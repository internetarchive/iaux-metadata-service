import {
  Metadata,
  type MetadataFieldKey,
} from '@internetarchive/iaux-item-metadata';
import type { Result } from '@internetarchive/result-type';
import { DefaultMetadataBackend } from './backend/default-metadata-backend';
import { MetadataBackendInterface } from './backend/metadata-backend-interface';
import {
  MetadataServiceError,
  MetadataServiceErrorType,
} from './metadata-service-error';
import type { MetadataServiceInterface } from './metadata-service-interface';
import { MetadataResponse } from './responses/metadata-response';

/**
 * The Metadata Service is responsible for taking the raw response provided by
 * the backend and modeling it as a `MetadataResponse` object.
 */
export class MetadataService implements MetadataServiceInterface {
  public static default: MetadataServiceInterface = new MetadataService(
    new DefaultMetadataBackend(),
  );

  private backend: MetadataBackendInterface;

  constructor(backend: MetadataBackendInterface) {
    this.backend = backend;
  }

  /** @inheritdoc */
  async fetchMetadata(
    identifier: string,
  ): Promise<Result<MetadataResponse, MetadataServiceError>> {
    const rawResponse = await this.backend.fetchMetadata(identifier);
    if (rawResponse.error) {
      return rawResponse;
    }

    if (rawResponse.success?.metadata === undefined) {
      return {
        error: new MetadataServiceError(MetadataServiceErrorType.itemNotFound),
      };
    }

    const modeledResponse = new MetadataResponse(rawResponse.success);
    return { success: modeledResponse };
  }

  /** @inheritdoc */
  async fetchMetadataValue<T>(
    identifier: string,
    keypath: string,
  ): Promise<Result<T, MetadataServiceError>> {
    const result = await this.backend.fetchMetadata(identifier, keypath);
    if (result.error) {
      return result;
    }

    if (result.success?.result === undefined) {
      return {
        error: new MetadataServiceError(MetadataServiceErrorType.itemNotFound),
      };
    }

    return { success: result.success.result };
  }

  /** @inheritdoc */
  async fetchMetadataField<K extends MetadataFieldKey>(
    identifier: string,
    field: K,
  ): Promise<Result<NonNullable<Metadata[K]>, MetadataServiceError>> {
    const result = await this.fetchMetadataValue<unknown>(
      identifier,
      `metadata/${field}`,
    );
    if (result.error) {
      return { error: result.error };
    }

    // Required for narrowing. The backend maps a missing item or field to an
    // error rather than an absent result, so this is defensive.
    if (result.success === undefined) {
      return {
        error: new MetadataServiceError(MetadataServiceErrorType.itemNotFound),
      };
    }

    if (!MetadataService.isFieldValue(result.success)) {
      return {
        error: new MetadataServiceError(
          MetadataServiceErrorType.decodingError,
          `Value of '${field}' for '${identifier}' is not a scalar or array of scalars`,
          result.success,
        ),
      };
    }

    // Metadata's own getter supplies both the field class and its type, so the
    // mapping from field name to field class lives in one place.
    const modeled = new Metadata({ [field]: result.success })[field];
    if (!modeled) {
      return {
        error: new MetadataServiceError(
          MetadataServiceErrorType.decodingError,
          `Could not model '${field}' for '${identifier}'`,
          result.success,
        ),
      };
    }

    return { success: modeled as NonNullable<Metadata[K]> };
  }

  /**
   * Whether a raw value is something a `MetadataField` can parse.
   *
   * Without this an object-valued field would still construct, and
   * `String(value)` would quietly yield `'[object Object]'` inside an otherwise
   * successful result.
   */
  private static isFieldValue(value: unknown): boolean {
    const isScalar = (v: unknown): boolean =>
      typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
    if (Array.isArray(value)) return value.every(isScalar);
    return isScalar(value);
  }
}
