export { MetadataResponse } from './src/responses/metadata-response';
export type {
  AlternateLocation,
  AlternateLocations,
} from './src/responses/metadata-response';

export {
  File,
  Review,
  SpeechMusicASREntry,
} from '@internetarchive/iaux-item-metadata';

export { DefaultMetadataBackend } from './src/backend/default-metadata-backend';
export { MetadataService } from './src/metadata-service';
export {
  MetadataServiceError,
  MetadataServiceErrorType,
} from './src/metadata-service-error';
export {
  MetadataServiceInterface,
  MetadataWriteResult,
} from './src/metadata-service-interface';
export { buildMetadataFieldPatch } from './src/metadata-patch';
export type {
  MetadataFieldValue,
  MetadataPatchOperation,
} from './src/metadata-patch';
