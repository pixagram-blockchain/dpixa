[**@pixagram/dpixa**](../../../../README.md)

***

[@pixagram/dpixa](../../../../globals.md) / [utils](../README.md) / buildWitnessUpdateOp

# Function: buildWitnessUpdateOp()

> **buildWitnessUpdateOp**(`owner`, `props`): [`WitnessSetPropertiesOperation`](../../../../interfaces/WitnessSetPropertiesOperation.md)

Defined in: utils.ts:327

Build a `witness_set_properties` operation with hex-serialized props.

Needs the serializer, so it lives with the crypto code (see witness.ts);
this wrapper keeps it on `utils` for the lite entry point and works as soon
as `@pixagram/dpixa/crypto` (or the full build) has been loaded.

## Parameters

### owner

`string`

### props

[`WitnessProps`](../interfaces/WitnessProps.md)

## Returns

[`WitnessSetPropertiesOperation`](../../../../interfaces/WitnessSetPropertiesOperation.md)
