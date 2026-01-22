[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / Blockchain

# Class: Blockchain

Defined in: helpers/blockchain.ts:67

## Constructors

### Constructor

> **new Blockchain**(`client`): `Blockchain`

Defined in: helpers/blockchain.ts:68

#### Parameters

##### client

[`Client`](Client.md)

#### Returns

`Blockchain`

## Properties

### client

> `readonly` **client**: [`Client`](Client.md)

Defined in: helpers/blockchain.ts:68

## Methods

### getBlockNumbers()

> **getBlockNumbers**(`options?`): `AsyncGenerator`\<`number`, `void`, `unknown`\>

Defined in: helpers/blockchain.ts:103

Return a asynchronous block number iterator.

#### Parameters

##### options?

Feed options, can also be a block number to start from.

`number` | [`BlockchainStreamOptions`](../interfaces/BlockchainStreamOptions.md)

#### Returns

`AsyncGenerator`\<`number`, `void`, `unknown`\>

***

### getBlockNumberStream()

> **getBlockNumberStream**(`options?`): `ReadableStream`

Defined in: helpers/blockchain.ts:134

Return a stream of block numbers, accepts same parameters as [getBlockNumbers](#getblocknumbers).

#### Parameters

##### options?

`number` | [`BlockchainStreamOptions`](../interfaces/BlockchainStreamOptions.md)

#### Returns

`ReadableStream`

***

### getBlocks()

> **getBlocks**(`options?`): `AsyncGenerator`\<[`SignedBlock`](../interfaces/SignedBlock.md), `void`, `unknown`\>

Defined in: helpers/blockchain.ts:141

Return a asynchronous block iterator, accepts same parameters as [getBlockNumbers](#getblocknumbers).

#### Parameters

##### options?

`number` | [`BlockchainStreamOptions`](../interfaces/BlockchainStreamOptions.md)

#### Returns

`AsyncGenerator`\<[`SignedBlock`](../interfaces/SignedBlock.md), `void`, `unknown`\>

***

### getBlockStream()

> **getBlockStream**(`options?`): `ReadableStream`

Defined in: helpers/blockchain.ts:150

Return a stream of blocks, accepts same parameters as [getBlockNumbers](#getblocknumbers).

#### Parameters

##### options?

`number` | [`BlockchainStreamOptions`](../interfaces/BlockchainStreamOptions.md)

#### Returns

`ReadableStream`

***

### getCurrentBlock()

> **getCurrentBlock**(`mode?`): `Promise`\<[`SignedBlock`](../interfaces/SignedBlock.md)\>

Defined in: helpers/blockchain.ts:95

Get latest block.

#### Parameters

##### mode?

[`BlockchainMode`](../enumerations/BlockchainMode.md)

#### Returns

`Promise`\<[`SignedBlock`](../interfaces/SignedBlock.md)\>

***

### getCurrentBlockHeader()

> **getCurrentBlockHeader**(`mode?`): `Promise`\<[`BlockHeader`](../interfaces/BlockHeader.md)\>

Defined in: helpers/blockchain.ts:86

Get latest block header.

#### Parameters

##### mode?

[`BlockchainMode`](../enumerations/BlockchainMode.md)

#### Returns

`Promise`\<[`BlockHeader`](../interfaces/BlockHeader.md)\>

***

### getCurrentBlockNum()

> **getCurrentBlockNum**(`mode`): `Promise`\<`number`\>

Defined in: helpers/blockchain.ts:73

Get latest block number.

#### Parameters

##### mode

[`BlockchainMode`](../enumerations/BlockchainMode.md) = `BlockchainMode.Irreversible`

#### Returns

`Promise`\<`number`\>

***

### getOperations()

> **getOperations**(`options?`): `AsyncGenerator`\<[`AppliedOperation`](../interfaces/AppliedOperation.md), `void`, `unknown`\>

Defined in: helpers/blockchain.ts:157

Return a asynchronous operation iterator, accepts same parameters as [getBlockNumbers](#getblocknumbers).

#### Parameters

##### options?

`number` | [`BlockchainStreamOptions`](../interfaces/BlockchainStreamOptions.md)

#### Returns

`AsyncGenerator`\<[`AppliedOperation`](../interfaces/AppliedOperation.md), `void`, `unknown`\>

***

### getOperationsStream()

> **getOperationsStream**(`options?`): `ReadableStream`

Defined in: helpers/blockchain.ts:169

Return a stream of operations, accepts same parameters as [getBlockNumbers](#getblocknumbers).

#### Parameters

##### options?

`number` | [`BlockchainStreamOptions`](../interfaces/BlockchainStreamOptions.md)

#### Returns

`ReadableStream`
