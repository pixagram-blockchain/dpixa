[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / Client

# Class: Client

Defined in: client.ts:186

RPC Client
----------
Can be used in both node.js and the browser. Also see [ClientOptions](../interfaces/ClientOptions.md).

## Constructors

### Constructor

> **new Client**(`address`, `options`): `Client`

Defined in: client.ts:257

#### Parameters

##### address

The address to the Pixa RPC server,
e.g. `https://api.pixagram.io`. or [`https://api.pixagram.org`, `https://another.api.com`]

`string` | `string`[]

##### options

[`ClientOptions`](../interfaces/ClientOptions.md) = `{}`

Client options.

#### Returns

`Client`

## Properties

### address

> **address**: `string` \| `string`[]

Defined in: client.ts:196

Address to Pixa RPC server.
String or String[] *read-only*

***

### addressPrefix

> `readonly` **addressPrefix**: `string`

Defined in: client.ts:241

Address prefix for current network.

***

### blockchain

> `readonly` **blockchain**: [`Blockchain`](Blockchain.md)

Defined in: client.ts:216

Blockchain helper.

***

### broadcast

> `readonly` **broadcast**: `BroadcastAPI`

Defined in: client.ts:211

Broadcast API helper.

***

### chainId

> `readonly` **chainId**: `Buffer`

Defined in: client.ts:236

Chain ID for current network.

***

### currentAddress

> **currentAddress**: `string`

Defined in: client.ts:250

***

### database

> `readonly` **database**: [`DatabaseAPI`](DatabaseAPI.md)

Defined in: client.ts:201

Database API helper.

***

### keys

> `readonly` **keys**: [`AccountByKeyAPI`](AccountByKeyAPI.md)

Defined in: client.ts:226

Accounts by key API helper.

***

### options

> `readonly` **options**: [`ClientOptions`](../interfaces/ClientOptions.md)

Defined in: client.ts:190

Client options, *read-only*.

***

### pixamind

> `readonly` **pixamind**: [`PixamindAPI`](PixamindAPI.md)

Defined in: client.ts:221

Pixamind helper.

***

### rc

> `readonly` **rc**: [`RCAPI`](RCAPI.md)

Defined in: client.ts:206

RC API helper.

***

### transaction

> `readonly` **transaction**: `TransactionStatusAPI`

Defined in: client.ts:231

Transaction status API helper.

## Methods

### call()

> **call**(`api`, `method`, `params`): `Promise`\<`any`\>

Defined in: client.ts:309

Make a RPC call to the server.

#### Parameters

##### api

`string`

The API to call, e.g. `database_api`.

##### method

`string`

The API method, e.g. `get_dynamic_global_properties`.

##### params

`any` = `[]`

Array of parameters to pass to the method, optional.

#### Returns

`Promise`\<`any`\>

***

### updateOperations()

> **updateOperations**(`rebrandedApi`): `void`

Defined in: client.ts:412

#### Parameters

##### rebrandedApi

`any`

#### Returns

`void`

***

### testnet()

> `static` **testnet**(`options?`): `Client`

Defined in: client.ts:289

Create a new client instance configured for the testnet.

#### Parameters

##### options?

[`ClientOptions`](../interfaces/ClientOptions.md)

#### Returns

`Client`
