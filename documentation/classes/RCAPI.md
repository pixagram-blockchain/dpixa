[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / RCAPI

# Class: RCAPI

Defined in: helpers/rc.ts:8

## Constructors

### Constructor

> **new RCAPI**(`client`): `RCAPI`

Defined in: helpers/rc.ts:9

#### Parameters

##### client

[`Client`](Client.md)

#### Returns

`RCAPI`

## Properties

### client

> `readonly` **client**: [`Client`](Client.md)

Defined in: helpers/rc.ts:9

## Methods

### calculateRCMana()

> **calculateRCMana**(`rc_account`): `Manabar`

Defined in: helpers/rc.ts:60

Calculates the RC mana-data based on an RCAccount - findRCAccounts()

#### Parameters

##### rc\_account

`RCAccount`

#### Returns

`Manabar`

***

### calculateVPMana()

> **calculateVPMana**(`account`): `Manabar`

Defined in: helpers/rc.ts:70

Calculates the RC mana-data based on an Account - getAccounts()

#### Parameters

##### account

[`Account`](../interfaces/Account.md)

#### Returns

`Manabar`

***

### call()

> **call**(`method`, `params?`): `Promise`\<`any`\>

Defined in: helpers/rc.ts:14

Convenience for calling `rc_api`.

#### Parameters

##### method

`string`

##### params?

`any`

#### Returns

`Promise`\<`any`\>

***

### findRCAccounts()

> **findRCAccounts**(`usernames`): `Promise`\<`RCAccount`[]\>

Defined in: helpers/rc.ts:21

Returns RC data for array of usernames

#### Parameters

##### usernames

`string`[]

#### Returns

`Promise`\<`RCAccount`[]\>

***

### getRCMana()

> **getRCMana**(`username`): `Promise`\<`Manabar`\>

Defined in: helpers/rc.ts:42

Makes a API call and returns the RC mana-data for a specified username

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`Manabar`\>

***

### getResourceParams()

> **getResourceParams**(): `Promise`\<`RCParams`\>

Defined in: helpers/rc.ts:28

Returns the global resource params

#### Returns

`Promise`\<`RCParams`\>

***

### getResourcePool()

> **getResourcePool**(): `Promise`\<`RCPool`\>

Defined in: helpers/rc.ts:35

Returns the global resource pool

#### Returns

`Promise`\<`RCPool`\>

***

### getVPMana()

> **getVPMana**(`username`): `Promise`\<`Manabar`\>

Defined in: helpers/rc.ts:50

Makes a API call and returns the VP mana-data for a specified username

#### Parameters

##### username

`string`

#### Returns

`Promise`\<`Manabar`\>
