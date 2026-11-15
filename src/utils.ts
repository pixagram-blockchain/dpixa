/**
 * @file Misc utility functions.
 * @author Johan Nordberg <code@johan-nordberg.com> / Matias Affolter
 * @license
 * Copyright (c) 2017 Johan Nordberg. All Rights Reserved.
 * Copyright (c) 2025 Matias Affolter. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *  1. Redistribution of source code must retain the above copyright notice, this
 *     list of conditions and the following disclaimer.
 *
 *  2. Redistribution in binary form must reproduce the above copyright notice,
 *     this list of conditions and the following disclaimer in the documentation
 *     and/or other materials provided with the distribution.
 *
 *  3. Neither the name of the copyright holder nor the names of its contributors
 *     may be used to endorse or promote products derived from this software without
 *     specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * You acknowledge that this software is not designed, licensed or intended for use
 * in the design, construction, operation or maintenance of any military facility.
 */

import type { WitnessSetPropertiesOperation } from './chain/operation'
import { requireCrypto } from './crypto-registry'
import { IteratorStream } from './iterator-stream'
import type { WitnessProps } from './witness'

export type { WitnessProps } from './witness'

// TODO: Add more errors that should trigger a failover
const timeoutErrors = ['timeout', 'ENOTFOUND', 'ECONNREFUSED', 'database lock', 'CERT_HAS_EXPIRED', 'EHOSTUNREACH', 'ECONNRESET', 'ERR_TLS_CERT_ALTNAME_INVALID', 'EAI_AGAIN']

/**
 * Anything with an EventEmitter-style `once()`.
 */
export interface EventEmitterLike {
  once(eventName: string | symbol, listener: (...args: any[]) => void): unknown
}

/**
 * Return a promise that will resove when a specific event is emitted.
 */
export function waitForEvent<T>(
  emitter: EventEmitterLike,
  eventName: string | symbol
): Promise<T> {
  return new Promise((resolve, reject) => {
    emitter.once(eventName, resolve)
  })
}

/**
 * Sleep for N milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Node's `stream` module when running under Node.js, otherwise undefined.
 *
 * Looked up at runtime through `process.getBuiltinModule` (Node >= 20.16)
 * instead of `import 'stream'`, so browser bundlers never see a dependency
 * on `stream` and don't pull in the stream-browserify polyfill.
 */
const nodeStreamModule = (): any => {
  const proc = (globalThis as any).process
  if (proc && typeof proc.getBuiltinModule === 'function') {
    try {
      return proc.getBuiltinModule('stream')
    } catch (_error) {
      return undefined
    }
  }
  return undefined
}

/**
 * Return a stream that emits iterator values.
 *
 * Under Node.js this is an object-mode `stream.PassThrough`, as before. In
 * browsers it is a lightweight `IteratorStream` (src/iterator-stream.ts) with the same
 * on('data' | 'end' | 'error') / pipe() / pause() / resume() surface; for
 * new browser code prefer the async iterators (`getBlocks()` etc.) directly.
 */
export function iteratorStream<T>(
  iterator: AsyncIterableIterator<T>
): NodeJS.ReadableStream {
  const nodeStream = nodeStreamModule()
  if (!nodeStream) {
    return new IteratorStream<T>(iterator) as unknown as NodeJS.ReadableStream
  }
  const stream = new nodeStream.PassThrough({ objectMode: true })
  const iterate = async () => {
    for await (const item of iterator) {
      if (!stream.write(item)) {
        await waitForEvent(stream, 'drain')
      }
    }
  }
  iterate()
    .then(() => {
      stream.end()
    })
    .catch((error) => {
      stream.emit('error', error)
      stream.end()
    })
  return stream
}
/**
 * Return a deep copy of a JSON-serializable object.
 */
export function copy<T>(object: T): T {
  return JSON.parse(JSON.stringify(object))
}

/**
 * True under Node.js (and runtimes that emulate it). The per-attempt fetch
 * timeout below is only applied there: node-fetch honoured it, browsers
 * never did, and browser callers rely on requests not being cut short.
 */
const IS_NODE = (() => {
  const proc = (globalThis as any).process
  return !!(proc && proc.versions && proc.versions.node)
})()

/**
 * Per-attempt timeout for Node's native fetch, matching node-fetch's
 * `timeout` option: the limit applies to receiving the response headers and
 * then, separately, to reading the body.
 */
class AttemptTimer {
  public readonly controller = new AbortController()
  public error: Error | undefined
  private timer: ReturnType<typeof setTimeout> | undefined

  public constructor(private readonly url: string, private readonly ms: number) {
    this.arm(`network timeout at: ${url}`, 'request-timeout')
  }

  /** Response headers arrived: start the separate body timeout. */
  public bodyPhase() {
    this.clear()
    this.arm(`Response timeout while trying to fetch ${this.url} (over ${this.ms}ms)`, 'body-timeout')
  }

  public clear() {
    if (this.timer !== undefined) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
  }

  private arm(message: string, type: string) {
    this.timer = setTimeout(() => {
      const error: any = new Error(message)
      error.name = 'FetchError'
      error.type = type
      this.error = error
      this.controller.abort()
    }, this.ms)
  }
}

/**
 * Node's fetch reports network failures as `TypeError: fetch failed` with
 * the system error code on `error.cause.code`; node-fetch put it on
 * `error.code`, which the failover logic below looks at. Copy it over.
 */
const withErrorCode = (error: any) => {
  if (error && error.code === undefined && error.cause && typeof error.cause.code === 'string') {
    try {
      error.code = error.cause.code
    } catch (_error) {
      // frozen error object; leave it as is
    }
  }
  return error
}

/**
 * Fetch API wrapper that retries until timeout is reached.
 *
 * Uses the platform `fetch` (browsers, Node.js, workers) — no
 * cross-fetch / node-fetch / whatwg-fetch polyfills.
 */
export async function retryingFetch(
  currentAddress: string,
  allAddresses: string | string[],
  opts: any,
  timeout: number,
  failoverThreshold: number,
  consoleOnFailover: boolean,
  backoff: (tries: number) => number,
  fetchTimeout?: (tries: number) => number
) {
  let start = Date.now()
  let tries = 0
  let round = 0

  do {
    try {
      if (fetchTimeout) {
        opts.timeout = fetchTimeout(tries)
      }
      const timer = IS_NODE && opts.timeout > 0 ? new AttemptTimer(currentAddress, opts.timeout) : undefined
      try {
        const response = await (globalThis as any).fetch(
          currentAddress,
          timer ? { ...opts, signal: timer.controller.signal } : opts
        )
        if (timer) {
          timer.bodyPhase()
        }
        if (!response.ok) {
          if (response.status === 500) { // Support for Drone
            const resJson = await response.json()
            if (resJson.jsonrpc === '2.0') {
              return { response: resJson, currentAddress }
            }
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return { response: await response.json(), currentAddress }
      } catch (error) {
        throw timer && timer.error ? timer.error : withErrorCode(error)
      } finally {
        if (timer) {
          timer.clear()
        }
      }
    } catch (error) {
      if (timeout !== 0 && Date.now() - start > timeout) {
        if ((!error || !error.code) && Array.isArray(allAddresses)) {
          // If error is empty or not code is present, it means rpc is down => switch
          currentAddress = failover(
            currentAddress,
            allAddresses,
            currentAddress,
            consoleOnFailover
          )
        } else {
          const isFailoverError =
            timeoutErrors.filter(
              (fe) => error && typeof error.code === 'string' && error.code.includes(fe)
            ).length > 0
          if (
            isFailoverError &&
            Array.isArray(allAddresses) &&
            allAddresses.length > 1
          ) {
            if (round < failoverThreshold) {
              start = Date.now()
              tries = -1
              if (failoverThreshold > 0) {
                round++
              }
              currentAddress = failover(
                currentAddress,
                allAddresses,
                currentAddress,
                consoleOnFailover
              )
            } else {
              error.message = `[${
                error.code
                }] tried ${failoverThreshold} times with ${allAddresses.join(
                  ','
                )}`
              throw error
            }
          } else {
            // tslint:disable-next-line: no-console
            console.error(
              `Didn't failover for error ${error.code ? 'code' : 'message'}: [${
                error.code || error.message
              }]`
            )
            throw error
          }
        }
      }
      await sleep(backoff(tries++))
    }
  } while (true)
}

const failover = (
  url: string,
  urls: string[],
  currentAddress: string,
  consoleOnFailover: boolean
) => {
  const index = urls.indexOf(url)
  const targetUrl = urls.length === index + 1 ? urls[0] : urls[index + 1]
  if (consoleOnFailover) {
    // tslint:disable-next-line: no-console
    console.log(`Switched Pixa RPC: ${targetUrl} (previous: ${currentAddress})`)
  }
  return targetUrl
}

/**
 * Build a `witness_set_properties` operation with hex-serialized props.
 *
 * Needs the serializer, so it lives with the crypto code (see witness.ts);
 * this wrapper keeps it on `utils` for the lite entry point and works as soon
 * as `@pixagram/dpixa/crypto` (or the full build) has been loaded.
 */
export const buildWitnessUpdateOp = (
  owner: string,
  props: WitnessProps
): WitnessSetPropertiesOperation =>
  requireCrypto('utils.buildWitnessUpdateOp').buildWitnessUpdateOp(owner, props)

export const operationOrders = {
  vote: 0,
  // tslint:disable-next-line: object-literal-sort-keys
  comment: 1,
  transfer: 2,
  transfer_to_vesting: 3,
  withdraw_vesting: 4,
  limit_order_create: 5,
  limit_order_cancel: 6,
  feed_publish: 7,
  convert: 8,
  account_create: 9,
  account_update: 10,
  witness_update: 11,
  account_witness_vote: 12,
  account_witness_proxy: 13,
  pow: 14,
  custom: 15,
  report_over_production: 16,
  delete_comment: 17,
  custom_json: 18,
  comment_options: 19,
  set_withdraw_vesting_route: 20,
  limit_order_create2: 21,
  claim_account: 22,
  create_claimed_account: 23,
  request_account_recovery: 24,
  recover_account: 25,
  change_recovery_account: 26,
  escrow_transfer: 27,
  escrow_dispute: 28,
  escrow_release: 29,
  pow2: 30,
  escrow_approve: 31,
  transfer_to_savings: 32,
  transfer_from_savings: 33,
  cancel_transfer_from_savings: 34,
  custom_binary: 35,
  decline_voting_rights: 36,
  reset_account: 37,
  set_reset_account: 38,
  claim_reward_balance: 39,
  delegate_vesting_shares: 40,
  account_create_with_delegation: 41,
  witness_set_properties: 42,
  account_update2: 43,
  create_proposal: 44,
  update_proposal_votes: 45,
  remove_proposal: 46,
  update_proposal: 47,
  collateralized_convert: 48,
  recurrent_transfer: 49,
  // virtual ops
  fill_convert_request: 50,
  author_reward: 51,
  curation_reward: 52,
  comment_reward: 53,
  liquidity_reward: 54,
  interest: 55,
  fill_vesting_withdraw: 56,
  fill_order: 57,
  shutdown_witness: 58,
  fill_transfer_from_savings: 59,
  hardfork: 60,
  comment_payout_update: 61,
  return_vesting_delegation: 62,
  comment_benefactor_reward: 63,
  producer_reward: 64,
  clear_null_account_balance: 65,
  proposal_pay: 66,
  sps_fund: 67,
  hardfork_pixa: 68,
  hardfork_pixa_restore: 69,
  delayed_voting: 70,
  consolidate_treasury_balance: 71,
  effective_comment_vote: 72,
  ineffective_delete_comment: 73,
  sps_convert: 74,
  expired_account_notification: 75,
  changed_recovery_account: 76,
  transfer_to_vesting_completed: 77,
  pow_reward: 78,
  vesting_shares_split: 79,
  account_created: 80,
  fill_collateralized_convert_request: 81,
  system_warning: 82,
  fill_recurrent_transfer: 83,
  failed_recurrent_transfer: 84
}

/**
 * Make bitmask filter to be used with getAccountHistory call
 * @param allowedOperations Array of operations index numbers
 */
export function makeBitMaskFilter(allowedOperations: number[]): (string | null)[] {
  return allowedOperations
    .reduce(redFunction, [0n, 0n])
    .map(value => (value !== 0n ? value.toString() : null))
}

const redFunction = ([low, high]: bigint[], allowedOperation: number): bigint[] => {
  if (allowedOperation < 64) {
    return [low | (1n << BigInt(allowedOperation)), high]
  } else {
    return [low, high | (1n << BigInt(allowedOperation - 64))]
  }
}
