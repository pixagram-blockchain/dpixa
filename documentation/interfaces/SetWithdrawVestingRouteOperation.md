[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / SetWithdrawVestingRouteOperation

# Interface: SetWithdrawVestingRouteOperation

Defined in: chain/operation.ts:766

Allows an account to setup a vesting withdraw but with the additional
request for the funds to be transferred directly to another account's
balance rather than the withdrawing account. In addition, those funds
can be immediately vested again, circumventing the conversion from
vests to pixa and back, guaranteeing they maintain their value.

## Extends

- [`Operation`](Operation.md)

## Properties

### 0

> **0**: `"set_withdraw_vesting_route"`

Defined in: chain/operation.ts:767

#### Overrides

[`Operation`](Operation.md).[`0`](Operation.md#0)

***

### 1

> **1**: `object`

Defined in: chain/operation.ts:768

#### auto\_vest

> **auto\_vest**: `boolean`

#### from\_account

> **from\_account**: `string`

#### percent

> **percent**: `number`

#### to\_account

> **to\_account**: `string`

#### Overrides

[`Operation`](Operation.md).[`1`](Operation.md#1)
