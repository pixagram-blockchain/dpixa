[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / EscrowApproveOperation

# Interface: EscrowApproveOperation

Defined in: chain/operation.ts:421

The agent and to accounts must approve an escrow transaction for it to be valid on
the blockchain. Once a part approves the escrow, the cannot revoke their approval.
Subsequent escrow approve operations, regardless of the approval, will be rejected.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"escrow_approve"`

Defined in: chain/operation.ts:422

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:423

#### agent

> **agent**: `string`

#### approve

> **approve**: `boolean`

#### escrow\_id

> **escrow\_id**: `number`

#### from

> **from**: `string`

#### to

> **to**: `string`

#### who

> **who**: `string`

Either to or agent.

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
