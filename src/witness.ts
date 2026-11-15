/**
 * @file witness_set_properties builder.
 *
 * Moved here from utils.ts: it needs the binary serializer (and therefore
 * secp256k1 for public keys), so it belongs to the crypto side of the
 * library. `utils.buildWitnessUpdateOp` forwards to it.
 */

import ByteBuffer from './bytebuffer'
import type { Asset, PriceType } from './chain/asset'
import type { WitnessSetPropertiesOperation } from './chain/operation'
import { Serializer, Types } from './chain/serializer'
import type { PublicKey } from './crypto'

// Hack to be able to generate a valid witness_set_properties op
// Can hopefully be removed when pixad's JSON representation is fixed
export interface WitnessProps {
  account_creation_fee?: string | Asset
  account_subsidy_budget?: number // uint32_t
  account_subsidy_decay?: number // uint32_t
  key: PublicKey | string
  maximum_block_size?: number // uint32_t
  new_signing_key?: PublicKey | string | null
  pxs_exchange_rate?: PriceType
  pxs_interest_rate?: number // uint16_t
  url?: string
}

const serialize = (serializer: Serializer, data: any) => {
  const buffer = new ByteBuffer(
    ByteBuffer.DEFAULT_CAPACITY,
    ByteBuffer.LITTLE_ENDIAN
  )
  serializer(buffer, data)
  buffer.flip()
  // `props` values must be hex
  return buffer.toString('hex')
}

export const buildWitnessUpdateOp = (
  owner: string,
  props: WitnessProps
): WitnessSetPropertiesOperation => {
  const data: WitnessSetPropertiesOperation[1] = {
    extensions: [],
    owner,
    props: []
  }
  for (const key of Object.keys(props)) {
    let type: Serializer
    switch (key) {
      case 'key':
      case 'new_signing_key':
        type = Types.PublicKey
        break
      case 'account_subsidy_budget':
      case 'account_subsidy_decay':
      case 'maximum_block_size':
        type = Types.UInt32
        break
      case 'pxs_interest_rate':
        type = Types.UInt16
        break
      case 'url':
        type = Types.String
        break
      case 'pxs_exchange_rate':
        type = Types.Price
        break
      case 'account_creation_fee':
        type = Types.Asset
        break
      default:
        throw new Error(`Unknown witness prop: ${key}`)
    }
    data.props.push([key, serialize(type, props[key])])
  }
  data.props.sort((a, b) => a[0].localeCompare(b[0]))
  return ['witness_set_properties', data]
}
