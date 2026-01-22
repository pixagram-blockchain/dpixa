[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / ChainProperties

# Interface: ChainProperties

Defined in: chain/misc.ts:83

Chain roperties that are decided by the witnesses.

## Properties

### account\_creation\_fee

> **account\_creation\_fee**: `string` \| [`Asset`](../classes/Asset.md)

Defined in: chain/misc.ts:94

This fee, paid in PIXA, is converted into VESTING SHARES for the new account. Accounts
without vesting shares cannot earn usage rations and therefore are powerless. This minimum
fee requires all accounts to have some kind of commitment to the network that includes the
ability to vote and make transactions.

#### Note

This has to be multiplied by STEEMIT ? `CREATE_ACCOUNT_WITH_PIXA_MODIFIER`
(defined as 30 on the main chain) to get the minimum fee needed to create an account.

***

### maximum\_block\_size

> **maximum\_block\_size**: `number`

Defined in: chain/misc.ts:99

This witnesses vote for the maximum_block_size which is used by the network
to tune rate limiting and capacity.

***

### pxs\_interest\_rate

> **pxs\_interest\_rate**: `number`

Defined in: chain/misc.ts:103

The PXS interest percentage rate decided by witnesses, expressed 0 to 10000.
