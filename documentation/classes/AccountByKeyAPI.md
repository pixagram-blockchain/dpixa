[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / AccountByKeyAPI

# Class: AccountByKeyAPI

Defined in: helpers/key.ts:13

## Constructors

### Constructor

> **new AccountByKeyAPI**(`client`): `AccountByKeyAPI`

Defined in: helpers/key.ts:14

#### Parameters

##### client

[`Client`](Client.md)

#### Returns

`AccountByKeyAPI`

## Properties

### client

> `readonly` **client**: [`Client`](Client.md)

Defined in: helpers/key.ts:14

## Methods

### call()

> **call**(`method`, `params?`): `Promise`\<`any`\>

Defined in: helpers/key.ts:19

Convenience for calling `account_by_key_api`.

#### Parameters

##### method

`string`

##### params?

`any`

#### Returns

`Promise`\<`any`\>

***

### getKeyReferences()

> **getKeyReferences**(`keys`): `Promise`\<[`AccountsByKey`](../interfaces/AccountsByKey.md)\>

Defined in: helpers/key.ts:26

Returns all accounts that have the key associated with their owner or active authorities.

#### Parameters

##### keys

(`string` \| [`PublicKey`](PublicKey.md))[]

#### Returns

`Promise`\<[`AccountsByKey`](../interfaces/AccountsByKey.md)\>
