/* eslint-disable @typescript-eslint/no-unused-vars */

import { expect } from '@open-wc/testing';
import { DefaultMetadataBackend } from '../src/backend/default-metadata-backend';
import { MetadataServiceErrorType } from '../src/metadata-service-error';

describe('DefaultMetadataBackend', () => {
  it('can fetch metadata', async () => {
    const fetchBackup = window.fetch;
    window.fetch = (): Promise<Response> => {
      return new Promise(resolve => {
        const response = new Response('{ "foo": "bar" }');
        resolve(response);
      });
    };

    const backend = new DefaultMetadataBackend();
    const result = await backend.fetchMetadata('foo');
    expect(result.success?.foo).to.equal('bar');
    window.fetch = fetchBackup;
  });

  it('returns a networkError if theres a problem fetching using String type', async () => {
    const fetchBackup = window.fetch;
    window.fetch = (): Promise<Response> => {
      throw 'network error';
    };

    const backend = new DefaultMetadataBackend();
    const result = await backend.fetchMetadata('foo');
    expect(result.error?.type).to.equal(MetadataServiceErrorType.networkError);
    expect(result.error?.message).to.equal('network error');
    window.fetch = fetchBackup;
  });

  it('returns a networkError if theres a problem fetching using Error type', async () => {
    const fetchBackup = window.fetch;
    window.fetch = (): Promise<Response> => {
      throw new Error('network error');
    };

    const backend = new DefaultMetadataBackend();
    const result = await backend.fetchMetadata('foo');
    expect(result.error?.type).to.equal(MetadataServiceErrorType.networkError);
    expect(result.error?.message).to.equal('network error');
    window.fetch = fetchBackup;
  });

  it('returns a decodingError if theres a problem decoding the json', async () => {
    const fetchBackup = window.fetch;
    window.fetch = (): Promise<Response> => {
      const response = new Response('boop');
      return new Promise(resolve => resolve(response));
    };

    const backend = new DefaultMetadataBackend();
    const result = await backend.fetchMetadata('foo');
    expect(result.error?.type).to.equal(MetadataServiceErrorType.decodingError);
    window.fetch = fetchBackup;
  });

  it('appends the scope if provided', async () => {
    const fetchBackup = window.fetch;
    let urlCalled = '';
    window.fetch = (
      input: RequestInfo | URL,
      init?: RequestInit | undefined,
    ): Promise<Response> => {
      urlCalled = input.toString();
      const response = new Response('boop');
      return new Promise(resolve => resolve(response));
    };

    const backend = new DefaultMetadataBackend({
      scope: 'foo',
    });
    const result = await backend.fetchMetadata('foo');
    expect(urlCalled.includes('scope=foo')).to.be.true;
    window.fetch = fetchBackup;
  });

  it('does not credentials for metadata endpoint', async () => {
    const fetchBackup = window.fetch;
    let urlCalled: RequestInfo | URL;
    let urlConfig: RequestInit | undefined;
    window.fetch = (
      input: RequestInfo | URL,
      init?: RequestInit | undefined,
    ): Promise<Response> => {
      urlCalled = input;
      urlConfig = init;
      const response = new Response('boop');
      return new Promise(resolve => resolve(response));
    };

    const backend = new DefaultMetadataBackend({
      scope: 'foo',
      includeCredentials: true,
    });
    await backend.fetchMetadata('foo');
    expect(urlConfig?.credentials).to.equal('omit');
    window.fetch = fetchBackup;
  });
});
