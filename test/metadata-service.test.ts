/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from '@open-wc/testing';

import { Result } from '@internetarchive/result-type';
import { MetadataBackendInterface } from '../src/backend/metadata-backend-interface';
import { MetadataService } from '../src/metadata-service';
import {
  MetadataServiceError,
  MetadataServiceErrorType,
} from '../src/metadata-service-error';
import { MetadataResponse } from '../src/responses/metadata-response';
import { MockResponseGenerator } from './mock-response-generator';

describe('MetadataService', () => {
  it('can request metadata when requested', async () => {
    class MockMetadataBackend implements MetadataBackendInterface {
      async fetchMetadata(
        identifier: string,
      ): Promise<Result<MetadataResponse, MetadataServiceError>> {
        const responseGenerator = new MockResponseGenerator();
        const mockResponse =
          responseGenerator.generateMockMetadataResponse(identifier);
        return { success: mockResponse };
      }
    }

    const backend = new MockMetadataBackend();
    const service = new MetadataService(backend);
    const result = await service.fetchMetadata('foo');
    expect(result.success?.metadata.identifier).to.equal('foo');
  });

  describe('requestMetadataValue', async () => {
    class MockMetadataBackend implements MetadataBackendInterface {
      response: any;
      async fetchMetadata(
        identifier: string,
        keypath?: string,
      ): Promise<Result<any, MetadataServiceError>> {
        return {
          success: {
            result: this.response,
          },
        };
      }
    }

    it('can request a metadata value', async () => {
      const backend = new MockMetadataBackend();
      const service = new MetadataService(backend);

      let expectedResult: any = 'foo';
      backend.response = expectedResult;

      let result = await service.fetchMetadataValue<typeof expectedResult>(
        'foo',
        'metadata',
      );
      expect(result.success).to.equal(expectedResult);

      expectedResult = { foo: 'bar' };
      backend.response = expectedResult;

      result = await service.fetchMetadataValue<typeof expectedResult>(
        'foo',
        'metadata',
      );
      expect(result.success).to.equal(expectedResult);
      expect(result.success.foo).to.equal('bar');
    });
  });

  describe('fetchMetadataField', () => {
    class MockMetadataBackend implements MetadataBackendInterface {
      response: any;
      async fetchMetadata(
        identifier: string,
        keypath?: string,
      ): Promise<Result<any, MetadataServiceError>> {
        return { success: { result: this.response } };
      }
    }

    function serviceReturning(response: any): MetadataService {
      const backend = new MockMetadataBackend();
      backend.response = response;
      return new MetadataService(backend);
    }

    it('models a field the API sent as an array', async () => {
      const service = serviceReturning(['kodi_archive', 'community']);

      const result = await service.fetchMetadataField('foo', 'collection');
      expect(result.success?.value).to.equal('kodi_archive');
      expect(result.success?.values).to.deep.equal([
        'kodi_archive',
        'community',
      ]);
    });

    it('models a field the API sent as a bare string', async () => {
      // An item in a single collection gets a string rather than a list, which
      // is the case that makes reading the raw value directly unsafe.
      const service = serviceReturning('audio');

      const result = await service.fetchMetadataField('foo', 'collection');
      expect(result.success?.value).to.equal('audio');
      expect(result.success?.values).to.deep.equal(['audio']);
    });

    it('casts according to the field, without being told which', async () => {
      const service = serviceReturning('2018-08-13 10:08:32');

      const result = await service.fetchMetadataField('foo', 'addeddate');
      expect(result.success?.value).to.be.instanceOf(Date);
      expect(result.success?.value?.getUTCFullYear()).to.equal(2018);
    });

    it('leaves an out-of-range enum value undefined but keeps the raw', async () => {
      const service = serviceReturning('not-a-mediatype');

      const result = await service.fetchMetadataField('foo', 'mediatype');
      expect(result.success?.value).to.equal(undefined);
      expect(result.success?.rawValue).to.equal('not-a-mediatype');
    });

    it('keeps an empty array distinguishable from a rejected value', async () => {
      const service = serviceReturning([]);

      const result = await service.fetchMetadataField('foo', 'collection');
      expect(result.success?.value).to.equal(undefined);
      expect(result.success?.values).to.deep.equal([]);
    });

    it('rejects a value that is not a scalar or array of scalars', async () => {
      // Without this the field would still construct and String() would yield
      // '[object Object]' inside a successful result.
      const service = serviceReturning([{ reviewer: 'someone' }]);

      const result = await service.fetchMetadataField('foo', 'collection');
      expect(result.success).to.equal(undefined);
      expect(result.error?.type).to.equal(
        MetadataServiceErrorType.decodingError,
      );
    });

    it('passes a backend error through', async () => {
      // What an unknown identifier or field actually produces: the API returns
      // a payload `error` key, which the backend maps to searchEngineError.
      class FailingBackend implements MetadataBackendInterface {
        async fetchMetadata(): Promise<Result<any, MetadataServiceError>> {
          return {
            error: new MetadataServiceError(
              MetadataServiceErrorType.searchEngineError,
              "Couldn't get part '/nope' of 'metadata' for item foo",
            ),
          };
        }
      }

      const service = new MetadataService(new FailingBackend());
      const result = await service.fetchMetadataField('foo', 'collection');
      expect(result.success).to.equal(undefined);
      expect(result.error?.type).to.equal(
        MetadataServiceErrorType.searchEngineError,
      );
      expect(result.error?.message).to.contain("Couldn't get part");
    });
  });

  it('returns an error result if the item is not found', async () => {
    class MockSearchBackend implements MetadataBackendInterface {
      async fetchMetadata(
        identifier: string,
      ): Promise<Result<MetadataResponse, MetadataServiceError>> {
        // this is unfortunate.. instead of getting an http 404 error,
        // we get an empty JSON object when an item is not found
        return { success: {} as any };
      }
    }

    const backend = new MockSearchBackend();
    const service = new MetadataService(backend);
    const result = await service.fetchMetadata('foo');
    expect(result.error).to.not.equal(undefined);
    expect(result.error?.type).to.equal(MetadataServiceErrorType.itemNotFound);

    const valueResult = await service.fetchMetadataValue('foo', 'metadata');
    expect(valueResult.error).to.not.equal(undefined);
    expect(valueResult.error?.type).to.equal(
      MetadataServiceErrorType.itemNotFound,
    );
  });

  it('returns the network error if one occurs', async () => {
    class MockSearchBackend implements MetadataBackendInterface {
      async fetchMetadata(
        identifier: string,
      ): Promise<Result<MetadataResponse, MetadataServiceError>> {
        const error = new MetadataServiceError(
          MetadataServiceErrorType.networkError,
          'network error',
        );
        return { error };
      }
    }

    const backend = new MockSearchBackend();
    const service = new MetadataService(backend);
    const metadataResult = await service.fetchMetadata('foo');
    expect(metadataResult.error).to.not.equal(undefined);
    expect(metadataResult.error?.type).to.equal(
      MetadataServiceErrorType.networkError,
    );
    expect(metadataResult.error?.message).to.equal('network error');

    const metadataValueResult = await service.fetchMetadataValue('foo', 'bar');
    expect(metadataValueResult.error).to.not.equal(undefined);
    expect(metadataValueResult.error?.type).to.equal(
      MetadataServiceErrorType.networkError,
    );
    expect(metadataValueResult.error?.message).to.equal('network error');
  });

  it('returns a decoding error if one occurs', async () => {
    class MockSearchBackend implements MetadataBackendInterface {
      async fetchMetadata(
        identifier: string,
      ): Promise<Result<MetadataResponse, MetadataServiceError>> {
        const error = new MetadataServiceError(
          MetadataServiceErrorType.decodingError,
          'decoding error',
        );
        return { error };
      }
    }

    const backend = new MockSearchBackend();
    const service = new MetadataService(backend);
    const metadataResult = await service.fetchMetadata('foo');
    expect(metadataResult.error).to.not.equal(undefined);
    expect(metadataResult.error?.type).to.equal(
      MetadataServiceErrorType.decodingError,
    );
    expect(metadataResult.error?.message).to.equal('decoding error');
  });
});
