/*! @pixagram/dpixa 1.6.0 | BSD-3-Clause-No-Military-License | Copyright (c) 2017 Johan Nordberg, Copyright (c) 2025 Pixagram Ltd | https://github.com/pixagram-blockchain/dpixa */
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/utils.ts
var utils_exports = {};
__export(utils_exports, {
  buildWitnessUpdateOp: () => buildWitnessUpdateOp,
  copy: () => copy,
  iteratorStream: () => iteratorStream,
  makeBitMaskFilter: () => makeBitMaskFilter,
  operationOrders: () => operationOrders,
  retryingFetch: () => retryingFetch,
  sleep: () => sleep,
  waitForEvent: () => waitForEvent
});

// src/crypto-registry.ts
var provider;
var registerCrypto = (implementation) => {
  provider = implementation;
};
var peekCrypto = () => provider;
var requireCrypto = (feature) => {
  if (!provider) {
    throw new Error(
      `dpixa: ${feature} needs the crypto module, which is not loaded. Import '@pixagram/dpixa/crypto' (or the full '@pixagram/dpixa') first.`
    );
  }
  return provider;
};

// src/iterator-stream.ts
var IteratorStream = class {
  constructor(iterator) {
    this.iterator = iterator;
    this.readable = true;
    this.destroyed = false;
    this.listeners = /* @__PURE__ */ new Map();
    this.flowing = false;
    this.pausedByUser = false;
    this.started = false;
  }
  on(event, listener) {
    const list = this.listeners.get(event);
    if (list) {
      list.push(listener);
    } else {
      this.listeners.set(event, [listener]);
    }
    if (event === "data" && !this.pausedByUser) {
      this.resume();
    }
    return this;
  }
  addListener(event, listener) {
    return this.on(event, listener);
  }
  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener.apply(this, args);
    };
    return this.on(event, wrapper);
  }
  off(event, listener) {
    const list = this.listeners.get(event);
    if (list) {
      const index = list.indexOf(listener);
      if (index !== -1) {
        list.splice(index, 1);
      }
    }
    return this;
  }
  removeListener(event, listener) {
    return this.off(event, listener);
  }
  removeAllListeners(event) {
    if (event === void 0) {
      this.listeners.clear();
    } else {
      this.listeners.delete(event);
    }
    return this;
  }
  listenerCount(event) {
    const list = this.listeners.get(event);
    return list ? list.length : 0;
  }
  emit(event, ...args) {
    const list = this.listeners.get(event);
    if (!list || list.length === 0) {
      if (event === "error") {
        throw args[0];
      }
      return false;
    }
    for (const listener of list.slice()) {
      listener.apply(this, args);
    }
    return true;
  }
  pause() {
    this.flowing = false;
    this.pausedByUser = true;
    return this;
  }
  resume() {
    this.flowing = true;
    this.pausedByUser = false;
    this.signal();
    if (!this.started) {
      this.started = true;
      void this.pump();
    }
    return this;
  }
  isPaused() {
    return !this.flowing;
  }
  pipe(destination, options) {
    this.on("data", (chunk) => {
      if (destination.write(chunk) === false && destination.once) {
        this.pause();
        destination.once("drain", () => this.resume());
      }
    });
    if ((!options || options.end !== false) && typeof destination.end === "function") {
      this.once("end", () => {
        destination.end();
      });
    }
    this.resume();
    return destination;
  }
  destroy(error) {
    if (this.destroyed) {
      return this;
    }
    this.destroyed = true;
    this.readable = false;
    this.signal();
    if (typeof this.iterator.return === "function") {
      void Promise.resolve(this.iterator.return()).catch(() => void 0);
    }
    if (error) {
      this.emit("error", error);
    }
    this.emit("close");
    return this;
  }
  [Symbol.asyncIterator]() {
    this.started = true;
    return this.iterator;
  }
  signal() {
    const wake = this.wake;
    this.wake = void 0;
    if (wake) {
      wake();
    }
  }
  waitUntilFlowing() {
    if (this.flowing || this.destroyed) {
      return void 0;
    }
    return new Promise((resolve) => {
      this.wake = resolve;
    });
  }
  async pump() {
    try {
      while (true) {
        await this.waitUntilFlowing();
        if (this.destroyed) {
          return;
        }
        const result = await this.iterator.next();
        if (this.destroyed) {
          return;
        }
        if (result.done) {
          break;
        }
        while (!this.flowing && !this.destroyed) {
          await this.waitUntilFlowing();
        }
        if (this.destroyed) {
          return;
        }
        this.emit("data", result.value);
      }
    } catch (error) {
      if (this.destroyed) {
        return;
      }
      this.readable = false;
      this.emit("error", error);
    }
    if (this.destroyed) {
      return;
    }
    this.readable = false;
    this.emit("end");
    this.emit("close");
  }
};

// src/utils.ts
var timeoutErrors = ["timeout", "ENOTFOUND", "ECONNREFUSED", "database lock", "CERT_HAS_EXPIRED", "EHOSTUNREACH", "ECONNRESET", "ERR_TLS_CERT_ALTNAME_INVALID", "EAI_AGAIN"];
function waitForEvent(emitter, eventName) {
  return new Promise((resolve, reject) => {
    emitter.once(eventName, resolve);
  });
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
var nodeStreamModule = () => {
  const proc = globalThis.process;
  if (proc && typeof proc.getBuiltinModule === "function") {
    try {
      return proc.getBuiltinModule("stream");
    } catch (_error) {
      return void 0;
    }
  }
  return void 0;
};
function iteratorStream(iterator) {
  const nodeStream = nodeStreamModule();
  if (!nodeStream) {
    return new IteratorStream(iterator);
  }
  const stream = new nodeStream.PassThrough({ objectMode: true });
  const iterate = async () => {
    for await (const item of iterator) {
      if (!stream.write(item)) {
        await waitForEvent(stream, "drain");
      }
    }
  };
  iterate().then(() => {
    stream.end();
  }).catch((error) => {
    stream.emit("error", error);
    stream.end();
  });
  return stream;
}
function copy(object) {
  return JSON.parse(JSON.stringify(object));
}
var IS_NODE = (() => {
  const proc = globalThis.process;
  return !!(proc && proc.versions && proc.versions.node);
})();
var AttemptTimer = class {
  constructor(url, ms) {
    this.url = url;
    this.ms = ms;
    this.controller = new AbortController();
    this.arm(`network timeout at: ${url}`, "request-timeout");
  }
  /** Response headers arrived: start the separate body timeout. */
  bodyPhase() {
    this.clear();
    this.arm(`Response timeout while trying to fetch ${this.url} (over ${this.ms}ms)`, "body-timeout");
  }
  clear() {
    if (this.timer !== void 0) {
      clearTimeout(this.timer);
      this.timer = void 0;
    }
  }
  arm(message, type) {
    this.timer = setTimeout(() => {
      const error = new Error(message);
      error.name = "FetchError";
      error.type = type;
      this.error = error;
      this.controller.abort();
    }, this.ms);
  }
};
var withErrorCode = (error) => {
  if (error && error.code === void 0 && error.cause && typeof error.cause.code === "string") {
    try {
      error.code = error.cause.code;
    } catch (_error) {
    }
  }
  return error;
};
async function retryingFetch(currentAddress, allAddresses, opts, timeout, failoverThreshold, consoleOnFailover, backoff, fetchTimeout) {
  let start = Date.now();
  let tries = 0;
  let round = 0;
  do {
    try {
      if (fetchTimeout) {
        opts.timeout = fetchTimeout(tries);
      }
      const timer = IS_NODE && opts.timeout > 0 ? new AttemptTimer(currentAddress, opts.timeout) : void 0;
      try {
        const response = await globalThis.fetch(
          currentAddress,
          timer ? { ...opts, signal: timer.controller.signal } : opts
        );
        if (timer) {
          timer.bodyPhase();
        }
        if (!response.ok) {
          if (response.status === 500) {
            const resJson = await response.json();
            if (resJson.jsonrpc === "2.0") {
              return { response: resJson, currentAddress };
            }
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return { response: await response.json(), currentAddress };
      } catch (error) {
        throw timer && timer.error ? timer.error : withErrorCode(error);
      } finally {
        if (timer) {
          timer.clear();
        }
      }
    } catch (error) {
      if (timeout !== 0 && Date.now() - start > timeout) {
        if ((!error || !error.code) && Array.isArray(allAddresses)) {
          currentAddress = failover(
            currentAddress,
            allAddresses,
            currentAddress,
            consoleOnFailover
          );
        } else {
          const isFailoverError = timeoutErrors.filter(
            (fe) => error && typeof error.code === "string" && error.code.includes(fe)
          ).length > 0;
          if (isFailoverError && Array.isArray(allAddresses) && allAddresses.length > 1) {
            if (round < failoverThreshold) {
              start = Date.now();
              tries = -1;
              if (failoverThreshold > 0) {
                round++;
              }
              currentAddress = failover(
                currentAddress,
                allAddresses,
                currentAddress,
                consoleOnFailover
              );
            } else {
              error.message = `[${error.code}] tried ${failoverThreshold} times with ${allAddresses.join(
                ","
              )}`;
              throw error;
            }
          } else {
            console.error(
              `Didn't failover for error ${error.code ? "code" : "message"}: [${error.code || error.message}]`
            );
            throw error;
          }
        }
      }
      await sleep(backoff(tries++));
    }
  } while (true);
}
var failover = (url, urls, currentAddress, consoleOnFailover) => {
  const index = urls.indexOf(url);
  const targetUrl = urls.length === index + 1 ? urls[0] : urls[index + 1];
  if (consoleOnFailover) {
    console.log(`Switched Pixa RPC: ${targetUrl} (previous: ${currentAddress})`);
  }
  return targetUrl;
};
var buildWitnessUpdateOp = (owner, props) => requireCrypto("utils.buildWitnessUpdateOp").buildWitnessUpdateOp(owner, props);
var operationOrders = {
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
};
function makeBitMaskFilter(allowedOperations) {
  return allowedOperations.reduce(redFunction, [0n, 0n]).map((value) => value !== 0n ? value.toString() : null);
}
var redFunction = ([low, high], allowedOperation) => {
  if (allowedOperation < 64) {
    return [low | 1n << BigInt(allowedOperation), high];
  } else {
    return [low, high | 1n << BigInt(allowedOperation - 64)];
  }
};

// src/helpers/blockchain.ts
var BlockchainMode = /* @__PURE__ */ ((BlockchainMode2) => {
  BlockchainMode2[BlockchainMode2["Irreversible"] = 0] = "Irreversible";
  BlockchainMode2[BlockchainMode2["Latest"] = 1] = "Latest";
  return BlockchainMode2;
})(BlockchainMode || {});
var Blockchain = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Get latest block number.
   */
  async getCurrentBlockNum(mode = 0 /* Irreversible */) {
    const props = await this.client.database.getDynamicGlobalProperties();
    switch (mode) {
      case 0 /* Irreversible */:
        return props.last_irreversible_block_num;
      case 1 /* Latest */:
        return props.head_block_number;
    }
  }
  /**
   * Get latest block header.
   */
  async getCurrentBlockHeader(mode) {
    return this.client.database.getBlockHeader(
      await this.getCurrentBlockNum(mode)
    );
  }
  /**
   * Get latest block.
   */
  async getCurrentBlock(mode) {
    return this.client.database.getBlock(await this.getCurrentBlockNum(mode));
  }
  /**
   * Return a asynchronous block number iterator.
   * @param options Feed options, can also be a block number to start from.
   */
  async *getBlockNumbers(options) {
    const interval = 3;
    if (!options) {
      options = {};
    } else if (typeof options === "number") {
      options = { from: options };
    }
    let current = await this.getCurrentBlockNum(options.mode);
    if (options.from !== void 0 && options.from > current) {
      throw new Error(
        `From can't be larger than current block num (${current})`
      );
    }
    let seen = options.from !== void 0 ? options.from : current;
    while (true) {
      while (current > seen) {
        yield seen++;
        if (options.to !== void 0 && seen > options.to) {
          return;
        }
      }
      await sleep(interval * 1e3);
      current = await this.getCurrentBlockNum(options.mode);
    }
  }
  /**
   * Return a stream of block numbers, accepts same parameters as {@link getBlockNumbers}.
   */
  getBlockNumberStream(options) {
    return iteratorStream(this.getBlockNumbers(options));
  }
  /**
   * Return a asynchronous block iterator, accepts same parameters as {@link getBlockNumbers}.
   */
  async *getBlocks(options) {
    for await (const num of this.getBlockNumbers(options)) {
      yield await this.client.database.getBlock(num);
    }
  }
  /**
   * Return a stream of blocks, accepts same parameters as {@link getBlockNumbers}.
   */
  getBlockStream(options) {
    return iteratorStream(this.getBlocks(options));
  }
  /**
   * Return a asynchronous operation iterator, accepts same parameters as {@link getBlockNumbers}.
   */
  async *getOperations(options) {
    for await (const num of this.getBlockNumbers(options)) {
      const operations = await this.client.database.getOperations(num);
      for (const operation of operations) {
        yield operation;
      }
    }
  }
  /**
   * Return a stream of operations, accepts same parameters as {@link getBlockNumbers}.
   */
  getOperationsStream(options) {
    return iteratorStream(this.getOperations(options));
  }
};

// src/assert.ts
var AssertionError = class extends Error {
  constructor(message) {
    super(message);
    this.code = "ERR_ASSERTION";
    this.name = "AssertionError";
  }
};
var fail = (message, fallback) => {
  throw new AssertionError(message !== void 0 ? message : fallback);
};
var assert = Object.assign(
  (value, message) => {
    if (!value) {
      fail(message, "false == true");
    }
  },
  {
    deepEqual: (actual, expected, message) => {
      let equal = actual.length === expected.length;
      for (let i = 0; equal && i < actual.length; i++) {
        equal = actual[i] === expected[i];
      }
      if (!equal) {
        fail(message, "byte arrays are not equal");
      }
    },
    equal: (actual, expected, message) => {
      if (actual != expected) {
        fail(message, `${String(actual)} == ${String(expected)}`);
      }
    }
  }
);
var assert_default = assert;

// src/chain/asset.ts
var Asset = class _Asset {
  constructor(amount, symbol) {
    this.amount = amount;
    this.symbol = symbol;
  }
  /**
   * Create a new Asset instance from a string, e.g. `42.000 PIXA`.
   */
  static fromString(string, expectedSymbol) {
    const [amountString, symbol] = string.split(" ");
    if (!["PXA", "HIVE", "PIXA", "TESTS", "PXP", "VESTS", "PXS", "TBD", "STEEM", "TPS", "SBD", "HBD"].includes(symbol)) {
      throw new Error(`Invalid asset symbol: ${symbol}`);
    }
    if (expectedSymbol && symbol !== expectedSymbol) {
      throw new Error(
        `Invalid asset, expected symbol: ${expectedSymbol} got: ${symbol}`
      );
    }
    const amount = Number.parseFloat(amountString);
    if (!Number.isFinite(amount)) {
      throw new Error(`Invalid asset amount: ${amountString}`);
    }
    return new _Asset(amount, symbol);
  }
  /**
   * Convenience to create new Asset.
   * @param symbol Symbol to use when created from number. Will also be used to validate
   *               the asset, throws if the passed value has a different symbol than this.
   */
  static from(value, symbol) {
    if (value instanceof _Asset) {
      if (symbol && value.symbol !== symbol) {
        throw new Error(
          `Invalid asset, expected symbol: ${symbol} got: ${value.symbol}`
        );
      }
      return value;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      return new _Asset(value, symbol || "STEEM");
    } else if (typeof value === "string") {
      return _Asset.fromString(value, symbol);
    } else {
      throw new Error(`Invalid asset '${String(value)}'`);
    }
  }
  /**
   * Return the smaller of the two assets.
   */
  static min(a, b) {
    assert_default(
      a.symbol === b.symbol,
      "can not compare assets with different symbols"
    );
    return a.amount < b.amount ? a : b;
  }
  /**
   * Return the larger of the two assets.
   */
  static max(a, b) {
    assert_default(
      a.symbol === b.symbol,
      "can not compare assets with different symbols"
    );
    return a.amount > b.amount ? a : b;
  }
  /**
   * Return asset precision.
   */
  getPrecision() {
    switch (this.symbol) {
      case "VESTS":
        return 6;
      default:
        return 3;
    }
  }
  /**
   * returns a representation of this asset using only STEEM SBD for
   * legacy purposes
   */
  steem_symbols() {
    switch (this.symbol) {
      case "STEEM":
        return _Asset.from(this.amount, "PIXA");
      case "SBD":
        return _Asset.from(this.amount, "PXS");
      default:
        return this;
    }
  }
  /**
   * Return a string representation of this asset, e.g. `42.000 PIXA`.
   */
  toString() {
    return `${this.amount.toFixed(this.getPrecision())} ${this.symbol}`;
  }
  /**
   * Return a new Asset instance with amount added.
   */
  add(amount) {
    const other = _Asset.from(amount, this.symbol);
    assert_default(this.symbol === other.symbol, "can not add with different symbols");
    return new _Asset(this.amount + other.amount, this.symbol);
  }
  /**
   * Return a new Asset instance with amount subtracted.
   */
  subtract(amount) {
    const other = _Asset.from(amount, this.symbol);
    assert_default(
      this.symbol === other.symbol,
      "can not subtract with different symbols"
    );
    return new _Asset(this.amount - other.amount, this.symbol);
  }
  /**
   * Return a new Asset with the amount multiplied by factor.
   */
  multiply(factor) {
    const other = _Asset.from(factor, this.symbol);
    assert_default(
      this.symbol === other.symbol,
      "can not multiply with different symbols"
    );
    return new _Asset(this.amount * other.amount, this.symbol);
  }
  /**
   * Return a new Asset with the amount divided.
   */
  divide(divisor) {
    const other = _Asset.from(divisor, this.symbol);
    assert_default(
      this.symbol === other.symbol,
      "can not divide with different symbols"
    );
    return new _Asset(this.amount / other.amount, this.symbol);
  }
  /**
   * For JSON serialization, same as toString().
   */
  toJSON() {
    return this.toString();
  }
};
var Price = class _Price {
  /**
   * @param base  - represents a value of the price object to be expressed relatively to quote
   *                asset. Cannot have amount == 0 if you want to build valid price.
   * @param quote - represents an relative asset. Cannot have amount == 0, otherwise
   *                asertion fail.
   *
   * Both base and quote shall have different symbol defined.
   */
  constructor(base, quote) {
    this.base = base;
    this.quote = quote;
    assert_default(
      base.amount !== 0 && quote.amount !== 0,
      "base and quote assets must be non-zero"
    );
    assert_default(
      base.symbol !== quote.symbol,
      "base and quote can not have the same symbol"
    );
  }
  /**
   * Convenience to create new Price.
   */
  static from(value) {
    if (value instanceof _Price) {
      return value;
    } else {
      return new _Price(Asset.from(value.base), Asset.from(value.quote));
    }
  }
  /**
   * Return a string representation of this price pair.
   */
  toString() {
    return `${this.base}:${this.quote}`;
  }
  /**
   * Return a new Asset with the price converted between the symbols in the pair.
   * Throws if passed asset symbol is not base or quote.
   */
  convert(asset) {
    if (asset.symbol === this.base.symbol) {
      assert_default(this.base.amount > 0);
      return new Asset(
        asset.amount * this.quote.amount / this.base.amount,
        this.quote.symbol
      );
    } else if (asset.symbol === this.quote.symbol) {
      assert_default(this.quote.amount > 0);
      return new Asset(
        asset.amount * this.base.amount / this.quote.amount,
        this.base.symbol
      );
    } else {
      throw new Error(`Can not convert ${asset} with ${this}`);
    }
  }
};

// src/helpers/database.ts
var DatabaseAPI = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Convenience for calling `database_api`.
   */
  call(method, params) {
    return this.client.call("condenser_api", method, params);
  }
  /**
   * Return state of server.
   */
  getDynamicGlobalProperties() {
    return this.call("get_dynamic_global_properties");
  }
  /**
   * Return median chain properties decided by witness.
   */
  async getChainProperties() {
    return this.call("get_chain_properties");
  }
  /**
   * Return all of the state required for a particular url path.
   * @param path Path component of url conforming to condenser's scheme
   *             e.g. `@almost-digital` or `trending/travel`
   */
  async getState(path) {
    return this.call("get_state", [path]);
  }
  /**
   * Return median price in PXS for 1 PIXA as reported by the witnesses.
   */
  async getCurrentMedianHistoryPrice() {
    return Price.from(await this.call("get_current_median_history_price"));
  }
  /**
   * Get list of delegations made by account.
   * @param account Account delegating
   * @param from Delegatee start offset, used for paging.
   * @param limit Number of results, max 1000.
   */
  async getVestingDelegations(account, from = "", limit = 1e3) {
    return this.call("get_vesting_delegations", [account, from, limit]);
  }
  /**
   * Return server config. See:
   * https://github.com/steemit/steem/blob/master/libraries/protocol/include/steemit/protocol/config.hpp
   */
  getConfig() {
    return this.call("get_config");
  }
  /**
   * Return header for *blockNum*.
   */
  getBlockHeader(blockNum) {
    return this.call("get_block_header", [blockNum]);
  }
  /**
   * Return block *blockNum*.
   */
  getBlock(blockNum) {
    return this.call("get_block", [blockNum]);
  }
  /**
   * Return all applied operations in *blockNum*.
   */
  getOperations(blockNum, onlyVirtual = false) {
    return this.call("get_ops_in_block", [blockNum, onlyVirtual]);
  }
  /**
   * Return array of discussions (a.k.a. posts).
   * @param by The type of sorting for the discussions, valid options are:
   *           `active` `blog` `cashout` `children` `comments` `created`
   *           `feed` `hot` `promoted` `trending` `votes`. Note that
   *           for `blog` and `feed` the tag is set to a username.
   */
  getDiscussions(by, query) {
    return this.call(`get_discussions_by_${by}`, [query]);
  }
  /**
   * Return array of account info objects for the usernames passed.
   * @param usernames The accounts to fetch.
   */
  getAccounts(usernames) {
    return this.call("get_accounts", [usernames]);
  }
  /**
   * Returns the details of a transaction based on a transaction id.
   */
  async getTransaction(txId) {
    return this.call("get_transaction", [txId]);
  }
  /**
   * Returns one or more account history objects for account operations
   *
   * @param account The account to fetch
   * @param from The starting index
   * @param limit The maximum number of results to return
   * @param operations_bitmask Generated by dpixa.utils.makeBitMaskFilter() - see example below
   * @example
   * const op = dpixa.utils.operationOrders
   * const operationsBitmask = dpixa.utils.makeBitMaskFilter([
   *   op.transfer,
   *   op.transfer_to_vesting,
   *   op.withdraw_vesting,
   *   op.interest,
   *   op.liquidity_reward,
   *   op.transfer_to_savings,
   *   op.transfer_from_savings,
   *   op.escrow_transfer,
   *   op.cancel_transfer_from_savings,
   *   op.escrow_approve,
   *   op.escrow_dispute,
   *   op.escrow_release,
   *   op.fill_convert_request,
   *   op.fill_order,
   *   op.claim_reward_balance,
   * ])
   */
  getAccountHistory(account, from, limit, operation_bitmask) {
    let params = [account, from, limit];
    if (operation_bitmask && Array.isArray(operation_bitmask)) {
      if (operation_bitmask.length !== 2) {
        throw Error(
          "operation_bitmask should be generated by the helper function"
        );
      }
      params = params.concat(operation_bitmask);
    }
    return this.call("get_account_history", params);
  }
  /**
   * Verify signed transaction.
   */
  async verifyAuthority(stx) {
    return this.call("verify_authority", [stx]);
  }
  /** return rpc node version */
  async getVersion() {
    return this.call("get_version", []);
  }
};

// src/bbuffer.ts
var HEX_CHARS = "0123456789abcdef";
function bytesToHex(bytes, start = 0, end = bytes.length) {
  let out = "";
  for (let i = start; i < end; i++) {
    const b = bytes[i];
    out += HEX_CHARS[b >>> 4] + HEX_CHARS[b & 15];
  }
  return out;
}
function hexToBytes(hex) {
  if (hex.length >= 2 && hex[0] === "0" && (hex[1] === "x" || hex[1] === "X")) {
    hex = hex.slice(2);
  }
  if (hex.length % 2 !== 0) {
    hex = "0" + hex;
  }
  const out = new Uint8Array(hex.length >>> 1);
  for (let i = 0; i < out.length; i++) {
    const hi = parseHexChar(hex.charCodeAt(i * 2));
    const lo = parseHexChar(hex.charCodeAt(i * 2 + 1));
    if (hi < 0 || lo < 0) {
      throw new Error(`Invalid hex string at position ${i * 2}`);
    }
    out[i] = hi << 4 | lo;
  }
  return out;
}
function parseHexChar(code) {
  if (code >= 48 && code <= 57) return code - 48;
  if (code >= 97 && code <= 102) return code - 87;
  if (code >= 65 && code <= 70) return code - 55;
  return -1;
}
function binaryToBytes(str) {
  const out = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    out[i] = str.charCodeAt(i) & 255;
  }
  return out;
}
function bytesToBinary(bytes, start = 0, end = bytes.length) {
  let out = "";
  const CHUNK = 32768;
  for (let i = start; i < end; i += CHUNK) {
    const slice = bytes.subarray(i, Math.min(i + CHUNK, end));
    out += String.fromCharCode.apply(null, slice);
  }
  return out;
}
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder("utf-8");
function utf8ToBytes(str) {
  return textEncoder.encode(str);
}
function bytesToUtf8(bytes, start = 0, end = bytes.length) {
  return textDecoder.decode(bytes.subarray(start, end));
}
function encodeString(str, encoding) {
  switch (encoding) {
    case "hex":
      return hexToBytes(str);
    case "binary":
    case "latin1":
      return binaryToBytes(str);
    case "utf-8":
    case "utf8":
      return utf8ToBytes(str);
    default:
      throw new Error(`Unsupported encoding: ${encoding}`);
  }
}
function decodeBytes(bytes, encoding, start = 0, end = bytes.length) {
  switch (encoding) {
    case "hex":
      return bytesToHex(bytes, start, end);
    case "binary":
    case "latin1":
      return bytesToBinary(bytes, start, end);
    case "utf-8":
    case "utf8":
      return bytesToUtf8(bytes, start, end);
    default:
      throw new Error(`Unsupported encoding: ${encoding}`);
  }
}
var BBuffer = class _BBuffer extends Uint8Array {
  /* ---- static factories ---- */
  /**
   * Allocate a new zero-filled buffer of the given size.
   * The optional `fill` argument is a byte value (0-255) to pre-fill with.
   */
  static alloc(size, fill = 0) {
    const buf = new _BBuffer(size);
    if (fill !== 0) buf.fill(fill);
    return buf;
  }
  static from(value, encoding = "utf-8") {
    if (typeof value === "string") {
      const bytes = encodeString(value, encoding);
      return _BBuffer.fromUint8Array(bytes);
    }
    if (value instanceof _BBuffer) {
      const out2 = new _BBuffer(value.length);
      out2.set(value);
      return out2;
    }
    if (value instanceof Uint8Array) {
      const out2 = new _BBuffer(value.length);
      out2.set(value);
      return out2;
    }
    if (value instanceof ArrayBuffer) {
      const view = new Uint8Array(value);
      const out2 = new _BBuffer(view.length);
      out2.set(view);
      return out2;
    }
    const arr = value;
    const out = new _BBuffer(arr.length);
    for (let i = 0; i < arr.length; i++) out[i] = arr[i] & 255;
    return out;
  }
  /** Concatenate a list of Uint8Arrays / BBuffers into a single new buffer. */
  static concat(list, totalLength) {
    if (totalLength === void 0) {
      totalLength = 0;
      for (const item of list) totalLength += item.length;
    }
    const out = new _BBuffer(totalLength);
    let offset = 0;
    for (const item of list) {
      if (offset + item.length > totalLength) {
        out.set(item.subarray(0, totalLength - offset), offset);
        break;
      }
      out.set(item, offset);
      offset += item.length;
    }
    return out;
  }
  /** Internal helper: wrap a Uint8Array in a BBuffer with its own memory. */
  static fromUint8Array(bytes) {
    const out = new _BBuffer(bytes.length);
    out.set(bytes);
    return out;
  }
  /* ---- instance methods ---- */
  /**
   * Return a string in the given encoding. Defaults to utf-8 so that calls
   * like `buf.toString()` behave like Node.js `Buffer`.
   */
  toString(encoding = "utf-8", start = 0, end = this.length) {
    return decodeBytes(this, encoding, start, end);
  }
  /**
   * Return an *independent* copy of the sub-range. Node's `Buffer.slice`
   * returns a view that aliases the original; that aliasing is one of the
   * classes of bug this module is meant to prevent, so we always copy.
   */
  slice(begin = 0, end = this.length) {
    const len = this.length;
    let s = begin < 0 ? Math.max(len + begin, 0) : Math.min(begin, len);
    let e = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
    if (e < s) e = s;
    const out = new _BBuffer(e - s);
    out.set(super.subarray(s, e));
    return out;
  }
  /** Read a single unsigned byte. */
  readUInt8(offset = 0) {
    if (offset < 0 || offset >= this.length) {
      throw new RangeError(`readUInt8 out of range: ${offset}`);
    }
    return this[offset];
  }
  /** Write a single unsigned byte. Returns new offset like Node. */
  writeUInt8(value, offset = 0) {
    if (offset < 0 || offset >= this.length) {
      throw new RangeError(`writeUInt8 out of range: ${offset}`);
    }
    this[offset] = value & 255;
    return offset + 1;
  }
  /**
   * Read an unsigned little-endian 16/32-bit integer at `offset`.
   * Matches Node.js `Buffer.prototype.readUInt{16,32}LE`.
   */
  readUInt16LE(offset = 0) {
    if (offset < 0 || offset + 2 > this.length) {
      throw new RangeError(`readUInt16LE out of range: ${offset}`);
    }
    return this[offset] | this[offset + 1] << 8;
  }
  readUInt32LE(offset = 0) {
    if (offset < 0 || offset + 4 > this.length) {
      throw new RangeError(`readUInt32LE out of range: ${offset}`);
    }
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24) >>> 0;
  }
  /** Big-endian variants, for completeness. */
  readUInt16BE(offset = 0) {
    if (offset < 0 || offset + 2 > this.length) {
      throw new RangeError(`readUInt16BE out of range: ${offset}`);
    }
    return this[offset] << 8 | this[offset + 1];
  }
  readUInt32BE(offset = 0) {
    if (offset < 0 || offset + 4 > this.length) {
      throw new RangeError(`readUInt32BE out of range: ${offset}`);
    }
    return (this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]) >>> 0;
  }
  /**
   * Copy bytes from this buffer into `target`, starting at `targetStart`,
   * reading `[sourceStart, sourceEnd)` of this buffer. Mirrors Node's
   * `Buffer.prototype.copy` return value (number of bytes copied).
   */
  copy(target, targetStart = 0, sourceStart = 0, sourceEnd = this.length) {
    if (sourceEnd > this.length) sourceEnd = this.length;
    if (sourceStart < 0) sourceStart = 0;
    if (sourceEnd <= sourceStart) return 0;
    const available = target.length - targetStart;
    const want = sourceEnd - sourceStart;
    const n = Math.min(available, want);
    if (n <= 0) return 0;
    target.set(super.subarray(sourceStart, sourceStart + n), targetStart);
    return n;
  }
};

// src/chain/misc.ts
var HexBuffer = class _HexBuffer {
  constructor(buffer) {
    this.buffer = buffer;
  }
  /**
   * Convenience to create a new HexBuffer, does not copy data if value passed is already a buffer.
   *
   * Accepts any Uint8Array-backed buffer, which includes the bundled BBuffer,
   * Node's native Buffer, and plain Uint8Array. Previously the parameter was
   * typed as just `Buffer` (= BBuffer in this file) which rejected Node
   * Buffers even though they work identically at runtime — broke the
   * operations test suite under strict TS.
   */
  static from(value) {
    if (value instanceof _HexBuffer) {
      return value;
    } else if (value instanceof Uint8Array) {
      return new _HexBuffer(BBuffer.from(value));
    } else if (typeof value === "string") {
      return new _HexBuffer(BBuffer.from(value, "hex"));
    } else {
      return new _HexBuffer(BBuffer.from(value));
    }
  }
  toString(encoding = "hex") {
    return this.buffer.toString(encoding);
  }
  toJSON() {
    return this.toString();
  }
};
function getVestingSharePrice(props) {
  const totalVestingFund = Asset.from(props.total_vesting_fund_pixa);
  const totalVestingShares = Asset.from(props.total_vesting_shares);
  if (totalVestingFund.amount === 0 || totalVestingShares.amount === 0) {
    return new Price(new Asset(1, "VESTS"), new Asset(1, "PIXA"));
  }
  return new Price(totalVestingShares, totalVestingFund);
}
function getVests(account, subtract_delegated = true, add_received = true) {
  let vests = Asset.from(account.vesting_shares);
  const vests_delegated = Asset.from(account.delegated_vesting_shares);
  const vests_received = Asset.from(account.received_vesting_shares);
  const withdraw_rate = Asset.from(account.vesting_withdraw_rate);
  const already_withdrawn = (Number(account.to_withdraw) - Number(account.withdrawn)) / 1e6;
  const withdraw_vests = Math.min(withdraw_rate.amount, already_withdrawn);
  vests = vests.subtract(withdraw_vests);
  if (subtract_delegated) {
    vests = vests.subtract(vests_delegated);
  }
  if (add_received) {
    vests = vests.add(vests_received);
  }
  return vests.amount;
}

// src/helpers/rc.ts
var RCAPI = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Convenience for calling `rc_api`.
   */
  call(method, params) {
    return this.client.call("rc_api", method, params);
  }
  /**
   * Returns RC data for array of usernames
   */
  async findRCAccounts(usernames) {
    return (await this.call("find_rc_accounts", { accounts: usernames })).rc_accounts;
  }
  /**
   * Returns the global resource params
   */
  async getResourceParams() {
    return (await this.call("get_resource_params", {})).resource_params;
  }
  /**
   * Returns the global resource pool
   */
  async getResourcePool() {
    return (await this.call("get_resource_pool", {})).resource_pool;
  }
  /**
   * Makes a API call and returns the RC mana-data for a specified username
   */
  async getRCMana(username) {
    const rc_account = (await this.findRCAccounts([username]))[0];
    return this.calculateRCMana(rc_account);
  }
  /**
   * Makes a API call and returns the VP mana-data for a specified username
   */
  async getVPMana(username) {
    const account = (await this.client.call("condenser_api", "get_accounts", [[username]]))[0];
    return this.calculateVPMana(account);
  }
  /**
   * Calculates the RC mana-data based on an RCAccount - findRCAccounts()
   */
  calculateRCMana(rc_account) {
    return this._calculateManabar(
      Number(rc_account.max_rc),
      rc_account.rc_manabar
    );
  }
  /**
   * Calculates the RC mana-data based on an Account - getAccounts()
   */
  calculateVPMana(account) {
    const max_mana = getVests(account) * Math.pow(10, 6);
    return this._calculateManabar(max_mana, account.voting_manabar);
  }
  /**
   * Internal convenience method to reduce redundant code
   */
  _calculateManabar(max_mana, { current_mana, last_update_time }) {
    const delta = Date.now() / 1e3 - last_update_time;
    current_mana = Number(current_mana) + delta * max_mana / 432e3;
    let percentage = Math.round(current_mana / max_mana * 1e4);
    if (!isFinite(percentage) || percentage < 0) {
      percentage = 0;
    } else if (percentage > 1e4) {
      percentage = 1e4;
    }
    return { current_mana, max_mana, percentage };
  }
};

// src/helpers/key.ts
var AccountByKeyAPI = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Convenience for calling `account_by_key_api`.
   */
  call(method, params) {
    return this.client.call("account_by_key_api", method, params);
  }
  /**
   * Returns all accounts that have the key associated with their owner or active authorities.
   */
  async getKeyReferences(keys) {
    return this.call("get_key_references", { keys: keys.map((key) => key.toString()) });
  }
};

// src/helpers/pixamind.ts
var PixamindAPI = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Convenience of calling pixamind api
   * @param method
   * @param params
   */
  call(method, params) {
    return this.client.call("bridge", method, params);
  }
  /**
   * Get trending, hot, recent community posts from Pixamind
   * @param options
   */
  getRankedPosts(options) {
    return this.call("get_ranked_posts", options);
  }
  /**
   * Get posts by particular account from Pixamind
   * @param options
   */
  getAccountPosts(options) {
    return this.call("get_account_posts", options);
  }
  /**
   * Get community details such as who are the admin,
   * moderators, how many subscribers, etc..
   * @param options
   */
  getCommunity(options) {
    return this.call("get_community", options);
  }
  /**
   * List all subscriptions by particular account
   * @param account the account you want to query
   * @returns {Array} return role, what community the account joined
   */
  listAllSubscriptions(account) {
    return this.call("list_all_subscriptions", account);
  }
  /**
   * Get particular account notifications feed
   * @param options
   */
  getAccountNotifications(options) {
    return this.call("account_notifications", options);
  }
  /**
   * List all available communities on pixamind
   * @param options
   */
  listCommunities(options) {
    return this.call("list_communities", options);
  }
};

// src/chain/account.ts
var Authority = class _Authority {
  constructor({ weight_threshold, account_auths, key_auths }) {
    this.weight_threshold = weight_threshold;
    this.account_auths = account_auths;
    this.key_auths = key_auths;
  }
  /**
   * Convenience to create a new instance from PublicKey or authority object.
   */
  static from(value) {
    const PublicKeyClass = peekCrypto()?.PublicKey;
    if (value instanceof _Authority) {
      return value;
    } else if (typeof value === "string" || PublicKeyClass !== void 0 && value instanceof PublicKeyClass) {
      return new _Authority({
        account_auths: [],
        key_auths: [[value, 1]],
        weight_threshold: 1
      });
    } else {
      return new _Authority(value);
    }
  }
};

// src/errors.ts
var VError = class extends Error {
  constructor(options, message) {
    super(options.cause ? `${message}: ${options.cause.message}` : message);
    if (options.name) {
      this.name = options.name;
    }
    this.jse_shortmsg = message;
    if (options.cause) {
      this.jse_cause = options.cause;
    }
    this.jse_info = {};
    if (options.info) {
      for (const key in options.info) {
        this.jse_info[key] = options.info[key];
      }
    }
  }
  /**
   * Return the underlying error, if any (same as verror's `cause()`).
   */
  cause() {
    return this.jse_cause;
  }
};
VError.prototype.name = "VError";

// src/version.ts
var version_default = "1.6.0";

// src/parameters.ts
var MAINNET_HEX_CHAIN_ID = "706978616772616d000000000000000000000000000000000000000000000000";
var TESTNET_HEX_CHAIN_ID = "18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e";
var PREFIX_MAINNET_ADDRESS = "PIX";
var PREFIX_TESTNET_ADDRESS = "TST";
var MAIN_MAINNET_NODE_URL = "https://api.pixagram.com";
var MAIN_TESTNET_NODE_URL = "https://api.pixagram.com";

// src/helpers/broadcast.ts
var BroadcastAPI = class {
  constructor(client) {
    this.client = client;
    /**
     * How many milliseconds in the future to set the expiry time to when
     * broadcasting a transaction, defaults to 1 minute.
     */
    this.expireTime = 60 * 1e3;
  }
  /**
   * Broadcast a comment, also used to create a new top level post.
   * @param comment The comment/post.
   * @param key Private posting key of comment author.
   */
  async comment(comment, key) {
    const op = ["comment", comment];
    return this.sendOperations([op], key);
  }
  /**
   * Broadcast a comment and set the options.
   * @param comment The comment/post.
   * @param options The comment/post options.
   * @param key Private posting key of comment author.
   */
  async commentWithOptions(comment, options, key) {
    const ops = [
      ["comment", comment],
      ["comment_options", options]
    ];
    return this.sendOperations(ops, key);
  }
  /**
   * Broadcast a vote.
   * @param vote The vote to send.
   * @param key Private posting key of the voter.
   */
  async vote(vote, key) {
    const op = ["vote", vote];
    return this.sendOperations([op], key);
  }
  /**
   * Broadcast a transfer.
   * @param data The transfer operation payload.
   * @param key Private active key of sender.
   */
  async transfer(data, key) {
    const op = ["transfer", data];
    return this.sendOperations([op], key);
  }
  /**
   * Broadcast custom JSON.
   * @param data The custom_json operation payload.
   * @param key Private posting or active key.
   */
  async json(data, key) {
    const op = ["custom_json", data];
    return this.sendOperations([op], key);
  }
  /**
   * Create a new account on testnet.
   * @param options New account options.
   * @param key Private active key of account creator.
   */
  async createTestAccount(options, key) {
    assert_default(
      Object.prototype.hasOwnProperty.call(globalThis, "it"),
      "helper to be used only for mocha tests"
    );
    const cryptoImpl = requireCrypto("client.broadcast.createTestAccount");
    const { username, metadata, creator } = options;
    const prefix = this.client.addressPrefix;
    let owner, active, posting, memo_key;
    if (options.password) {
      const ownerKey = cryptoImpl.PrivateKey.fromLogin(
        username,
        options.password,
        "owner"
      ).createPublic(prefix);
      owner = Authority.from(ownerKey);
      const activeKey = cryptoImpl.PrivateKey.fromLogin(
        username,
        options.password,
        "active"
      ).createPublic(prefix);
      active = Authority.from(activeKey);
      const postingKey = cryptoImpl.PrivateKey.fromLogin(
        username,
        options.password,
        "posting"
      ).createPublic(prefix);
      posting = Authority.from(postingKey);
      memo_key = cryptoImpl.PrivateKey.fromLogin(
        username,
        options.password,
        "memo"
      ).createPublic(prefix);
    } else if (options.auths) {
      owner = Authority.from(options.auths.owner);
      active = Authority.from(options.auths.active);
      posting = Authority.from(options.auths.posting);
      memo_key = cryptoImpl.PublicKey.from(options.auths.memoKey);
    } else {
      throw new Error("Must specify either password or auths");
    }
    let { fee, delegation } = options;
    delegation = Asset.from(delegation || 0, "VESTS");
    fee = Asset.from(fee || 0, "TESTS");
    if (fee.amount > 0) {
      const chainProps = await this.client.database.getChainProperties();
      const creationFee = Asset.from(chainProps.account_creation_fee);
      if (fee.amount !== creationFee.amount) {
        throw new Error("Fee must be exactly " + creationFee.toString());
      }
    }
    const claim_op = [
      "claim_account",
      {
        creator,
        extensions: [],
        fee
      }
    ];
    const create_op = [
      "create_claimed_account",
      {
        active,
        creator,
        extensions: [],
        json_metadata: metadata ? JSON.stringify(metadata) : "",
        memo_key,
        new_account_name: username,
        owner,
        posting
      }
    ];
    const ops = [claim_op, create_op];
    if (delegation.amount > 0) {
      const delegate_op = [
        "delegate_vesting_shares",
        {
          delegatee: username,
          delegator: creator,
          vesting_shares: delegation
        }
      ];
      ops.push(delegate_op);
    }
    return this.sendOperations(ops, key);
  }
  /**
   * Update account.
   * @param data The account_update payload.
   * @param key The private key of the account affected, should be the corresponding
   *            key level or higher for updating account authorities.
   */
  async updateAccount(data, key) {
    const op = ["account_update", data];
    return this.sendOperations([op], key);
  }
  /**
   * Delegate vesting shares from one account to the other. The vesting shares are still owned
   * by the original account, but content voting rights and bandwidth allocation are transferred
   * to the receiving account. This sets the delegation to `vesting_shares`, increasing it or
   * decreasing it as needed. (i.e. a delegation of 0 removes the delegation)
   *
   * When a delegation is removed the shares are placed in limbo for a week to prevent a satoshi
   * of VESTS from voting on the same content twice.
   *
   * @param options Delegation options.
   * @param key Private active key of the delegator.
   */
  async delegateVestingShares(options, key) {
    const op = ["delegate_vesting_shares", options];
    return this.sendOperations([op], key);
  }
  /**
   * Sign and broadcast transaction with operations to the network. Throws if the transaction expires.
   * @param operations List of operations to send.
   * @param key Private key(s) used to sign transaction.
   */
  async sendOperations(operations, key) {
    requireCrypto("client.broadcast.sendOperations");
    const props = await this.client.database.getDynamicGlobalProperties();
    const ref_block_num = props.head_block_number & 65535;
    const ref_block_prefix = BBuffer.from(
      props.head_block_id,
      "hex"
    ).readUInt32LE(4);
    const expiration = new Date(
      (/* @__PURE__ */ new Date(props.time + "Z")).getTime() + this.expireTime
    ).toISOString().slice(0, -5);
    const extensions = [];
    const tx = {
      expiration,
      extensions,
      operations,
      ref_block_num,
      ref_block_prefix
    };
    const result = await this.send(this.sign(tx, key));
    return result;
  }
  /**
   * Sign a transaction with key(s).
   */
  sign(transaction, key) {
    return requireCrypto("client.broadcast.sign").signTransaction(transaction, key, this.client.chainId);
  }
  /**
   * Broadcast a signed transaction to the network.
   */
  async send(transaction) {
    const trxId = requireCrypto("client.broadcast.send").generateTrxId(transaction);
    const result = await this.call("broadcast_transaction", [transaction]);
    return Object.assign({ id: trxId }, result);
  }
  /**
   * Convenience for calling `condenser_api`.
   */
  call(method, params) {
    return this.client.call("condenser_api", method, params);
  }
};

// src/helpers/transaction.ts
var TransactionStatusAPI = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * Convenience for calling `transaction_status_api`.
   */
  call(method, params) {
    return this.client.call("transaction_status_api", method, params);
  }
  /**
   * Returns the status of a given transaction id
   */
  async findTransaction(transaction_id, expiration) {
    const params = {
      transaction_id
    };
    if (expiration) {
      params.expiration = expiration;
    }
    return this.call("find_transaction", params);
  }
};

// src/client.ts
var VERSION = version_default;
var DEFAULT_CHAIN_ID = BBuffer.from(
  MAINNET_HEX_CHAIN_ID,
  "hex"
);
var DEFAULT_ADDRESS_PREFIX = PREFIX_MAINNET_ADDRESS;
var Client = class _Client {
  /**
   * @param address The address to the Pixa RPC server,
   * e.g. `https://api.pixagram.com`. or [`https://api.pixagram.com`, `https://another.api.com`]
   * @param options Client options.
   */
  constructor(address, options = {}) {
    if (options.rebrandedApi) {
      console.log("Warning: rebrandedApi is deprecated and safely can be removed from client options");
    }
    this.currentAddress = (Array.isArray(address) ? address[0] : address) || MAIN_MAINNET_NODE_URL;
    this.address = address || [MAIN_MAINNET_NODE_URL];
    this.options = options;
    this.chainId = options.chainId ? BBuffer.from(options.chainId, "hex") : DEFAULT_CHAIN_ID;
    assert_default.equal(this.chainId.length, 32, "invalid chain id");
    this.addressPrefix = options.addressPrefix || DEFAULT_ADDRESS_PREFIX;
    this.timeout = options.timeout || 60 * 1e3;
    this.backoff = options.backoff || defaultBackoff;
    this.failoverThreshold = options.failoverThreshold || 3;
    this.consoleOnFailover = options.consoleOnFailover || false;
    this.database = new DatabaseAPI(this);
    this.broadcast = new BroadcastAPI(this);
    this.blockchain = new Blockchain(this);
    this.rc = new RCAPI(this);
    this.pixamind = new PixamindAPI(this);
    this.keys = new AccountByKeyAPI(this);
    this.transaction = new TransactionStatusAPI(this);
  }
  /**
   * Create a new client instance configured for the testnet.
   */
  static testnet(options) {
    let opts = {};
    if (options) {
      opts = copy(options);
      opts.agent = options.agent;
    }
    opts.addressPrefix = PREFIX_TESTNET_ADDRESS;
    opts.chainId = TESTNET_HEX_CHAIN_ID;
    return new _Client(MAIN_TESTNET_NODE_URL, opts);
  }
  /**
   * Make a RPC call to the server.
   *
   * @param api     The API to call, e.g. `database_api`.
   * @param method  The API method, e.g. `get_dynamic_global_properties`.
   * @param params  Array of parameters to pass to the method, optional.
   *
   */
  async call(api, method, params = []) {
    const request = {
      id: 0,
      jsonrpc: "2.0",
      method: api + "." + method,
      params
    };
    const body = JSON.stringify(request, (key, value) => {
      if (value && typeof value === "object" && value.type === "Buffer") {
        return BBuffer.from(value.data).toString("hex");
      }
      return value;
    });
    const opts = {
      body,
      cache: "no-cache",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      method: "POST",
      mode: "cors"
    };
    if (typeof self === void 0) {
      opts.headers = {
        "User-Agent": `dpixa/${version_default}`
      };
    }
    if (this.options.agent) {
      opts.agent = this.options.agent;
    }
    let fetchTimeout;
    if (api !== "network_broadcast_api" && !method.startsWith("broadcast_transaction")) {
      fetchTimeout = (tries) => (tries + 1) * 500;
    }
    const { response, currentAddress } = await retryingFetch(
      this.currentAddress,
      this.address,
      opts,
      this.timeout,
      this.failoverThreshold,
      this.consoleOnFailover,
      this.backoff,
      fetchTimeout
    );
    if (currentAddress !== this.currentAddress) {
      this.currentAddress = currentAddress;
    }
    if (response.error) {
      const formatValue = (value) => {
        switch (typeof value) {
          case "object":
            return JSON.stringify(value);
          default:
            return String(value);
        }
      };
      const { data } = response.error;
      let { message } = response.error;
      if (data && data.stack && data.stack.length > 0) {
        const top = data.stack[0];
        const topData = copy(top.data);
        message = top.format.replace(
          /\$\{([a-z_]+)\}/gi,
          (match, key) => {
            let rv = match;
            if (topData[key]) {
              rv = formatValue(topData[key]);
              delete topData[key];
            }
            return rv;
          }
        );
        const unformattedData = Object.keys(topData).map((key) => ({ key, value: formatValue(topData[key]) })).map((item) => `${item.key}=${item.value}`);
        if (unformattedData.length > 0) {
          message += " " + unformattedData.join(" ");
        }
      }
      throw new VError({ info: data, name: "RPCError" }, message);
    }
    assert_default.equal(response.id, request.id, "got invalid response id");
    return response.result;
  }
  updateOperations(rebrandedApi) {
    console.log("Warning: call to updateOperations() is deprecated and can safely be removed");
  }
};
var defaultBackoff = (tries) => Math.min(Math.pow(tries * 10, 2), 10 * 1e3);

export {
  registerCrypto,
  copy,
  utils_exports,
  BlockchainMode,
  Blockchain,
  assert_default,
  Asset,
  Price,
  DatabaseAPI,
  binaryToBytes,
  bytesToBinary,
  utf8ToBytes,
  bytesToUtf8,
  encodeString,
  decodeBytes,
  BBuffer,
  HexBuffer,
  getVestingSharePrice,
  getVests,
  RCAPI,
  AccountByKeyAPI,
  PixamindAPI,
  Authority,
  VError,
  VERSION,
  DEFAULT_CHAIN_ID,
  DEFAULT_ADDRESS_PREFIX,
  Client
};
//# sourceMappingURL=chunk-QFEN6AXT.mjs.map
