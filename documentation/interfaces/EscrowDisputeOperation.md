[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / EscrowDisputeOperation

# Interface: EscrowDisputeOperation

Defined in: chain/operation.ts:441

If either the sender or receiver of an escrow payment has an issue, they can
raise it for dispute. Once a payment is in dispute, the agent has authority over
who gets what.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"escrow_dispute"`

Defined in: chain/operation.ts:442

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:443

#### agent

> **agent**: `string`

#### escrow\_id

> **escrow\_id**: `number`

#### from

> **from**: `string`

#### to

> **to**: `string`

#### who

> **who**: `string`

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
