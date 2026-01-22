[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / DatabaseAPI

# Class: DatabaseAPI

Defined in: helpers/database.ts:95

## Constructors

### Constructor

> **new DatabaseAPI**(`client`): `DatabaseAPI`

Defined in: helpers/database.ts:96

#### Parameters

##### client

[`Client`](Client.md)

#### Returns

`DatabaseAPI`

## Properties

### client

> `readonly` **client**: [`Client`](Client.md)

Defined in: helpers/database.ts:96

## Methods

### call()

> **call**(`method`, `params?`): `Promise`\<`any`\>

Defined in: helpers/database.ts:101

Convenience for calling `database_api`.

#### Parameters

##### method

`string`

##### params?

`any`[]

#### Returns

`Promise`\<`any`\>

***

### getAccountHistory()

> **getAccountHistory**(`account`, `from`, `limit`, `operation_bitmask?`): `Promise`\<\[\[`number`, [`AppliedOperation`](../interfaces/AppliedOperation.md)\]\]\>

Defined in: helpers/database.ts:237

Returns one or more account history objects for account operations

#### Parameters

##### account

`string`

The account to fetch

##### from

`number`

The starting index

##### limit

`number`

The maximum number of results to return

##### operation\_bitmask?

\[`number`, `number`\]

#### Returns

`Promise`\<\[\[`number`, [`AppliedOperation`](../interfaces/AppliedOperation.md)\]\]\>

#### Example

```ts
const op = dpixa.utils.operationOrders
const operationsBitmask = dpixa.utils.makeBitMaskFilter([
  op.transfer,
  op.transfer_to_vesting,
  op.withdraw_vesting,
  op.interest,
  op.liquidity_reward,
  op.transfer_to_savings,
  op.transfer_from_savings,
  op.escrow_transfer,
  op.cancel_transfer_from_savings,
  op.escrow_approve,
  op.escrow_dispute,
  op.escrow_release,
  op.fill_convert_request,
  op.fill_order,
  op.claim_reward_balance,
])
```

***

### getAccounts()

> **getAccounts**(`usernames`): `Promise`\<[`ExtendedAccount`](../interfaces/ExtendedAccount.md)[]\>

Defined in: helpers/database.ts:199

Return array of account info objects for the usernames passed.

#### Parameters

##### usernames

`string`[]

The accounts to fetch.

#### Returns

`Promise`\<[`ExtendedAccount`](../interfaces/ExtendedAccount.md)[]\>

***

### getBlock()

> **getBlock**(`blockNum`): `Promise`\<[`SignedBlock`](../interfaces/SignedBlock.md)\>

Defined in: helpers/database.ts:167

Return block *blockNum*.

#### Parameters

##### blockNum

`number`

#### Returns

`Promise`\<[`SignedBlock`](../interfaces/SignedBlock.md)\>

***

### getBlockHeader()

> **getBlockHeader**(`blockNum`): `Promise`\<[`BlockHeader`](../interfaces/BlockHeader.md)\>

Defined in: helpers/database.ts:160

Return header for *blockNum*.

#### Parameters

##### blockNum

`number`

#### Returns

`Promise`\<[`BlockHeader`](../interfaces/BlockHeader.md)\>

***

### getChainProperties()

> **getChainProperties**(): `Promise`\<[`ChainProperties`](../interfaces/ChainProperties.md)\>

Defined in: helpers/database.ts:115

Return median chain properties decided by witness.

#### Returns

`Promise`\<[`ChainProperties`](../interfaces/ChainProperties.md)\>

***

### getConfig()

> **getConfig**(): `Promise`\<\{\[`name`: `string`\]: `string` \| `number` \| `boolean`; \}\>

Defined in: helpers/database.ts:153

Return server config. See:
https://github.com/steemit/steem/blob/master/libraries/protocol/include/steemit/protocol/config.hpp

#### Returns

`Promise`\<\{\[`name`: `string`\]: `string` \| `number` \| `boolean`; \}\>

***

### getCurrentMedianHistoryPrice()

> **getCurrentMedianHistoryPrice**(): `Promise`\<[`Price`](Price.md)\>

Defined in: helpers/database.ts:131

Return median price in PXS for 1 PIXA as reported by the witnesses.

#### Returns

`Promise`\<[`Price`](Price.md)\>

***

### getDiscussions()

> **getDiscussions**(`by`, `query`): `Promise`\<[`Discussion`](../interfaces/Discussion.md)[]\>

Defined in: helpers/database.ts:188

Return array of discussions (a.k.a. posts).

#### Parameters

##### by

[`DiscussionQueryCategory`](../type-aliases/DiscussionQueryCategory.md)

The type of sorting for the discussions, valid options are:
          `active` `blog` `cashout` `children` `comments` `created`
          `feed` `hot` `promoted` `trending` `votes`. Note that
          for `blog` and `feed` the tag is set to a username.

##### query

[`DisqussionQuery`](../interfaces/DisqussionQuery.md)

#### Returns

`Promise`\<[`Discussion`](../interfaces/Discussion.md)[]\>

***

### getDynamicGlobalProperties()

> **getDynamicGlobalProperties**(): `Promise`\<[`DynamicGlobalProperties`](../interfaces/DynamicGlobalProperties.md)\>

Defined in: helpers/database.ts:108

Return state of server.

#### Returns

`Promise`\<[`DynamicGlobalProperties`](../interfaces/DynamicGlobalProperties.md)\>

***

### getOperations()

> **getOperations**(`blockNum`, `onlyVirtual`): `Promise`\<[`AppliedOperation`](../interfaces/AppliedOperation.md)[]\>

Defined in: helpers/database.ts:174

Return all applied operations in *blockNum*.

#### Parameters

##### blockNum

`number`

##### onlyVirtual

`boolean` = `false`

#### Returns

`Promise`\<[`AppliedOperation`](../interfaces/AppliedOperation.md)[]\>

***

### getState()

> **getState**(`path`): `Promise`\<`any`\>

Defined in: helpers/database.ts:124

Return all of the state required for a particular url path.

#### Parameters

##### path

`string`

Path component of url conforming to condenser's scheme
            e.g. `@almost-digital` or `trending/travel`

#### Returns

`Promise`\<`any`\>

***

### getTransaction()

> **getTransaction**(`txId`): `Promise`\<[`SignedTransaction`](../interfaces/SignedTransaction.md)\>

Defined in: helpers/database.ts:206

Returns the details of a transaction based on a transaction id.

#### Parameters

##### txId

`string`

#### Returns

`Promise`\<[`SignedTransaction`](../interfaces/SignedTransaction.md)\>

***

### getVersion()

> **getVersion**(): `Promise`\<`object`\>

Defined in: helpers/database.ts:263

return rpc node version

#### Returns

`Promise`\<`object`\>

***

### getVestingDelegations()

> **getVestingDelegations**(`account`, `from`, `limit`): `Promise`\<[`VestingDelegation`](../interfaces/VestingDelegation.md)[]\>

Defined in: helpers/database.ts:141

Get list of delegations made by account.

#### Parameters

##### account

`string`

Account delegating

##### from

`string` = `''`

Delegatee start offset, used for paging.

##### limit

`number` = `1000`

Number of results, max 1000.

#### Returns

`Promise`\<[`VestingDelegation`](../interfaces/VestingDelegation.md)[]\>

***

### verifyAuthority()

> **verifyAuthority**(`stx`): `Promise`\<`boolean`\>

Defined in: helpers/database.ts:258

Verify signed transaction.

#### Parameters

##### stx

[`SignedTransaction`](../interfaces/SignedTransaction.md)

#### Returns

`Promise`\<`boolean`\>
