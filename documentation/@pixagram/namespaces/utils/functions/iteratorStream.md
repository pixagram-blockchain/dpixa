[**@pixagram/dpixa**](../../../../README.md)

***

[@pixagram/dpixa](../../../../globals.md) / [utils](../README.md) / iteratorStream

# Function: iteratorStream()

> **iteratorStream**\<`T`\>(`iterator`): `ReadableStream`

Defined in: utils.ts:102

Return a stream that emits iterator values.

Under Node.js this is an object-mode `stream.PassThrough`, as before. In
browsers it is a lightweight `IteratorStream` (src/iterator-stream.ts) with the same
on('data' | 'end' | 'error') / pipe() / pause() / resume() surface; for
new browser code prefer the async iterators (`getBlocks()` etc.) directly.

## Type Parameters

### T

`T`

## Parameters

### iterator

`AsyncIterableIterator`\<`T`\>

## Returns

`ReadableStream`
