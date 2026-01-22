[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / Authority

# Class: Authority

Defined in: chain/account.ts:46

## Implements

- [`AuthorityType`](../interfaces/AuthorityType.md)

## Constructors

### Constructor

> **new Authority**(`__namedParameters`): `Authority`

Defined in: chain/account.ts:51

#### Parameters

##### \_\_namedParameters

[`AuthorityType`](../interfaces/AuthorityType.md)

#### Returns

`Authority`

## Properties

### account\_auths

> **account\_auths**: \[`string`, `number`\][]

Defined in: chain/account.ts:48

#### Implementation of

[`AuthorityType`](../interfaces/AuthorityType.md).[`account_auths`](../interfaces/AuthorityType.md#account_auths)

***

### key\_auths

> **key\_auths**: \[`string` \| [`PublicKey`](PublicKey.md), `number`\][]

Defined in: chain/account.ts:49

#### Implementation of

[`AuthorityType`](../interfaces/AuthorityType.md).[`key_auths`](../interfaces/AuthorityType.md#key_auths)

***

### weight\_threshold

> **weight\_threshold**: `number`

Defined in: chain/account.ts:47

#### Implementation of

[`AuthorityType`](../interfaces/AuthorityType.md).[`weight_threshold`](../interfaces/AuthorityType.md#weight_threshold)

## Methods

### from()

> `static` **from**(`value`): `Authority`

Defined in: chain/account.ts:60

Convenience to create a new instance from PublicKey or authority object.

#### Parameters

##### value

`string` | [`AuthorityType`](../interfaces/AuthorityType.md) | [`PublicKey`](PublicKey.md)

#### Returns

`Authority`
