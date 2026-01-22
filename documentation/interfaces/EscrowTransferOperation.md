[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / EscrowTransferOperation

# Interface: EscrowTransferOperation

Defined in: chain/operation.ts:509

The purpose of this operation is to enable someone to send money contingently to
another individual. The funds leave the *from* account and go into a temporary balance
where they are held until *from* releases it to *to* or *to* refunds it to *from*.

In the event of a dispute the *agent* can divide the funds between the to/from account.
Disputes can be raised any time before or on the dispute deadline time, after the escrow
has been approved by all parties.

This operation only creates a proposed escrow transfer. Both the *agent* and *to* must
agree to the terms of the arrangement by approving the escrow.

The escrow agent is paid the fee on approval of all parties. It is up to the escrow agent
to determine the fee.

Escrow transactions are uniquely identified by 'from' and 'escrow_id', the 'escrow_id' is defined
by the sender.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"escrow_transfer"`

Defined in: chain/operation.ts:510

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:511

#### agent

> **agent**: `string`

#### escrow\_expiration

> **escrow\_expiration**: `string`

#### escrow\_id

> **escrow\_id**: `number`

#### fee

> **fee**: `string` \| [`Asset`](../classes/Asset.md)

#### from

> **from**: `string`

#### json\_meta

> **json\_meta**: `string`

#### pixa\_amount

> **pixa\_amount**: `string` \| [`Asset`](../classes/Asset.md)

#### pxs\_amount

> **pxs\_amount**: `string` \| [`Asset`](../classes/Asset.md)

#### ratification\_deadline

> **ratification\_deadline**: `string`

#### to

> **to**: `string`

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
