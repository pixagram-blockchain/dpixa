[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / WithdrawVestingOperation

# Interface: WithdrawVestingOperation

Defined in: chain/operation.ts:867

At any given point in time an account can be withdrawing from their
vesting shares. A user may change the number of shares they wish to
cash out at any time between 0 and their total vesting stake.

After applying this operation, vesting_shares will be withdrawn
at a rate of vesting_shares/104 per week for two years starting
one week after this operation is included in the blockchain.

This operation is not valid if the user has no vesting shares.
(A.k.a. Powering Down)

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"withdraw_vesting"`

Defined in: chain/operation.ts:868

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:869

#### account

> **account**: `string`

#### vesting\_shares

> **vesting\_shares**: `string` \| [`Asset`](../classes/Asset.md)

Amount to power down, must be VESTS.

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
