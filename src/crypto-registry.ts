/**
 * @file Late binding between the fetch-only client and the crypto module.
 *
 * The lite entry point (Client, BroadcastAPI, utils, Authority, …) must not
 * import secp256k1, the hash functions or AES, or bundlers would pull them
 * into the first download. The few lite features that need crypto — signing
 * and broadcasting, `utils.buildWitnessUpdateOp`, `Authority.from(PublicKey)`
 * — look the implementation up here instead. `./crypto` registers itself as
 * soon as it is evaluated, so loading `@pixagram/dpixa/crypto` (or the full
 * `@pixagram/dpixa`) anywhere in the app is enough to enable them.
 */

import type { cryptoUtils, PrivateKey, PublicKey } from './crypto'
import type { buildWitnessUpdateOp } from './witness'

export interface CryptoProvider {
  PrivateKey: typeof PrivateKey
  PublicKey: typeof PublicKey
  signTransaction: typeof cryptoUtils.signTransaction
  generateTrxId: typeof cryptoUtils.generateTrxId
  buildWitnessUpdateOp: typeof buildWitnessUpdateOp
}

let provider: CryptoProvider | undefined

/**
 * Called by ./crypto when it is loaded.
 */
export const registerCrypto = (implementation: CryptoProvider): void => {
  provider = implementation
}

/**
 * The crypto implementation, or undefined if it has not been loaded.
 */
export const peekCrypto = (): CryptoProvider | undefined => provider

/**
 * The crypto implementation; throws a descriptive error if it has not been
 * loaded yet.
 * @param feature What the caller was trying to do, for the error message.
 */
export const requireCrypto = (feature: string): CryptoProvider => {
  if (!provider) {
    throw new Error(
      `dpixa: ${feature} needs the crypto module, which is not loaded. ` +
      'Import \'@pixagram/dpixa/crypto\' (or the full \'@pixagram/dpixa\') first.'
    )
  }
  return provider
}
