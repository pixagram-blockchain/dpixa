[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / RecoverAccountOperation

# Interface: RecoverAccountOperation

Defined in: chain/operation.ts:638

Recover an account to a new authority using a previous authority and verification
of the recovery account as proof of identity. This operation can only succeed
if there was a recovery request sent by the account's recover account.

In order to recover the account, the account holder must provide proof
of past ownership and proof of identity to the recovery account. Being able
to satisfy an owner authority that was used in the past 30 days is sufficient
to prove past ownership. The get_owner_history function in the database API
returns past owner authorities that are valid for account recovery.

Proving identity is an off chain contract between the account holder and
the recovery account. The recovery request contains a new authority which
must be satisfied by the account holder to regain control. The actual process
of verifying authority may become complicated, but that is an application
level concern, not a blockchain concern.

This operation requires both the past and future owner authorities in the
operation because neither of them can be derived from the current chain state.
The operation must be signed by keys that satisfy both the new owner authority
and the recent owner authority. Failing either fails the operation entirely.

If a recovery request was made inadvertantly, the account holder should
contact the recovery account to have the request deleted.

The two setp combination of the account recovery request and recover is
safe because the recovery account never has access to secrets of the account
to recover. They simply act as an on chain endorsement of off chain identity.
In other systems, a fork would be required to enforce such off chain state.
Additionally, an account cannot be permanently recovered to the wrong account.
While any owner authority from the past 30 days can be used, including a compromised
authority, the account can be continually recovered until the recovery account
is confident a combination of uncompromised authorities were used to
recover the account. The actual process of verifying authority may become
complicated, but that is an application level concern, not the blockchain's
concern.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"recover_account"`

Defined in: chain/operation.ts:639

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:640

#### account\_to\_recover

> **account\_to\_recover**: `string`

The account to be recovered.

#### extensions

> **extensions**: `any`[]

Extensions. Not currently used.

#### new\_owner\_authority

> **new\_owner\_authority**: [`AuthorityType`](AuthorityType.md)

The new owner authority as specified in the request account recovery operation.

#### recent\_owner\_authority

> **recent\_owner\_authority**: [`AuthorityType`](AuthorityType.md)

A previous owner authority that the account holder will use to prove
past ownership of the account to be recovered.

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
