[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / RequestAccountRecoveryOperation

# Interface: RequestAccountRecoveryOperation

Defined in: chain/operation.ts:710

All account recovery requests come from a listed recovery account. This
is secure based on the assumption that only a trusted account should be
a recovery account. It is the responsibility of the recovery account to
verify the identity of the account holder of the account to recover by
whichever means they have agreed upon. The blockchain assumes identity
has been verified when this operation is broadcast.

This operation creates an account recovery request which the account to
recover has 24 hours to respond to before the request expires and is
invalidated.

There can only be one active recovery request per account at any one time.
Pushing this operation for an account to recover when it already has
an active request will either update the request to a new new owner authority
and extend the request expiration to 24 hours from the current head block
time or it will delete the request. To cancel a request, simply set the
weight threshold of the new owner authority to 0, making it an open authority.

Additionally, the new owner authority must be satisfiable. In other words,
the sum of the key weights must be greater than or equal to the weight
threshold.

This operation only needs to be signed by the the recovery account.
The account to recover confirms its identity to the blockchain in
the recover account operation.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"request_account_recovery"`

Defined in: chain/operation.ts:711

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:712

#### account\_to\_recover

> **account\_to\_recover**: `string`

The account to recover. This is likely due to a compromised owner authority.

#### extensions

> **extensions**: `any`[]

Extensions. Not currently used.

#### new\_owner\_authority

> **new\_owner\_authority**: [`AuthorityType`](AuthorityType.md)

The new owner authority the account to recover wishes to have. This is secret
known by the account to recover and will be confirmed in a recover_account_operation.

#### recovery\_account

> **recovery\_account**: `string`

The recovery account is listed as the recovery account on the account to recover.

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
