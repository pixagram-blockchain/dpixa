[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / TransferToVestingOperation

# Interface: TransferToVestingOperation

Defined in: chain/operation.ts:830

This operation converts PIXA into VFS (Vesting Fund Shares) at
the current exchange rate. With this operation it is possible to
give another account vesting shares so that faucets can
pre-fund new accounts with vesting shares.
(A.k.a. Powering Up)

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"transfer_to_vesting"`

Defined in: chain/operation.ts:831

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:832

#### amount

> **amount**: `string` \| [`Asset`](../classes/Asset.md)

Amount to power up, must be PIXA

#### from

> **from**: `string`

#### to

> **to**: `string`

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
