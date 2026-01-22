[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / BlockchainStreamOptions

# Interface: BlockchainStreamOptions

Defined in: helpers/blockchain.ts:51

## Properties

### from?

> `optional` **from**: `number`

Defined in: helpers/blockchain.ts:55

Start block number, inclusive. If omitted generation will start from current block height.

***

### mode?

> `optional` **mode**: [`BlockchainMode`](../enumerations/BlockchainMode.md)

Defined in: helpers/blockchain.ts:64

Streaming mode, if set to `Latest` may include blocks that are not applied to the final chain.
Defaults to `Irreversible`.

***

### to?

> `optional` **to**: `number`

Defined in: helpers/blockchain.ts:59

End block number, inclusive. If omitted stream will continue indefinitely.
