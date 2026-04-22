[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / DynamicGlobalProperties

# Interface: DynamicGlobalProperties

Defined in: chain/misc.ts:128

Node state.

## Properties

### average\_block\_size

> **average\_block\_size**: `number`

Defined in: chain/misc.ts:186

Average block size is updated every block to be:

average_block_size = (99 * average_block_size + new_block_size) / 100

This property is used to update the current_reserve_ratio to maintain
approximately 50% or less utilization of network capacity.

***

### confidential\_pxs\_supply

> **confidential\_pxs\_supply**: `string` \| [`Asset`](../classes/Asset.md)

Defined in: chain/misc.ts:163

Total asset held in confidential balances.

***

### confidential\_supply

> **confidential\_supply**: `string` \| [`Asset`](../classes/Asset.md)

Defined in: chain/misc.ts:158

Total asset held in confidential balances.

***

### current\_aslot

> **current\_aslot**: `number`

Defined in: chain/misc.ts:201

The current absolute slot number. Equal to the total
number of slots since genesis. Also equal to the total
number of missed slots plus head_block_number.

***

### current\_pxs\_supply

> **current\_pxs\_supply**: `string` \| [`Asset`](../classes/Asset.md)

Defined in: chain/misc.ts:159

***

### current\_reserve\_ratio

> **current\_reserve\_ratio**: `number`

Defined in: chain/misc.ts:224

Any time average_block_size <= 50% maximum_block_size this value grows by 1 until it
reaches MAX_RESERVE_RATIO.  Any time average_block_size is greater than
50% it falls by 1%.  Upward adjustments happen once per round, downward adjustments
happen every block.

***

### current\_supply

> **current\_supply**: `string` \| [`Asset`](../classes/Asset.md)

Defined in: chain/misc.ts:154

***

### current\_witness

> **current\_witness**: `string`

Defined in: chain/misc.ts:142

Currently elected witness.

***

### head\_block\_id

> **head\_block\_id**: `string`

Defined in: chain/misc.ts:134

***

### head\_block\_number

> **head\_block\_number**: `number`

Defined in: chain/misc.ts:133

Current block height.

***

### id

> **id**: `number`

Defined in: chain/misc.ts:129

***

### last\_irreversible\_block\_num

> **last\_irreversible\_block\_num**: `number`

Defined in: chain/misc.ts:207

***

### max\_virtual\_bandwidth

> **max\_virtual\_bandwidth**: `string`

Defined in: chain/misc.ts:217

The maximum bandwidth the blockchain can support is:

max_bandwidth = maximum_block_size * BANDWIDTH_AVERAGE_WINDOW_SECONDS / BLOCK_INTERVAL

The maximum virtual bandwidth is:

max_bandwidth * current_reserve_ratio

***

### maximum\_block\_size

> **maximum\_block\_size**: `number`

Defined in: chain/misc.ts:195

Maximum block size is decided by the set of active witnesses which change every round.
Each witness posts what they think the maximum size should be as part of their witness
properties, the median size is chosen to be the maximum block size for the round.

#### Note

the minimum value for maximum_block_size is defined by the protocol to prevent the
network from getting stuck by witnesses attempting to set this too low.

***

### num\_pow\_witnesses

> **num\_pow\_witnesses**: `number`

Defined in: chain/misc.ts:152

The current count of how many pending POW witnesses there are, determines
the difficulty of doing pow.

***

### participation\_count

> **participation\_count**: `number`

Defined in: chain/misc.ts:206

***

### pending\_rewarded\_vesting\_pixa

> **pending\_rewarded\_vesting\_pixa**: `string` \| [`Asset`](../classes/Asset.md)

Defined in: chain/misc.ts:172

***

### pending\_rewarded\_vesting\_shares

> **pending\_rewarded\_vesting\_shares**: `string` \| [`Asset`](../classes/Asset.md)

Defined in: chain/misc.ts:171

***

### pxs\_interest\_rate

> **pxs\_interest\_rate**: `number`

Defined in: chain/misc.ts:176

This property defines the interest rate that PXS deposits receive.

***

### pxs\_print\_rate

> **pxs\_print\_rate**: `number`

Defined in: chain/misc.ts:177

***

### recent\_slots\_filled

> **recent\_slots\_filled**: `string`

Defined in: chain/misc.ts:205

Used to compute witness participation.

***

### time

> **time**: `string`

Defined in: chain/misc.ts:138

UTC Server time, e.g. 2020-01-15T00:42:00

***

### total\_pow

> **total\_pow**: `number`

Defined in: chain/misc.ts:147

The total POW accumulated, aka the sum of num_pow_witness at the time
new POW is added.

***

### total\_reward\_fund\_pixa

> **total\_reward\_fund\_pixa**: `string` \| [`Asset`](../classes/Asset.md)

Defined in: chain/misc.ts:166

***

### total\_reward\_shares2

> **total\_reward\_shares2**: `string`

Defined in: chain/misc.ts:170

The running total of REWARD^2.

***

### total\_vesting\_fund\_pixa

> **total\_vesting\_fund\_pixa**: `string` \| [`Asset`](../classes/Asset.md)

Defined in: chain/misc.ts:164

***

### total\_vesting\_shares

> **total\_vesting\_shares**: `string` \| [`Asset`](../classes/Asset.md)

Defined in: chain/misc.ts:165

***

### virtual\_supply

> **virtual\_supply**: `string` \| [`Asset`](../classes/Asset.md)

Defined in: chain/misc.ts:153

***

### vote\_power\_reserve\_rate

> **vote\_power\_reserve\_rate**: `number`

Defined in: chain/misc.ts:230

The number of votes regenerated per day.  Any user voting slower than this rate will be
"wasting" voting power through spillover; any user voting faster than this rate will have
their votes reduced.
