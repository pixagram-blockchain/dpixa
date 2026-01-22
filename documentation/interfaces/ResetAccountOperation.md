[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / ResetAccountOperation

# Interface: ResetAccountOperation

Defined in: chain/operation.ts:737

This operation allows recovery_account to change account_to_reset's owner authority to
new_owner_authority after 60 days of inactivity.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"reset_account"`

Defined in: chain/operation.ts:738

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:739

#### account\_to\_reset

> **account\_to\_reset**: `string`

#### new\_owner\_authority

> **new\_owner\_authority**: [`AuthorityType`](AuthorityType.md)

#### reset\_account

> **reset\_account**: `string`

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
