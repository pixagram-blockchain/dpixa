[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / SetResetAccountOperation

# Interface: SetResetAccountOperation

Defined in: chain/operation.ts:750

This operation allows 'account' owner to control which account has the power
to execute the 'reset_account_operation' after 60 days.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"set_reset_account"`

Defined in: chain/operation.ts:751

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:752

#### account

> **account**: `string`

#### current\_reset\_account

> **current\_reset\_account**: `string`

#### reset\_account

> **reset\_account**: `string`

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
