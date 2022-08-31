/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
export enum MetadataServiceErrorType {
  networkError = 'MetadataService.NetworkError',
  itemNotFound = 'MetadataService.ItemNotFound',
  decodingError = 'MetadataService.DecodingError',
  searchEngineError = 'MetadataService.SearchEngineError',
}

export class MetadataServiceError extends Error {
  type: MetadataServiceErrorType;

  details?: any;

  constructor(type: MetadataServiceErrorType, message?: string, details?: any) {
    super(message);
    this.name = type;
    this.type = type;
    this.details = details;
  }
}
