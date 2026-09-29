import { expect } from '@open-wc/testing';
import { MetadataServiceError, MetadataServiceErrorType } from '../index';

describe('package exports', () => {
  it('exports the error types so callers can tell errors apart', () => {
    const error = new MetadataServiceError(
      MetadataServiceErrorType.searchEngineError,
    );
    expect(error.type).to.equal('MetadataService.SearchEngineError');
  });
});
