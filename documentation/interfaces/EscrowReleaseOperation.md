[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / EscrowReleaseOperation

# Interface: EscrowReleaseOperation

Defined in: chain/operation.ts:462

This operation can be used by anyone associated with the escrow transfer to
release funds if they have permission.

The permission scheme is as follows:
If there is no dispute and escrow has not expired, either party can release funds to the other.
If escrow expires and there is no dispute, either party can release funds to either party.
If there is a dispute regardless of expiration, the agent can release funds to either party
   following whichever agreement was in place between the parties.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"escrow_release"`

Defined in: chain/operation.ts:463

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:464

#### agent

> **agent**: `string`

#### escrow\_id

> **escrow\_id**: `number`

#### from

> **from**: `string`

#### pixa\_amount

> **pixa\_amount**: `string` \| [`Asset`](../classes/Asset.md)

The amount of pixa to release.

#### pxs\_amount

> **pxs\_amount**: `string` \| [`Asset`](../classes/Asset.md)

The amount of pxs to release.

#### receiver

> **receiver**: `string`

The account that should receive funds (might be from, might be to).

#### to

> **to**: `string`

The original 'to'.

#### who

> **who**: `string`

The account that is attempting to release the funds, determines valid 'receiver'.

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
