export enum MetadataServiceErrorType {
  networkError = 'MetadataService.NetworkError',
  itemNotFound = 'MetadataService.ItemNotFound',
  decodingError = 'MetadataService.DecodingError',
  searchEngineError = 'MetadataService.SearchEngineError',
}

export class MetadataServiceError extends Error {
  type: MetadataServiceErrorType;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  details?: any;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  constructor(type: MetadataServiceErrorType, message?: string, details?: any) {
    super(message);
    this.name = type;
    this.type = type;
    this.details = details;
  }
}
