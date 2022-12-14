# Internet Archive Metadata Service

A service for retrieving metadata about items in the Internet Archive.

## Installation
```bash
npm install @internetarchive/metadata-service
```

## Usage

### Fetch Metadata

```ts
const metadataResponse: MetadataResponse = await metadataService.fetchMetadata('some-identifier');

metadataResponse.metadata.identifier // => 'some-identifier'
metadataResponse.metadata.collection.value // => 'some-collection'
metadataResponse.metadata.collection.values // => ['some-collection', 'another-collection', 'more-collections']
```

## Metadata Values

Internet Archive Metadata is expansive and nearly all metadata fields can be returned as either an array, string, or number.

The Metadata Service handles all of the possible variations in data formats and converts them to their appropriate types. For instance on date fields, like `date`, it takes the string returned and converts it into a native javascript `Date` value. Similarly for duration-type fields, like `length`, it takes the duration, which can be seconds `324.34` or `hh:mm:ss.ms` and converts them to a `number` in seconds.

There are parsers for several different field types, like `Number`, `String`, `Date`, and `Duration` and others can be added for other field types.

See `src/models/metadata-fields/field-types.ts`

### Usage

```ts
metadata.collection.value // return just the first item of the `values` array, ie. 'my-collection'
metadata.collection.values // returns all values of the array, ie. ['my-collection', 'other-collection']
metadata.collection.rawValue // return the rawValue. This is useful for inspecting the raw response received.

metadata.date.value  // return the date as a javascript `Date` object

metadata.length.value  // return the length (duration) of the item as a number of seconds, can be in the format "hh:mm:ss" or decimal seconds
```

# Development

## Prerequisite
```bash
npm install
```

## Testing
```bash
npm run test
```

## Demo
```bash
npm run start
```

## Linting
```bash
npm run format
```
