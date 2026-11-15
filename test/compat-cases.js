'use strict'
/**
 * Behaviour snapshot used by test/compat.ts.
 *
 * run(d) takes a module object exposing the full public dpixa API and returns
 * a JSON-serialisable record of deterministic outputs: keys, signatures,
 * digests (covering the serialization of every operation type), memo
 * ciphertexts, utils, assets, error shapes, and the exact JSON-RPC request
 * bodies the client sends (global fetch is mocked while it runs).
 *
 * test/fixtures/compat.json was generated from this file and checked against
 * the published @pixagram/dpixa 1.5.4 bundle: the only differences are that
 * an RPC error message containing '%' is no longer mangled by printf (see
 * src/errors.ts) and the engine's own wording of a BigInt RangeError, which
 * is why only the error name is recorded for that case.
 */

const hex = (b) => Buffer.from(b).toString('hex')

let handler = null
const requests = []
const mockFetch = async (url, opts) => {
  requests.push({
    url,
    method: opts && opts.method,
    headers: opts && opts.headers,
    body: opts && opts.body,
  })
  if (!handler) throw new Error('no mock handler')
  return handler(url, opts)
}
function jsonResponse(obj, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Internal Server Error',
    json: async () => JSON.parse(JSON.stringify(obj)),
  }
}

const DGP = {
  head_block_number: 12345678,
  head_block_id: '00bc614e3c1f0d9a8b7c6d5e4f3a2b1c0d9e8f70',
  time: '2026-11-15T12:00:00',
  last_irreversible_block_num: 12345660,
  total_vesting_fund_pixa: '1000000.000 PIXA',
  total_vesting_shares: '2000000000.000000 VESTS',
}

function capture(fn) {
  try {
    const v = fn()
    return { ok: v }
  } catch (e) {
    return { err: { name: e && e.name, message: e && e.message } }
  }
}
async function captureAsync(fn) {
  try {
    const v = await fn()
    return { ok: v }
  } catch (e) {
    return {
      err: {
        name: e && e.name,
        message: e && e.message,
        jse_info: e && e.jse_info !== undefined ? e.jse_info : '<none>',
        jse_shortmsg: e && e.jse_shortmsg,
        hasCause: !!(e && typeof e.cause === 'function' && e.cause()),
      },
    }
  }
}

async function run(d) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = mockFetch
  requests.length = 0
  try {
    return await snapshot(d)
  } finally {
    globalThis.fetch = originalFetch
    handler = null
  }
}

async function snapshot(d) {
  const out = {}
  const { PrivateKey, PublicKey, Signature, cryptoUtils, Memo, utils } = d

  // ---- exports ------------------------------------------------------------
  out.exports = Object.keys(d).filter((k) => k !== 'default' && k !== '__esModule').sort()
  out.utilsKeys = Object.keys(utils).sort()
  out.operationOrders = utils.operationOrders
  out.DEFAULT_ADDRESS_PREFIX = d.DEFAULT_ADDRESS_PREFIX
  out.DEFAULT_CHAIN_ID = hex(d.DEFAULT_CHAIN_ID)
  out.NETWORK_ID = hex(d.NETWORK_ID)
  out.BlockchainMode = { Irreversible: d.BlockchainMode.Irreversible, Latest: d.BlockchainMode.Latest }

  // ---- keys ---------------------------------------------------------------
  const seeds = ['', 'hello', 'dpixa-fixture-A', 'a'.repeat(100), '爱🙂 unicode seed', 'pixagram']
  out.keys = seeds.map((s) => {
    const k = PrivateKey.fromSeed(s)
    return {
      seed: s,
      wif: k.toString(),
      pub: k.createPublic().toString(),
      pubSTM: k.createPublic('STM').toString(),
      pubTST: k.createPublic('TST').toString(),
      inspect: k.inspect(),
    }
  })
  out.logins = []
  for (const [u, p] of [['foo', 'barman'], ['mel', 'P5Kdummy-password'], ['primerz', '']]) {
    for (const role of [undefined, 'owner', 'active', 'posting', 'memo']) {
      const k = role ? PrivateKey.fromLogin(u, p, role) : PrivateKey.fromLogin(u, p)
      out.logins.push({ u, p, role: role || null, wif: k.toString(), pub: k.createPublic().toString() })
    }
  }
  const raw32 = new Uint8Array(32).map((_, i) => (i * 7 + 3) & 0xff)
  out.fromRawBytes = PrivateKey.from(raw32).toString()
  out.wifRoundTrip = out.keys.map((k) => PrivateKey.fromString(k.wif).toString() === k.wif)
  out.pubParse = [
    'STX8FiV6v7yqYWTZz8WuFDckWr62L9X34hCy6koe8vd2cDJHimtgM',
    'STM8QykigLRi9ZUcNy1iXGY3KjRuCiLM8Ga49LHti1F8hgawKFc3K',
    out.keys[1].pub,
  ].map((s) => {
    const pk = PublicKey.fromString(s)
    return { s, toString: pk.toString(), prefix: pk.prefix, key: hex(pk.key), unc: hex(pk.uncompressed), json: JSON.stringify(pk), inspect: pk.inspect() }
  })
  const pk33 = Buffer.from('03d0519ddad62bd2a833bee5dc04011c08f77f66338c38d99c685dee1f454cd1b8', 'hex')
  out.pubFromBytes = new PublicKey(new Uint8Array(pk33), 'STM').toString()
  const somePk = PublicKey.fromString(out.keys[2].pub)
  out.pubFromIdentity = PublicKey.from(somePk) === somePk
  out.keyErrors = {
    badPubPrefix: capture(() => PublicKey.fromString('PI')),
    badPubChecksum: capture(() => PublicKey.fromString(out.keys[1].pub.slice(0, -1) + (out.keys[1].pub.endsWith('1') ? '2' : '1'))),
    badPubChar: capture(() => PublicKey.fromString('PIX0OIl')),
    badWifChecksum: capture(() => PrivateKey.fromString(out.keys[1].wif.slice(0, -1) + (out.keys[1].wif.endsWith('1') ? '2' : '1'))),
    badWifNetwork: capture(() => PrivateKey.fromString('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU73sVHnoWn')),
    zeroKey: capture(() => new PrivateKey(new Uint8Array(32))),
    badSig: capture(() => new Signature(new Uint8Array(10), 0)),
  }
  out.isWif = [
    out.keys[0].wif, out.keys[3].wif, '5JdeC9P7Pbd1uGdFVEsJ41EkEnADbbHGq6p1BwFxm6txNBsQnsw',
    'notawif', '', out.keys[1].wif.slice(0, -1) + 'z', out.keys[1].pub,
  ].map((w) => cryptoUtils.isWif(w))

  // ---- hashes -------------------------------------------------------------
  const inputs = ['', 'abc', 'hello world', '爱', 'x'.repeat(1000)]
  out.hashes = inputs.map((s) => ({
    s: s.slice(0, 20),
    sha256: hex(cryptoUtils.sha256(s)),
    sha256b: hex(cryptoUtils.sha256(Buffer.from(s, 'utf8'))),
    dsha: hex(cryptoUtils.doubleSha256(s)),
    rmd: hex(cryptoUtils.ripemd160(s)),
    rmdb: hex(cryptoUtils.ripemd160(new Uint8Array(Buffer.from(s, 'utf8')))),
  }))

  // ---- signatures ---------------------------------------------------------
  out.sigs = []
  for (let i = 0; i < 40; i++) {
    const key = PrivateKey.fromSeed('sig-seed-' + (i % 7))
    const msg = cryptoUtils.sha256('message-' + i)
    const sig = key.sign(msg)
    out.sigs.push({
      sig: sig.toString(),
      recovery: sig.recovery,
      verify: key.createPublic().verify(msg, sig),
      recover: sig.recover(msg).toString(),
      recoverSTM: sig.recover(msg, 'STM').toString(),
      canonical: cryptoUtils.isCanonicalSignature(sig.data),
    })
  }
  const knownBad = PrivateKey.fromSeed('dpixa-fixture-A').sign(cryptoUtils.sha256(Buffer.from('fixed-digest-input', 'utf-8')))
  out.knownBadSig = knownBad.toString()
  const testSig = '202c52188b0ecbc26c766fe6d3ec68dac58644f43f43fc7d97da122f76fa028f98691dd48b44394bdd8cecbbe66e94795dcf53291a1ef7c16b49658621273ea68e'
  out.sigRoundTrip = Signature.fromString(testSig).toString()
  out.sigFromBuffer = Signature.fromBuffer(Buffer.from(testSig, 'hex')).recovery
  const tampered = PrivateKey.fromSeed('x').sign(cryptoUtils.sha256('y'))
  tampered.data.writeUInt8(0x42, 3)
  out.verifyTampered = PrivateKey.fromSeed('x').createPublic().verify(cryptoUtils.sha256('y'), tampered)
  out.sharedSecret = hex(PrivateKey.fromSeed('alice').get_shared_secret(PrivateKey.fromSeed('bob').createPublic()))
  out.multiply = hex(PrivateKey.fromSeed('alice').multiply(PrivateKey.fromSeed('bob').createPublic()))

  // ---- transactions (serialization via digests) ---------------------------
  const k1 = PrivateKey.fromSeed('tx-key-1')
  const k2 = PrivateKey.fromSeed('tx-key-2')
  const pubA = k1.createPublic().toString()
  const pubB = k2.createPublic().toString()
  const auth = (pub) => ({ weight_threshold: 1, account_auths: [['pixagram', 1]], key_auths: [[pub, 1]] })
  const witnessOp = utils.buildWitnessUpdateOp('witness-a', {
    account_creation_fee: '3.000 TESTS',
    account_subsidy_budget: 797,
    account_subsidy_decay: 347321,
    key: pubA,
    maximum_block_size: 65536,
    new_signing_key: pubB,
    pxs_exchange_rate: { base: '0.250 TBD', quote: '1.000 TESTS' },
    pxs_interest_rate: 1000,
    url: 'https://pixagram.com/witness',
  })
  out.witnessOp = witnessOp
  out.witnessNullKey = utils.buildWitnessUpdateOp('w', { key: pubA, new_signing_key: null })
  out.witnessErr = capture(() => utils.buildWitnessUpdateOp('w', { key: pubA, bogus: 1 }))
  const ops = [
    ['vote', { voter: 'foo', author: 'bar', permlink: 'baz', weight: 10000 }],
    ['vote', { voter: 'foo', author: 'bar', permlink: 'baz', weight: -2500 }],
    ['comment', { parent_author: '', parent_permlink: 'pixelart', author: 'primerz', permlink: 'hello-爱', title: 'Title 🙂', body: 'Body '.repeat(50), json_metadata: JSON.stringify({ tags: ['a', 'b'], app: 'pixagram/2.0' }) }],
    ['transfer', { from: 'a', to: 'b', amount: '1.000 PIXA', memo: 'hi' }],
    ['transfer', { from: 'a', to: 'b', amount: '0.001 PXS', memo: '' }],
    ['transfer', { from: 'a', to: 'b', amount: '10.000 TESTS', memo: '#encrypted?' }],
    ['transfer', { from: 'a', to: 'b', amount: '1.000 TBD', memo: 'x' }],
    ['transfer', { from: 'a', to: 'b', amount: '2.500 STEEM', memo: 'x' }],
    ['transfer', { from: 'a', to: 'b', amount: '2.500 SBD', memo: 'x' }],
    ['transfer_to_vesting', { from: 'a', to: 'a', amount: '100.000 TESTS' }],
    ['withdraw_vesting', { account: 'a', vesting_shares: '123.456789 VESTS' }],
    ['custom_json', { required_auths: [], required_posting_auths: ['primerz'], id: 'follow', json: JSON.stringify(['follow', { follower: 'a', following: 'b', what: ['blog'] }]) }],
    ['account_update', { account: 'a', owner: auth(pubA), active: auth(pubB), posting: undefined, memo_key: pubB, json_metadata: '{}' }],
    ['account_update2', { account: 'a', owner: undefined, active: undefined, posting: auth(pubA), memo_key: pubA, json_metadata: '', posting_json_metadata: '{"profile":{}}', extensions: [] }],
    ['comment_options', { author: 'a', permlink: 'p', max_accepted_payout: '1000000.000 TBD', percent_pxs: 10000, allow_votes: true, allow_curation_rewards: false, extensions: [[0, { beneficiaries: [{ account: 'pixa.rex', weight: 900 }, { account: 'z', weight: 100 }] }]] }],
    ['witness_update', { owner: 'w', url: 'https://w', block_signing_key: pubA, props: { account_creation_fee: '3.000 TESTS', maximum_block_size: 65536, pxs_interest_rate: 0 }, fee: '0.000 TESTS' }],
    ['witness_update', { owner: 'w', url: 'https://w', block_signing_key: 'PIX1111111111111111111111111111111114T1Anm', props: { account_creation_fee: '3.000 TESTS', maximum_block_size: 65536, pxs_interest_rate: 0 }, fee: '0.000 TESTS' }],
    ['account_create', { fee: '3.000 TESTS', creator: 'a', new_account_name: 'newbie', owner: auth(pubA), active: auth(pubA), posting: auth(pubB), memo_key: pubB, json_metadata: '' }],
    ['create_claimed_account', { creator: 'a', new_account_name: 'newbie2', owner: auth(pubA), active: auth(pubA), posting: auth(pubB), memo_key: pubB, json_metadata: '', extensions: [] }],
    ['claim_account', { creator: 'a', fee: '0.000 TESTS', extensions: [] }],
    ['limit_order_create', { owner: 'a', orderid: 42, amount_to_sell: '1.000 TESTS', min_to_receive: '0.300 TBD', fill_or_kill: false, expiration: '2026-12-01T00:00:00' }],
    ['limit_order_create2', { owner: 'a', orderid: 43, amount_to_sell: '1.000 TESTS', exchange_rate: { base: '1.000 TESTS', quote: '0.300 TBD' }, fill_or_kill: true, expiration: '2026-12-01T00:00:00' }],
    ['limit_order_cancel', { owner: 'a', orderid: 42 }],
    ['feed_publish', { publisher: 'w', exchange_rate: { base: '0.250 TBD', quote: '1.000 TESTS' } }],
    ['convert', { owner: 'a', requestid: 1, amount: '1.000 TBD' }],
    ['collateralized_convert', { owner: 'a', requestid: 2, amount: '1.000 TESTS' }],
    ['update_proposal_votes', { voter: 'a', proposal_ids: [0, 1, 9007199254740991], approve: true, extensions: [] }],
    ['remove_proposal', { proposal_owner: 'a', proposal_ids: [3], extensions: [] }],
    ['update_proposal', { proposal_id: 7, creator: 'a', daily_pay: '10.000 TBD', subject: 's', permlink: 'p', extensions: [] }],
    ['create_proposal', { creator: 'a', receiver: 'b', start_date: '2026-11-15T00:00:00', end_date: '2027-11-15T00:00:00', daily_pay: '100.000 TBD', subject: 'Fund', permlink: 'fund', extensions: [] }],
    ['recurrent_transfer', { from: 'a', to: 'b', amount: '1.000 TESTS', memo: 'monthly', recurrence: 720, executions: 12, extensions: [] }],
    ['escrow_transfer', { from: 'a', to: 'b', agent: 'c', escrow_id: 9, pxs_amount: '1.000 TBD', pixa_amount: '2.000 TESTS', fee: '0.100 TESTS', ratification_deadline: '2026-12-01T00:00:00', escrow_expiration: '2026-12-31T00:00:00', json_meta: '{}' }],
    ['escrow_approve', { from: 'a', to: 'b', agent: 'c', who: 'b', escrow_id: 9, approve: true }],
    ['escrow_dispute', { from: 'a', to: 'b', agent: 'c', who: 'b', escrow_id: 9 }],
    ['escrow_release', { from: 'a', to: 'b', agent: 'c', who: 'c', receiver: 'b', escrow_id: 9, pxs_amount: '1.000 TBD', pixa_amount: '2.000 TESTS' }],
    ['claim_reward_balance', { account: 'a', reward_pixa: '0.000 TESTS', reward_pxs: '0.001 TBD', reward_vests: '1.000000 VESTS' }],
    ['delegate_vesting_shares', { delegator: 'a', delegatee: 'b', vesting_shares: '1000.000000 VESTS' }],
    ['account_witness_vote', { account: 'a', witness: 'w', approve: true }],
    ['account_witness_proxy', { account: 'a', proxy: '' }],
    ['delete_comment', { author: 'a', permlink: 'p' }],
    ['set_withdraw_vesting_route', { from_account: 'a', to_account: 'b', percent: 5000, auto_vest: true }],
    ['transfer_to_savings', { from: 'a', to: 'a', amount: '1.000 TBD', memo: '' }],
    ['transfer_from_savings', { from: 'a', request_id: 5, to: 'a', amount: '1.000 TBD', memo: '' }],
    ['cancel_transfer_from_savings', { from: 'a', request_id: 5 }],
    ['change_recovery_account', { account_to_recover: 'a', new_recovery_account: 'b', extensions: [] }],
    ['request_account_recovery', { recovery_account: 'b', account_to_recover: 'a', new_owner_authority: auth(pubA), extensions: [] }],
    ['recover_account', { account_to_recover: 'a', new_owner_authority: auth(pubA), recent_owner_authority: auth(pubB), extensions: [] }],
    ['set_reset_account', { account: 'a', current_reset_account: 'b', reset_account: 'c' }],
    ['decline_voting_rights', { account: 'a', decline: true }],
    ['custom', { required_auths: ['a'], id: 777, data: '0a0b0c' }],
    ['custom', { required_auths: ['a'], id: 778, data: [1, 2, 3, 255] }],
    ['custom_binary', { required_owner_auths: [], required_active_auths: ['a'], required_posting_auths: [], required_auths: [], id: 'bin', data: new Uint8Array([9, 8, 7]) }],
    witnessOp,
  ]
  const baseTx = { ref_block_num: 1234, ref_block_prefix: 1122334455, expiration: '2026-11-15T12:01:00', extensions: [] }
  const testnetChain = Buffer.from('18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e', 'hex')
  out.txs = ops.map((op, i) => {
    const tx = Object.assign({}, baseTx, { operations: [op] })
    return Object.assign({ i, name: op[0] }, capture(() => ({
      digest: hex(cryptoUtils.transactionDigest(tx, d.DEFAULT_CHAIN_ID)),
      digestTestnet: hex(cryptoUtils.transactionDigest(tx, testnetChain)),
      trxId: cryptoUtils.generateTrxId(tx),
      signed: cryptoUtils.signTransaction(tx, [k1, k2]),
    })))
  })
  const multi = Object.assign({}, baseTx, { operations: ops.slice(0, 6), extensions: ['long-pants'] })
  out.multiTx = { digest: hex(cryptoUtils.transactionDigest(multi)), signed: cryptoUtils.signTransaction(multi, k1), id: cryptoUtils.generateTrxId(multi) }
  out.serializationErrors = [
    capture(() => cryptoUtils.signTransaction(Object.assign({}, baseTx, { operations: [['shutdown_network', {}]] }), k1)),
    capture(() => cryptoUtils.signTransaction(Object.assign({}, baseTx, { operations: [['transfer', { from: 'a' }]] }), k1)),
    capture(() => cryptoUtils.signTransaction(Object.assign({}, baseTx, { operations: [['transfer', { from: 'a', to: 'b', amount: '1.000 FOO', memo: '' }]] }), k1)),
    capture(() => cryptoUtils.generateTrxId(Object.assign({}, baseTx, { operations: [['custom', { required_auths: [], id: 1, data: 'zz' }]] }))),
  ]
  out.sigInputsUnchanged = JSON.stringify(ops[0])

  // ---- memo ---------------------------------------------------------------
  const alice = PrivateKey.fromSeed('alice-memo')
  const bob = PrivateKey.fromSeed('bob-memo')
  const texts = ['#hello', '#memo爱', '#' + 'long memo text '.repeat(20), '#', '#🙂🙂🙂', 'plain text']
  const nonces = ['1462976530069648', '1', '18446744073709551615', '9007199254740993']
  out.memos = []
  for (const t of texts) {
    for (const n of nonces) {
      const enc = Memo.encode(alice, bob.createPublic(), t, n)
      out.memos.push({
        t: t.slice(0, 30), n, enc,
        decBob: Memo.decode(bob, enc),
        decAlice: Memo.decode(alice, enc),
        decStr: Memo.decode(bob.toString(), enc),
      })
    }
  }
  out.memoStringKeys = Memo.encode(alice.toString(), bob.createPublic().toString(), '#via strings', '77')
  out.memoPlain = [Memo.encode('', '', 'memo'), Memo.decode('', 'memo')]
  const randomEnc = Memo.encode(alice, bob.createPublic(), '#random nonce')
  out.memoRandomRoundTrip = Memo.decode(bob, randomEnc)
  out.memoWrongKey = capture(() => Memo.decode(PrivateKey.fromSeed('mallory'), out.memos[0].enc))
  out.memoGarbage = capture(() => Memo.decode(alice, '#3xyzNotBase58'))

  // ---- utils --------------------------------------------------------------
  const o = utils.operationOrders
  out.bitmasks = [
    [], [0], [1, 2, 3], [63], [64], [65], [84], [0, 63, 64, 84],
    Object.values(o),
    [o.transfer, o.transfer_to_vesting, o.withdraw_vesting, o.interest, o.liquidity_reward, o.transfer_to_savings, o.transfer_from_savings, o.escrow_transfer, o.cancel_transfer_from_savings, o.escrow_approve, o.escrow_dispute, o.escrow_release, o.fill_convert_request, o.fill_order, o.claim_reward_balance],
  ].map((a) => utils.makeBitMaskFilter(a))
  out.bitmaskErrors = [capture(() => utils.makeBitMaskFilter([1.5])).err.name, capture(() => utils.makeBitMaskFilter([-1]))]
  out.copy = utils.copy({ a: [1, { b: 'c' }], d: null })

  // ---- assets / misc ------------------------------------------------------
  const { Asset, Price, HexBuffer, Authority } = d
  out.assets = [
    Asset.from('1.000 PIXA').toString(), Asset.from(5, 'VESTS').toString(), Asset.fromString('0.001 PXS').toString(),
    Asset.from('1.000 PIXA').add('2.500 PIXA').toString(), Asset.from('1.000 PIXA').subtract(0.5).toString(),
    Asset.from('2.000 PIXA').multiply(3).toString(), Asset.from('3.000 PIXA').divide(2).toString(),
    Asset.max(Asset.from('1.000 PIXA'), Asset.from('2.000 PIXA')).toString(),
    Asset.from('1.000 STEEM').steem_symbols().toString(), Asset.from('1.000 SBD').steem_symbols().toString(),
    JSON.stringify({ a: Asset.from('1.000 TBD') }),
  ]
  out.assetErrors = [
    capture(() => Asset.from('1.000 FOO')), capture(() => Asset.from('abc PIXA')), capture(() => Asset.from('1.000 PIXA', 'PXS')),
    capture(() => Asset.min(Asset.from('1.000 PIXA'), Asset.from('1.000 PXS'))), capture(() => Asset.from(null)),
    capture(() => new Price(Asset.from('0.000 PIXA'), Asset.from('1.000 PXS'))),
    capture(() => new Price(Asset.from('1.000 PIXA'), Asset.from('1.000 PIXA'))),
  ]
  const price = Price.from({ base: '1.000 PIXA', quote: '0.250 PXS' })
  out.price = [price.toString(), price.convert(Asset.from('10.000 PIXA')).toString(), price.convert(Asset.from('1.000 PXS')).toString(), capture(() => price.convert(Asset.from('1.000 VESTS')))]
  out.vsp = d.getVestingSharePrice(DGP).toString()
  out.vspZero = d.getVestingSharePrice({ total_vesting_fund_pixa: '0.000 PIXA', total_vesting_shares: '0.000000 VESTS' }).toString()
  out.vests = d.getVests({ vesting_shares: '1000.000000 VESTS', delegated_vesting_shares: '100.000000 VESTS', received_vesting_shares: '50.000000 VESTS', vesting_withdraw_rate: '10.000000 VESTS', to_withdraw: '1000000000', withdrawn: '0' })
  out.hexBuffer = [
    HexBuffer.from('026400c800').toString(), HexBuffer.from([1, 2, 3]).toString(), HexBuffer.from(new Uint8Array([255, 0])).toString(),
    JSON.stringify({ h: HexBuffer.from('abcd') }), HexBuffer.from(HexBuffer.from('ab')).toString(),
  ]
  out.authority = [
    JSON.stringify(Authority.from(pubA)),
    JSON.stringify(Authority.from(PublicKey.fromString(pubA))),
    Authority.from(PublicKey.fromString(pubA)).key_auths[0][0] instanceof PublicKey,
    JSON.stringify(Authority.from({ weight_threshold: 2, account_auths: [], key_auths: [[pubA, 1], [pubB, 1]] })),
    Authority.from(Authority.from(pubA)) instanceof Authority,
  ]

  // ---- client (mocked fetch) ----------------------------------------------
  out.client = {}
  const client = new d.Client('https://node.example.com', { timeout: 2000 })
  out.client.chainId = hex(client.chainId)
  out.client.prefix = client.addressPrefix
  const tn = d.Client.testnet()
  out.client.testnet = { chainId: hex(tn.chainId), prefix: tn.addressPrefix, addr: tn.address }
  const custom = new d.Client(['https://a.example', 'https://b.example'], { chainId: '11'.repeat(32), addressPrefix: 'XYZ' })
  out.client.custom = { chainId: hex(custom.chainId), prefix: custom.addressPrefix, current: custom.currentAddress }
  out.client.badChain = capture(() => new d.Client('https://x', { chainId: 'abcd' }))

  const results = {
    get_dynamic_global_properties: DGP,
    get_accounts: [{ name: 'foo' }],
    broadcast_transaction: {},
  }
  handler = async (url, opts) => {
    const req = JSON.parse(opts.body)
    const m = req.method.split('.').pop()
    if (m === 'rpc_error') {
      return jsonResponse({ jsonrpc: '2.0', id: req.id, error: { code: -32000, message: 'Assert Exception', data: { code: 10, name: 'assert_exception', message: 'Assert Exception', stack: [{ context: { level: 'error' }, format: 'Missing Posting Authority ${account} at ${when}', data: { account: 'mel', when: { x: 1 }, extra: 'yes' } }] } } })
    }
    if (m === 'rpc_error_plain') {
      return jsonResponse({ jsonrpc: '2.0', id: req.id, error: { code: -32601, message: 'Method not found 50% done' } })
    }
    if (m === 'http500_jsonrpc') {
      return jsonResponse({ jsonrpc: '2.0', id: req.id, result: 'from-500' }, 500)
    }
    if (m === 'wrong_id') {
      return jsonResponse({ jsonrpc: '2.0', id: 99, result: 1 })
    }
    return jsonResponse({ jsonrpc: '2.0', id: req.id, result: results[m] !== undefined ? results[m] : { echo: req.params } })
  }
  requests.length = 0
  out.client.call = await captureAsync(() => client.call('condenser_api', 'get_accounts', [['foo']]))
  out.client.callBuffer = await captureAsync(() => client.call('condenser_api', 'echo', [Buffer.from([1, 2, 254]), { nested: Buffer.from('ab') }]))
  out.client.callDefaultParams = await captureAsync(() => client.call('database_api', 'echo'))
  out.client.rpcError = await captureAsync(() => client.call('condenser_api', 'rpc_error', []))
  out.client.rpcErrorPlain = await captureAsync(() => client.call('condenser_api', 'rpc_error_plain', []))
  out.client.http500 = await captureAsync(() => client.call('condenser_api', 'http500_jsonrpc', []))
  out.client.wrongId = await captureAsync(() => client.call('condenser_api', 'wrong_id', []))
  out.client.dgp = await captureAsync(() => client.database.getDynamicGlobalProperties())
  out.client.history = await captureAsync(() => client.database.getAccountHistory('foo', -1, 100, utils.makeBitMaskFilter([o.transfer, o.interest])))
  out.client.historyBad = await captureAsync(() => client.database.getAccountHistory('foo', -1, 100, [1]))
  out.client.median = await captureAsync(async () => {
    results.get_current_median_history_price = { base: '0.250 PXS', quote: '1.000 PIXA' }
    return (await client.database.getCurrentMedianHistoryPrice()).toString()
  })
  out.client.keyRefs = await captureAsync(() => client.keys.getKeyReferences([PublicKey.fromString(pubA), pubB]))
  out.client.findTx = await captureAsync(() => client.transaction.findTransaction('abc', '2026-11-15T00:00:00'))
  out.client.ranked = await captureAsync(() => client.pixamind.getRankedPosts({ sort: 'trending', tag: 'pixelart', limit: 5 }))
  out.client.rcCall = await captureAsync(() => client.rc.findRCAccounts(['foo']))
  out.client.blockNum = await captureAsync(() => client.blockchain.getCurrentBlockNum())
  out.client.blockNumLatest = await captureAsync(() => client.blockchain.getCurrentBlockNum(d.BlockchainMode.Latest))
  const voter = PrivateKey.fromSeed('voter-posting')
  out.client.vote = await captureAsync(() => client.broadcast.vote({ voter: 'foo', author: 'bar', permlink: 'baz', weight: 5000 }, voter))
  out.client.transfer = await captureAsync(() => client.broadcast.transfer({ from: 'foo', to: 'bar', amount: '1.000 PIXA', memo: 'thx' }, voter))
  out.client.json = await captureAsync(() => client.broadcast.json({ required_auths: [], required_posting_auths: ['foo'], id: 'x', json: '{}' }, voter))
  out.client.comment = await captureAsync(() => client.broadcast.comment({ parent_author: '', parent_permlink: 't', author: 'foo', permlink: 'p', title: 'T', body: 'B', json_metadata: '{}' }, voter))
  out.client.commentWithOptions = await captureAsync(() => client.broadcast.commentWithOptions(
    { parent_author: '', parent_permlink: 't', author: 'foo', permlink: 'p', title: 'T', body: 'B', json_metadata: '{}' },
    { author: 'foo', permlink: 'p', max_accepted_payout: '1000.000 PXS', percent_pxs: 10000, allow_votes: true, allow_curation_rewards: true, extensions: [] }, voter))
  out.client.updateAccount = await captureAsync(() => client.broadcast.updateAccount({ account: 'foo', memo_key: pubA, json_metadata: '{}' }, [voter, k1]))
  out.client.delegate = await captureAsync(() => client.broadcast.delegateVestingShares({ delegator: 'foo', delegatee: 'bar', vesting_shares: '1.000000 VESTS' }, voter))
  out.client.sendOps = await captureAsync(() => client.broadcast.sendOperations([ops[3], ops[11], witnessOp], [voter]))
  out.client.signOnly = client.broadcast.sign(Object.assign({}, baseTx, { operations: [ops[0]] }), voter)
  // createTestAccount refuses to run unless a mocha-style global `it` exists.
  const hadIt = Object.prototype.hasOwnProperty.call(globalThis, 'it')
  const savedIt = globalThis.it
  try {
    delete globalThis.it
    out.client.testAccountNoMocha = await captureAsync(() => client.broadcast.createTestAccount({ username: 'x', password: 'y', creator: 'z' }, voter))
    globalThis.it = () => undefined
    out.client.testAccountPassword = await captureAsync(() => client.broadcast.createTestAccount({ username: 'x', password: 'y', creator: 'z', metadata: { a: 1 } }, voter))
    out.client.testAccountAuths = await captureAsync(() => client.broadcast.createTestAccount({
      username: 'y', creator: 'z', delegation: '1.000000 VESTS',
      auths: { owner: pubA, active: PublicKey.fromString(pubA), posting: auth(pubB), memoKey: pubB },
    }, voter))
  } finally {
    if (hadIt) globalThis.it = savedIt
    else delete globalThis.it
  }
  out.requests = requests.map((r) => ({ url: r.url, method: r.method, headers: r.headers, body: r.body }))
  return out
}

module.exports = { run }
