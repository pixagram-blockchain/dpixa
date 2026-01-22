[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / TransferOperation

# Interface: TransferOperation

Defined in: chain/operation.ts:779

Transfers asset from one account to another.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"transfer"`

Defined in: chain/operation.ts:780

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:781

#### amount

> **amount**: `string` \| [`Asset`](../classes/Asset.md)

Amount of PIXA or PXS to send.

#### from

> **from**: `string`

Sending account name.

#### memo

> **memo**: `string`

Plain-text note attached to transaction.

#### to

> **to**: `string`

Receiving account name.

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
