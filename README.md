# [dpixa](https://github.com/pixagram-blockchain/dpixa)

Robust pixa client library that runs in both node.js and the browser.

Needs test net urls, chain id

---

**note** As of version 0.7.0 WebSocket support has been removed. The only transport provided now is HTTP(2). For most users the only change required is to swap `wss://` to `https://` in the address. If you run your own full node make sure to set the proper [CORS headers](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) if you plan to access it from a browser.

---

## Browser compatibility

[![Build Status](https://saucelabs.com/browser-matrix/feruzm-dpixa.svg)](https://saucelabs.com/open_sauce/user/feruzm-dpixa)

## Installation

### Via npm

For node.js or the browser with [browserify](https://github.com/substack/node-browserify) or [webpack](https://github.com/webpack/webpack).

```
npm install @pixagram/dpixa
```

## Bundling

The easiest way to bundle dpixa (with browserify, webpack etc.) is to just `npm install @pixagram/dpixa` and `require('@pixagram/dpixa')` which will give you well-tested (see browser compatibility matrix above) pre-bundled code guaranteed to JustWork™. However, that is not always desirable since it will not allow your bundler to de-duplicate any shared dependencies dpixa and your app might have.

To allow for deduplication you can `require('@pixagram/dpixa/lib/index-browser')`, or if you plan to provide your own polyfills: `require('@pixagram/dpixa/lib/index')`. See `src/index-browser.ts` for a list of polyfills expected.

---

_Share and Enjoy!_

---

<html><head></head><body><blockquote>
<p>🚀 A robust Pixa blockchain client library that runs in both Node.js and the browser.</p>
</blockquote>
<hr>
<h2>Table of Contents</h2>
<ul>
<li><a href="#installation">Installation</a></li>
<li><a href="#quick-start">Quick Start</a>
<ul>
<li><a href="#browser-usage">Browser Usage</a></li>
<li><a href="#nodejs-with-es-modules">Node.js with ES Modules</a></li>
<li><a href="#nodejs-with-commonjs">Node.js with CommonJS</a></li>
</ul>
</li>
<li><a href="#core-concepts">Core Concepts</a>
<ul>
<li><a href="#client">Client</a>
<ul>
<li><a href="#creating-a-client">Creating a Client</a></li>
<li><a href="#using-testnet">Using Testnet</a></li>
<li><a href="#making-raw-rpc-calls">Making Raw RPC Calls</a></li>
<li><a href="#client-options-reference">Client Options Reference</a></li>
<li><a href="#client-properties">Client Properties</a></li>
</ul>
</li>
<li><a href="#database-api">Database API</a> — <code>client.database</code>
<ul>
<li><a href="#getdynamicglobalproperties"><code>getDynamicGlobalProperties()</code></a> → <a href="#-dynamicglobalproperties-interface"><code>DynamicGlobalProperties</code></a></li>
<li><a href="#getchainproperties"><code>getChainProperties()</code></a> → <a href="#-chainproperties-interface"><code>ChainProperties</code></a></li>
<li><a href="#getcurrentmedianhistoryprice"><code>getCurrentMedianHistoryPrice()</code></a> → <a href="#price-class"><code>Price</code></a></li>
<li><a href="#getconfig"><code>getConfig()</code></a></li>
<li><a href="#getstatepath"><code>getState(path)</code></a></li>
<li><a href="#getblockheaderblocknum"><code>getBlockHeader(blockNum)</code></a> → <a href="#-blockheader-interface"><code>BlockHeader</code></a></li>
<li><a href="#getblockblocknum"><code>getBlock(blockNum)</code></a> → <a href="#-signedblock-interface"><code>SignedBlock</code></a></li>
<li><a href="#getoperationsblocknum-onlyvirtual"><code>getOperations(blockNum, onlyVirtual?)</code></a> → <a href="#-appliedoperation-interface"><code>AppliedOperation[]</code></a></li>
<li><a href="#getaccountsusernames"><code>getAccounts(usernames)</code></a> → <a href="#-account-interface"><code>ExtendedAccount[]</code></a></li>
<li><a href="#getdiscussionsby-query"><code>getDiscussions(by, query)</code></a> → <a href="#-discussion-interface"><code>Discussion[]</code></a></li>
<li><a href="#gettransactiontxid"><code>getTransaction(txId)</code></a> → <a href="#-transaction-interface"><code>SignedTransaction</code></a></li>
<li><a href="#getaccounthistoryaccount-from-limit-operation_bitmask"><code>getAccountHistory(account, from, limit, bitmask?)</code></a> → <a href="#-appliedoperation-interface"><code>AppliedOperation[]</code></a></li>
<li><a href="#getvestingdelegationsaccount-from-limit"><code>getVestingDelegations(account, from?, limit?)</code></a> → <a href="#-vestingdelegation-interface"><code>VestingDelegation[]</code></a></li>
<li><a href="#verifyauthoritysignedtransaction"><code>verifyAuthority(signedTransaction)</code></a></li>
<li><a href="#getversion"><code>getVersion()</code></a></li>
</ul>
</li>
<li><a href="#blockchain">Blockchain</a> — <code>client.blockchain</code>
<ul>
<li><a href="#getcurrentblocknummode"><code>getCurrentBlockNum(mode?)</code></a></li>
<li><a href="#getcurrentblockheadermode"><code>getCurrentBlockHeader(mode?)</code></a> → <a href="#-blockheader-interface"><code>BlockHeader</code></a></li>
<li><a href="#getcurrentblockmode"><code>getCurrentBlock(mode?)</code></a> → <a href="#-signedblock-interface"><code>SignedBlock</code></a></li>
<li><a href="#getblocknumbersoptions"><code>getBlockNumbers(options?)</code></a></li>
<li><a href="#getblocksoptions"><code>getBlocks(options?)</code></a> → <a href="#-signedblock-interface"><code>SignedBlock</code></a></li>
<li><a href="#getoperationsoptions"><code>getOperations(options?)</code></a> → <a href="#-appliedoperation-interface"><code>AppliedOperation</code></a></li>
<li><a href="#stream-methods-nodejs-streams">Stream Methods (Node.js)</a></li>
</ul>
</li>
<li><a href="#broadcast-api">Broadcast API</a> — <code>client.broadcast</code>
<ul>
<li><a href="#voting-on-content">Voting on Content</a> → <a href="#-transaction-interface"><code>TransactionConfirmation</code></a></li>
<li><a href="#transferring-funds">Transferring Funds</a> → <a href="#-transaction-interface"><code>TransactionConfirmation</code></a></li>
<li><a href="#creating-posts-and-comments">Creating Posts and Comments</a> → <a href="#-transaction-interface"><code>TransactionConfirmation</code></a></li>
<li><a href="#custom-json-operations">Custom JSON Operations</a> → <a href="#-transaction-interface"><code>TransactionConfirmation</code></a></li>
<li><a href="#claiming-rewards">Claiming Rewards</a> → <a href="#-transaction-interface"><code>TransactionConfirmation</code></a></li>
</ul>
</li>
<li><a href="#resource-credits-api">Resource Credits API</a> — <code>client.rc</code>
<ul>
<li><a href="#findrcaccountsusernames"><code>findRCAccounts(usernames)</code></a></li>
<li><a href="#getrcmanausername--getvpmanausername"><code>getRCMana(username)</code> / <code>getVPMana(username)</code></a></li>
<li><a href="#getresourceparams"><code>getResourceParams()</code></a></li>
<li><a href="#getresourcepool"><code>getResourcePool()</code></a></li>
<li><a href="#calculatercmanarc_account"><code>calculateRCMana(rc_account)</code></a></li>
<li><a href="#calculatevpmanaaccount"><code>calculateVPMana(account)</code></a></li>
</ul>
</li>
<li><a href="#pixamind-api">Pixamind API</a> — <code>client.pixamind</code>
<ul>
<li><a href="#getrankedpostsoptions"><code>getRankedPosts(options)</code></a> → <a href="#-discussion-interface"><code>Discussion[]</code></a></li>
<li><a href="#getaccountpostsoptions"><code>getAccountPosts(options)</code></a> → <a href="#-discussion-interface"><code>Discussion[]</code></a></li>
<li><a href="#getcommunityoptions"><code>getCommunity(options)</code></a> → <a href="#-communitydetail-interface"><code>CommunityDetail</code></a></li>
<li><a href="#listcommunitiesoptions"><code>listCommunities(options)</code></a> → <a href="#-communitydetail-interface"><code>CommunityDetail[]</code></a></li>
<li><a href="#listallsubscriptionsaccount"><code>listAllSubscriptions(account)</code></a></li>
<li><a href="#getaccountnotificationsoptions"><code>getAccountNotifications(options)</code></a> → <a href="#-notifications-interface"><code>Notifications[]</code></a></li>
</ul>
</li>
<li><a href="#account-by-key-api">Account By Key API</a> — <code>client.keys</code>
<ul>
<li><a href="#getkeyreferenceskeys"><code>getKeyReferences(keys)</code></a> → <a href="#-accountsbykey-interface"><code>AccountsByKey</code></a></li>
</ul>
</li>
</ul>
</li>
<li><a href="#working-with-assets">Working with Assets</a>
<ul>
<li><a href="#asset-class">Asset Class</a>
<ul>
<li><a href="#creating-assets">Creating Assets</a></li>
<li><a href="#asset-properties--methods">Asset Properties &amp; Methods</a></li>
<li><a href="#asset-symbols-reference">Asset Symbols Reference</a></li>
</ul>
</li>
<li><a href="#price-class">Price Class</a></li>
<li><a href="#helper-functions">Helper Functions</a>
<ul>
<li><a href="#getvestingsharepriceprops"><code>getVestingSharePrice(props)</code></a> → <a href="#price-class"><code>Price</code></a></li>
<li><a href="#getvestsaccount-subtractdelegated-addreceived"><code>getVests(account, subtractDelegated?, addReceived?)</code></a></li>
</ul>
</li>
</ul>
</li>
<li><a href="#cryptography">Cryptography</a>
<ul>
<li><a href="#private-keys">Private Keys</a> — <code>PrivateKey</code>
<ul>
<li><a href="#creating-private-keys"><code>PrivateKey.fromLogin(username, password, role)</code></a></li>
<li><a href="#creating-private-keys"><code>PrivateKey.fromString(wif)</code></a></li>
<li><a href="#creating-private-keys"><code>PrivateKey.fromSeed(seed)</code></a></li>
<li><a href="#using-private-keys"><code>privateKey.createPublic()</code></a></li>
<li><a href="#using-private-keys"><code>privateKey.sign(message)</code></a> → <a href="#signatures"><code>Signature</code></a></li>
</ul>
</li>
<li><a href="#public-keys">Public Keys</a> — <code>PublicKey</code>
<ul>
<li><a href="#public-keys"><code>PublicKey.fromString(wif)</code></a></li>
<li><a href="#public-keys"><code>publicKey.verify(message, signature)</code></a></li>
</ul>
</li>
<li><a href="#signatures">Signatures</a> — <code>Signature</code>
<ul>
<li><a href="#signatures"><code>signature.recover(message)</code></a> → <a href="#public-keys"><code>PublicKey</code></a></li>
</ul>
</li>
<li><a href="#memo-encryption">Memo Encryption</a> — <code>Memo</code>
<ul>
<li><a href="#memo-encryption"><code>Memo.encode(privateKey, publicKey, message)</code></a></li>
<li><a href="#memo-encryption"><code>Memo.decode(privateKey, encoded)</code></a></li>
</ul>
</li>
<li><a href="#crypto-utilities">Crypto Utilities</a> — <code>cryptoUtils</code></li>
</ul>
</li>
<li><a href="#building-transactions">Building Transactions</a></li>
<li><a href="#operations-reference">Operations Reference</a>
<ul>
<li><a href="#operations-reference">Transfer Operations</a></li>
<li><a href="#operations-reference">Content Operations</a></li>
<li><a href="#operations-reference">Account Operations</a></li>
<li><a href="#operations-reference">Governance Operations</a></li>
<li><a href="#operations-reference">Market Operations</a></li>
<li><a href="#operations-reference">Savings Operations</a></li>
<li><a href="#operations-reference">Escrow Operations</a></li>
<li><a href="#operations-reference">Custom Operations</a></li>
<li><a href="#operations-reference">Virtual Operations (Read-Only)</a></li>
</ul>
</li>
<li><a href="#utilities">Utilities</a> — <code>utils</code>
<ul>
<li><a href="#operation-bitmask-filter"><code>utils.operationOrders</code></a></li>
<li><a href="#operation-bitmask-filter"><code>utils.makeBitMaskFilter(ops)</code></a></li>
<li><a href="#sleep"><code>utils.sleep(ms)</code></a></li>
<li><a href="#copy-objects"><code>utils.copy(obj)</code></a></li>
<li><a href="#iterator-to-stream"><code>utils.iteratorStream(iterator)</code></a></li>
<li><a href="#build-witness-update"><code>utils.buildWitnessUpdateOp(owner, props)</code></a></li>
<li><a href="#wait-for-event"><code>utils.waitForEvent(emitter, event)</code></a></li>
<li><a href="#retrying-fetch"><code>utils.retryingFetch(...)</code></a></li>
</ul>
</li>
<li><a href="#serialization">Serialization</a> — <code>Types</code></li>
<li><a href="#error-handling">Error Handling</a></li>
<li><a href="#types--interfaces">Types &amp; Interfaces</a>
<ul>
<li><a href="#-account-interface"><code>Account</code></a> / <a href="#-account-interface"><code>ExtendedAccount</code></a></li>
<li><a href="#-appliedoperation-interface"><code>AppliedOperation</code></a></li>
<li><a href="#-authority-interface"><code>Authority</code> / <code>AuthorityType</code></a></li>
<li><a href="#-blockheader-interface"><code>BlockHeader</code></a> / <a href="#-signedblock-interface"><code>SignedBlock</code></a></li>
<li><a href="#-chainproperties-interface"><code>ChainProperties</code></a></li>
<li><a href="#-communitydetail-interface"><code>CommunityDetail</code></a></li>
<li><a href="#-discussion-interface"><code>Discussion</code></a> / <a href="#-discussion-interface"><code>Comment</code></a></li>
<li><a href="#-dynamicglobalproperties-interface"><code>DynamicGlobalProperties</code></a></li>
<li><a href="#-disqussionquery-interface"><code>DisqussionQuery</code></a></li>
<li><a href="#-hexbuffer-class"><code>HexBuffer</code></a></li>
<li><a href="#-notifications-interface"><code>Notifications</code></a></li>
<li><a href="#-transaction-interface"><code>Transaction</code> / <code>SignedTransaction</code> / <code>TransactionConfirmation</code></a></li>
<li><a href="#-vestingdelegation-interface"><code>VestingDelegation</code></a></li>
<li><a href="#-accountsbykey-interface"><code>AccountsByKey</code></a></li>
<li><a href="#-operation-interfaces">Operation Interfaces (full list)</a></li>
</ul>
</li>
<li><a href="#enumerations">Enumerations</a>
<ul>
<li><a href="#enumerations"><code>BlockchainMode</code></a></li>
<li><a href="#asset-symbols-reference"><code>AssetSymbol</code></a></li>
<li><a href="#discussion-query-categories"><code>DiscussionQueryCategory</code></a></li>
<li><a href="#key-roles-reference"><code>KeyRole</code></a></li>
<li><a href="#-operation-interfaces"><code>OperationName</code></a></li>
<li><a href="#virtual-operations-read-only"><code>VirtualOperationName</code></a></li>
</ul>
</li>
<li><a href="#constants">Constants</a></li>
<li><a href="#advanced-usage">Advanced Usage</a></li>
</ul>
<hr>
<h2>Installation</h2>
<h3>Via npm</h3>
<pre><code class="language-bash">npm install @pixagram/dpixa
</code></pre>
<h3>Via yarn</h3>
<pre><code class="language-bash">yarn add @pixagram/dpixa
</code></pre>
<h3>Via CDN</h3>
<pre><code class="language-html">&lt;script src="https://unpkg.com/@pixagram/dpixa@latest/dist/dpixa.js"&gt;&lt;/script&gt;
</code></pre>
<h3>Self-hosted</h3>
<p>Download <code>dist/dpixa.js</code> from the repository and include it in your HTML:</p>
<pre><code class="language-html">&lt;script src="dpixa.js"&gt;&lt;/script&gt;
</code></pre>
<hr>
<h2>Quick Start</h2>
<h3>Browser Usage</h3>
<pre><code class="language-html">&lt;script src="https://unpkg.com/@pixagram/dpixa@latest/dist/dpixa.js"&gt;&lt;/script&gt;
&lt;script&gt;
  const client = new dpixa.Client([
    "https://api.pixagram.io",
    "https://api.hivekings.com",
    "https://anyx.io"
  ]);

client.database
.getDiscussions("trending", { tag: "writing", limit: 5 })
.then(function(discussions) {
discussions.forEach(post =&gt; {
console.log(`${post.title} by @${post.author}`);
});
});
&lt;/script&gt;
</code></pre>
<h3>Node.js with ES Modules</h3>
<pre><code class="language-js">import { Client } from "@pixagram/dpixa";

const client = new Client([
  "https://api.pixagram.io",
  "https://api.hivekings.com"
]);

async function main() {
  const props = await client.database.getDynamicGlobalProperties();
  console.log(`Current block: ${props.head_block_number}`);
}

main();
</code></pre>
<h3>Node.js with CommonJS</h3>
<pre><code class="language-js">const { Client, PrivateKey } = require("@pixagram/dpixa");

const client = new Client(["https://api.pixagram.io"]);

// Vote on a post
const key = PrivateKey.fromLogin("username", "password", "posting");

client.broadcast
  .vote(
    {
      voter: "username",
      author: "almost-digital",
      permlink: "dpixa-is-the-best",
      weight: 10000
    },
    key
  )
  .then(result =&gt; {
    console.log(`Included in block: ${result.block_num}`);
  });
</code></pre>
<hr>
<h2>Core Concepts</h2>
<h3>Client</h3>
<p>The <code>Client</code> class is your main entry point to interact with the Pixa blockchain. It manages RPC connections, provides access to various APIs, and handles failover between multiple nodes.</p>
<h4>Creating a Client</h4>
<pre><code class="language-js">import { Client } from "@pixagram/dpixa";

// Basic initialization with multiple nodes for failover
const client = new Client([
"https://api.pixagram.io",
"https://api.hivekings.com",
"https://anyx.io",
"https://api.openhive.network"
]);

// With custom options
const clientWithOptions = new Client(["https://api.pixagram.io"], {
timeout: 30000,              // Request timeout in ms (default: 60000)
failoverThreshold: 3,        // Retry rounds before giving up
consoleOnFailover: true,     // Log when failing over to another node
addressPrefix: "PIX",        // Network address prefix
chainId: "your-chain-id"    // Custom chain ID
});
</code></pre>
<h4>Using Testnet</h4>
<pre><code class="language-js">// Create a client configured for testnet
const testClient = Client.testnet();
</code></pre>
<h4>Making Raw RPC Calls</h4>
<pre><code class="language-js">// Direct RPC call to any API
const result = await client.call("database_api", "get_dynamic_global_properties", []);
</code></pre>
&lt;details&gt;
&lt;summary&gt;&lt;strong&gt;📋 Client Options Reference&lt;/strong&gt;&lt;/summary&gt;

Option | Type | Default | Description
-- | -- | -- | --
timeout | number | 60000 | Request timeout in milliseconds. Set to 0 to retry forever.
failoverThreshold | number | 3 | Number of retry rounds across all URLs before failing. Set to 0 for infinite retries.
consoleOnFailover | boolean | false | Log failover events to console
addressPrefix | string | "PIX" | Network address prefix for key encoding
chainId | string | Main chain ID | Blockchain chain ID (32-byte hex string)
agent | http.Agent | https.globalAgent | Custom HTTP agent for keep-alive connections
backoff | (tries: number) => number | Default backoff | Custom retry backoff function returning milliseconds


&lt;/details&gt;
<hr>
<h2>Enumerations</h2>
<pre><code class="language-js">import { BlockchainMode } from "@pixagram/dpixa";

// BlockchainMode
BlockchainMode.Irreversible  // 0 — Only confirmed blocks (default)
BlockchainMode.Latest        // 1 — Head block (may be reversed on fork)
</code></pre>
<p>See also: <a href="#asset-symbols-reference">Asset Symbols</a>, <a href="#discussion-query-categories">Discussion Query Categories</a>, <a href="#key-roles-reference">Key Roles</a></p>
<hr>
<h2>Constants</h2>
<pre><code class="language-js">import { 
  VERSION,
  DEFAULT_ADDRESS_PREFIX,
  DEFAULT_CHAIN_ID,
  NETWORK_ID
} from "@pixagram/dpixa";

console.log(VERSION);                // Library version string
console.log(DEFAULT_ADDRESS_PREFIX); // "PIX"
console.log(DEFAULT_CHAIN_ID);       // Buffer (32 bytes)
console.log(NETWORK_ID);             // Buffer (network ID for WIF)
</code></pre>
<hr>
<h2>Advanced Usage</h2>
<h3>Custom Backoff Strategy</h3>
<pre><code class="language-js">const client = new Client(["https://api.pixagram.io"], {
  backoff: (tries) =&gt; {
    // Exponential backoff with jitter
    const base = Math.min(1000 * Math.pow(2, tries), 30000);
    const jitter = Math.random() * 1000;
    return base + jitter;
  }
});
</code></pre>
<h3>Connection Pooling (Node.js)</h3>
<pre><code class="language-js">const https = require("https");

const agent = new https.Agent({
keepAlive: true,
maxSockets: 10
});

const client = new Client(["https://api.pixagram.io"], {
agent: agent
});
</code></pre>
<h3>Building a Vote Bot</h3>
<pre><code class="language-js">async function autoVoter(authors, weight = 10000) {
  const postingKey = PrivateKey.fromLogin("mybot", "password", "posting");
  
  for await (const op of client.blockchain.getOperations()) {
    const [opType, opData] = op.op;
    
    if (opType === "comment" &amp;&amp; 
        opData.parent_author === "" &amp;&amp;  // Root post only
        authors.includes(opData.author)) {
      
      try {
        await client.broadcast.vote({
          voter: "mybot",
          author: opData.author,
          permlink: opData.permlink,
          weight: weight
        }, postingKey);
        
        console.log(`Voted on @${opData.author}/${opData.permlink}`);
      } catch (error) {
        console.error(`Vote failed: ${error.message}`);
      }
    }
  }
}

autoVoter(["favorite-author1", "favorite-author2"]);
</code></pre>
<hr>
<h2>Important Notes</h2>
<blockquote>
<p>⚠️ <strong>WebSocket Removed</strong>: As of v0.7.0, WebSocket support has been removed. Use HTTP(S) URLs.</p>
</blockquote>
<blockquote>
<p>💡 <strong>CORS</strong>: If running your own node, configure proper CORS headers for browser access.</p>
</blockquote>
<blockquote>
<p>🔐 <strong>Security</strong>: Never expose private keys in client-side code. Use minimum required key level.</p>
</blockquote>
<blockquote>
<p>📡 <strong>Node Selection</strong>: Use multiple RPC nodes for reliability with automatic failover.</p>
</blockquote>
<hr>
<h2>License</h2>
<p>MIT</p>
<hr>
<p><em>Share and Enjoy!</em> 🚀</p></body></html>> 🚀 A robust Pixa blockchain client library that runs in both Node.js and the browser.

---

## Table of Contents

- [[Installation](#installation)](#installation)
- [[Quick Start](#quick-start)](#quick-start)
    - [[Browser Usage](#browser-usage)](#browser-usage)
    - [[Node.js with ES Modules](#nodejs-with-es-modules)](#nodejs-with-es-modules)
    - [[Node.js with CommonJS](#nodejs-with-commonjs)](#nodejs-with-commonjs)
- [[Core Concepts](#core-concepts)](#core-concepts)
    - [[Client](#client)](#client)
        - [[Creating a Client](#creating-a-client)](#creating-a-client)
        - [[Using Testnet](#using-testnet)](#using-testnet)
        - [[Making Raw RPC Calls](#making-raw-rpc-calls)](#making-raw-rpc-calls)
        - [[Client Options Reference](#client-options-reference)](#client-options-reference)
        - [[Client Properties](#client-properties)](#client-properties)
    - [[Database API](#database-api)](#database-api) — `client.database`
        - [`[getDynamicGlobalProperties()](#getdynamicglobalproperties)`](#getdynamicglobalproperties) → [`[DynamicGlobalProperties](#-dynamicglobalproperties-interface)`](#-dynamicglobalproperties-interface)
        - [`[getChainProperties()](#getchainproperties)`](#getchainproperties) → [`[ChainProperties](#-chainproperties-interface)`](#-chainproperties-interface)
        - [`[getCurrentMedianHistoryPrice()](#getcurrentmedianhistoryprice)`](#getcurrentmedianhistoryprice) → [`[Price](#price-class)`](#price-class)
        - [`[getConfig()](#getconfig)`](#getconfig)
        - [`[getState(path)](#getstatepath)`](#getstatepath)
        - [`[getBlockHeader(blockNum)](#getblockheaderblocknum)`](#getblockheaderblocknum) → [`[BlockHeader](#-blockheader-interface)`](#-blockheader-interface)
        - [`[getBlock(blockNum)](#getblockblocknum)`](#getblockblocknum) → [`[SignedBlock](#-signedblock-interface)`](#-signedblock-interface)
        - [`[getOperations(blockNum, onlyVirtual?)](#getoperationsblocknum-onlyvirtual)`](#getoperationsblocknum-onlyvirtual) → [`[AppliedOperation[]](#-appliedoperation-interface)`](#-appliedoperation-interface)
        - [`[getAccounts(usernames)](#getaccountsusernames)`](#getaccountsusernames) → [`[ExtendedAccount[]](#-account-interface)`](#-account-interface)
        - [`[getDiscussions(by, query)](#getdiscussionsby-query)`](#getdiscussionsby-query) → [`[Discussion[]](#-discussion-interface)`](#-discussion-interface)
        - [`[getTransaction(txId)](#gettransactiontxid)`](#gettransactiontxid) → [`[SignedTransaction](#-transaction-interface)`](#-transaction-interface)
        - [`[getAccountHistory(account, from, limit, bitmask?)](#getaccounthistoryaccount-from-limit-operation_bitmask)`](#getaccounthistoryaccount-from-limit-operation_bitmask) → [`[AppliedOperation[]](#-appliedoperation-interface)`](#-appliedoperation-interface)
        - [`[getVestingDelegations(account, from?, limit?)](#getvestingdelegationsaccount-from-limit)`](#getvestingdelegationsaccount-from-limit) → [`[VestingDelegation[]](#-vestingdelegation-interface)`](#-vestingdelegation-interface)
        - [`[verifyAuthority(signedTransaction)](#verifyauthoritysignedtransaction)`](#verifyauthoritysignedtransaction)
        - [`[getVersion()](#getversion)`](#getversion)
    - [[Blockchain](#blockchain)](#blockchain) — `client.blockchain`
        - [`[getCurrentBlockNum(mode?)](#getcurrentblocknummode)`](#getcurrentblocknummode)
        - [`[getCurrentBlockHeader(mode?)](#getcurrentblockheadermode)`](#getcurrentblockheadermode) → [`[BlockHeader](#-blockheader-interface)`](#-blockheader-interface)
        - [`[getCurrentBlock(mode?)](#getcurrentblockmode)`](#getcurrentblockmode) → [`[SignedBlock](#-signedblock-interface)`](#-signedblock-interface)
        - [`[getBlockNumbers(options?)](#getblocknumbersoptions)`](#getblocknumbersoptions)
        - [`[getBlocks(options?)](#getblocksoptions)`](#getblocksoptions) → [`[SignedBlock](#-signedblock-interface)`](#-signedblock-interface)
        - [`[getOperations(options?)](#getoperationsoptions)`](#getoperationsoptions) → [`[AppliedOperation](#-appliedoperation-interface)`](#-appliedoperation-interface)
        - [[Stream Methods (Node.js)](#stream-methods-nodejs-streams)](#stream-methods-nodejs-streams)
    - [[Broadcast API](#broadcast-api)](#broadcast-api) — `client.broadcast`
        - [[Voting on Content](#voting-on-content)](#voting-on-content) → [`[TransactionConfirmation](#-transaction-interface)`](#-transaction-interface)
        - [[Transferring Funds](#transferring-funds)](#transferring-funds) → [`[TransactionConfirmation](#-transaction-interface)`](#-transaction-interface)
        - [[Creating Posts and Comments](#creating-posts-and-comments)](#creating-posts-and-comments) → [`[TransactionConfirmation](#-transaction-interface)`](#-transaction-interface)
        - [[Custom JSON Operations](#custom-json-operations)](#custom-json-operations) → [`[TransactionConfirmation](#-transaction-interface)`](#-transaction-interface)
        - [[Claiming Rewards](#claiming-rewards)](#claiming-rewards) → [`[TransactionConfirmation](#-transaction-interface)`](#-transaction-interface)
    - [[Resource Credits API](#resource-credits-api)](#resource-credits-api) — `client.rc`
        - [`[findRCAccounts(usernames)](#findrcaccountsusernames)`](#findrcaccountsusernames)
        - [`getRCMana(username)` / `getVPMana(username)`](#getrcmanausername--getvpmanausername)
        - [`[getResourceParams()](#getresourceparams)`](#getresourceparams)
        - [`[getResourcePool()](#getresourcepool)`](#getresourcepool)
        - [`[calculateRCMana(rc_account)](#calculatercmanarc_account)`](#calculatercmanarc_account)
        - [`[calculateVPMana(account)](#calculatevpmanaaccount)`](#calculatevpmanaaccount)
    - [[Pixamind API](#pixamind-api)](#pixamind-api) — `client.pixamind`
        - [`[getRankedPosts(options)](#getrankedpostsoptions)`](#getrankedpostsoptions) → [`[Discussion[]](#-discussion-interface)`](#-discussion-interface)
        - [`[getAccountPosts(options)](#getaccountpostsoptions)`](#getaccountpostsoptions) → [`[Discussion[]](#-discussion-interface)`](#-discussion-interface)
        - [`[getCommunity(options)](#getcommunityoptions)`](#getcommunityoptions) → [`[CommunityDetail](#-communitydetail-interface)`](#-communitydetail-interface)
        - [`[listCommunities(options)](#listcommunitiesoptions)`](#listcommunitiesoptions) → [`[CommunityDetail[]](#-communitydetail-interface)`](#-communitydetail-interface)
        - [`[listAllSubscriptions(account)](#listallsubscriptionsaccount)`](#listallsubscriptionsaccount)
        - [`[getAccountNotifications(options)](#getaccountnotificationsoptions)`](#getaccountnotificationsoptions) → [`[Notifications[]](#-notifications-interface)`](#-notifications-interface)
    - [[Account By Key API](#account-by-key-api)](#account-by-key-api) — `client.keys`
        - [`[getKeyReferences(keys)](#getkeyreferenceskeys)`](#getkeyreferenceskeys) → [`[AccountsByKey](#-accountsbykey-interface)`](#-accountsbykey-interface)
- [[Working with Assets](#working-with-assets)](#working-with-assets)
    - [[Asset Class](#asset-class)](#asset-class)
        - [[Creating Assets](#creating-assets)](#creating-assets)
        - [[Asset Properties & Methods](#asset-properties--methods)](#asset-properties--methods)
        - [[Asset Symbols Reference](#asset-symbols-reference)](#asset-symbols-reference)
    - [[Price Class](#price-class)](#price-class)
    - [[Helper Functions](#helper-functions)](#helper-functions)
        - [`[getVestingSharePrice(props)](#getvestingsharepriceprops)`](#getvestingsharepriceprops) → [`[Price](#price-class)`](#price-class)
        - [`[getVests(account, subtractDelegated?, addReceived?)](#getvestsaccount-subtractdelegated-addreceived)`](#getvestsaccount-subtractdelegated-addreceived)
- [[Cryptography](#cryptography)](#cryptography)
    - [[Private Keys](#private-keys)](#private-keys) — `PrivateKey`
        - [`[PrivateKey.fromLogin(username, password, role)](#creating-private-keys)`](#creating-private-keys)
        - [`[PrivateKey.fromString(wif)](#creating-private-keys)`](#creating-private-keys)
        - [`[PrivateKey.fromSeed(seed)](#creating-private-keys)`](#creating-private-keys)
        - [`[privateKey.createPublic()](#using-private-keys)`](#using-private-keys)
        - [`[privateKey.sign(message)](#using-private-keys)`](#using-private-keys) → [`[Signature](#signatures)`](#signatures)
    - [[Public Keys](#public-keys)](#public-keys) — `PublicKey`
        - [`[PublicKey.fromString(wif)](#public-keys)`](#public-keys)
        - [`[publicKey.verify(message, signature)](#public-keys)`](#public-keys)
    - [[Signatures](#signatures)](#signatures) — `Signature`
        - [`[signature.recover(message)](#signatures)`](#signatures) → [`[PublicKey](#public-keys)`](#public-keys)
    - [[Memo Encryption](#memo-encryption)](#memo-encryption) — `Memo`
        - [`[Memo.encode(privateKey, publicKey, message)](#memo-encryption)`](#memo-encryption)
        - [`[Memo.decode(privateKey, encoded)](#memo-encryption)`](#memo-encryption)
    - [[Crypto Utilities](#crypto-utilities)](#crypto-utilities) — `cryptoUtils`
- [[Building Transactions](#building-transactions)](#building-transactions)
- [[Operations Reference](#operations-reference)](#operations-reference)
    - [[Transfer Operations](#operations-reference)](#operations-reference)
    - [[Content Operations](#operations-reference)](#operations-reference)
    - [[Account Operations](#operations-reference)](#operations-reference)
    - [[Governance Operations](#operations-reference)](#operations-reference)
    - [[Market Operations](#operations-reference)](#operations-reference)
    - [[Savings Operations](#operations-reference)](#operations-reference)
    - [[Escrow Operations](#operations-reference)](#operations-reference)
    - [[Custom Operations](#operations-reference)](#operations-reference)
    - [[Virtual Operations (Read-Only)](#operations-reference)](#operations-reference)
- [[Utilities](#utilities)](#utilities) — `utils`
    - [`[utils.operationOrders](#operation-bitmask-filter)`](#operation-bitmask-filter)
    - [`[utils.makeBitMaskFilter(ops)](#operation-bitmask-filter)`](#operation-bitmask-filter)
    - [`[utils.sleep(ms)](#sleep)`](#sleep)
    - [`[utils.copy(obj)](#copy-objects)`](#copy-objects)
    - [`[utils.iteratorStream(iterator)](#iterator-to-stream)`](#iterator-to-stream)
    - [`[utils.buildWitnessUpdateOp(owner, props)](#build-witness-update)`](#build-witness-update)
    - [`[utils.waitForEvent(emitter, event)](#wait-for-event)`](#wait-for-event)
    - [`[utils.retryingFetch(...)](#retrying-fetch)`](#retrying-fetch)
- [[Serialization](#serialization)](#serialization) — `Types`
- [[Error Handling](#error-handling)](#error-handling)
- [[Types & Interfaces](#types--interfaces)](#types--interfaces)
    - [`[Account](#-account-interface)`](#-account-interface) / [`[ExtendedAccount](#-account-interface)`](#-account-interface)
    - [`[AppliedOperation](#-appliedoperation-interface)`](#-appliedoperation-interface)
    - [`Authority` / `AuthorityType`](#-authority-interface)
    - [`[BlockHeader](#-blockheader-interface)`](#-blockheader-interface) / [`[SignedBlock](#-signedblock-interface)`](#-signedblock-interface)
    - [`[ChainProperties](#-chainproperties-interface)`](#-chainproperties-interface)
    - [`[CommunityDetail](#-communitydetail-interface)`](#-communitydetail-interface)
    - [`[Discussion](#-discussion-interface)`](#-discussion-interface) / [`[Comment](#-discussion-interface)`](#-discussion-interface)
    - [`[DynamicGlobalProperties](#-dynamicglobalproperties-interface)`](#-dynamicglobalproperties-interface)
    - [`[DisqussionQuery](#-disqussionquery-interface)`](#-disqussionquery-interface)
    - [`[HexBuffer](#-hexbuffer-class)`](#-hexbuffer-class)
    - [`[Notifications](#-notifications-interface)`](#-notifications-interface)
    - [`Transaction` / `SignedTransaction` / `TransactionConfirmation`](#-transaction-interface)
    - [`VestingDelegation`](#-vestingdelegation-interface)
    - [`AccountsByKey`](#-accountsbykey-interface)
    - [Operation Interfaces (full list)](#-operation-interfaces)
- [Enumerations](#enumerations)
    - [`BlockchainMode`](#enumerations)
    - [`AssetSymbol`](#asset-symbols-reference)
    - [`DiscussionQueryCategory`](#discussion-query-categories)
    - [`KeyRole`](#key-roles-reference)
    - [`OperationName`](#-operation-interfaces)
    - [`VirtualOperationName`](#virtual-operations-read-only)
- [Constants](#constants)
- [Advanced Usage](#advanced-usage)

---

## Installation

### Via npm

```bash
npm install @pixagram/dpixa
```

### Via yarn

```bash
yarn add @pixagram/dpixa
```

### Via CDN

```html
<script src="https://unpkg.com/@pixagram/dpixa@latest/dist/dpixa.js"></script>
```

### Self-hosted

Download `dist/dpixa.js` from the repository and include it in your HTML:

```html
<script src="dpixa.js"></script>
```

---

## Quick Start

### Browser Usage

```html
<script src="https://unpkg.com/@pixagram/dpixa@latest/dist/dpixa.js"></script>
<script>
  const client = new dpixa.Client([
    "https://api.pixagram.io",
    "https://api.hivekings.com",
    "https://anyx.io"
  ]);

  client.database
    .getDiscussions("trending", { tag: "writing", limit: 5 })
    .then(function(discussions) {
      discussions.forEach(post => {
        console.log(`${post.title} by @${post.author}`);
      });
    });
</script>
```

### Node.js with ES Modules

```js
import { Client } from "@pixagram/dpixa";

const client = new Client([
  "https://api.pixagram.io",
  "https://api.hivekings.com"
]);

async function main() {
  const props = await client.database.getDynamicGlobalProperties();
  console.log(`Current block: ${props.head_block_number}`);
}

main();
```

### Node.js with CommonJS

```js
const { Client, PrivateKey } = require("@pixagram/dpixa");

const client = new Client(["https://api.pixagram.io"]);

// Vote on a post
const key = PrivateKey.fromLogin("username", "password", "posting");

client.broadcast
  .vote(
    {
      voter: "username",
      author: "almost-digital",
      permlink: "dpixa-is-the-best",
      weight: 10000
    },
    key
  )
  .then(result => {
    console.log(`Included in block: ${result.block_num}`);
  });
```

---

## Core Concepts

### Client

The `Client` class is your main entry point to interact with the Pixa blockchain. It manages RPC connections, provides access to various APIs, and handles failover between multiple nodes.

#### Creating a Client

```js
import { Client } from "@pixagram/dpixa";

// Basic initialization with multiple nodes for failover
const client = new Client([
  "https://api.pixagram.io",
  "https://api.hivekings.com",
  "https://anyx.io",
  "https://api.openhive.network"
]);

// With custom options
const clientWithOptions = new Client(["https://api.pixagram.io"], {
  timeout: 30000,              // Request timeout in ms (default: 60000)
  failoverThreshold: 3,        // Retry rounds before giving up
  consoleOnFailover: true,     // Log when failing over to another node
  addressPrefix: "PIX",        // Network address prefix
  chainId: "your-chain-id"    // Custom chain ID
});
```

#### Using Testnet

```js
// Create a client configured for testnet
const testClient = Client.testnet();
```

#### Making Raw RPC Calls

```js
// Direct RPC call to any API
const result = await client.call("database_api", "get_dynamic_global_properties", []);
```

<details>
<summary><strong>📋 Client Options Reference</strong></summary>

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | `number` | `60000` | Request timeout in milliseconds. Set to `0` to retry forever. |
| `failoverThreshold` | `number` | `3` | Number of retry rounds across all URLs before failing. Set to `0` for infinite retries. |
| `consoleOnFailover` | `boolean` | `false` | Log failover events to console |
| `addressPrefix` | `string` | `"PIX"` | Network address prefix for key encoding |
| `chainId` | `string` | Main chain ID | Blockchain chain ID (32-byte hex string) |
| `agent` | `http.Agent` | `https.globalAgent` | Custom HTTP agent for keep-alive connections |
| `backoff` | `(tries: number) => number` | Default backoff | Custom retry backoff function returning milliseconds |

</details>

#### Client Properties

```js
// Available API helpers
client.database   // DatabaseAPI - Query blockchain state
client.broadcast  // BroadcastAPI - Send transactions
client.blockchain // Blockchain - Stream blocks and operations
client.rc         // RCAPI - Resource credits
client.keys       // AccountByKeyAPI - Find accounts by key
client.pixamind   // PixamindAPI - Community features
client.transaction // TransactionStatusAPI - Check transaction status

// Network configuration (read-only)
client.chainId        // Buffer - Current chain ID
client.addressPrefix  // string - Address prefix (e.g., "PIX")
client.address        // string | string[] - Configured RPC addresses
client.options        // ClientOptions - Current options

// Mutable
client.currentAddress // string - Currently active RPC node
```

---

### Database API

The `DatabaseAPI` provides methods to query blockchain state, retrieve accounts, blocks, and content.

---

#### `getDynamicGlobalProperties()`

Returns the current state of the blockchain.

**Returns:** `Promise<`[`DynamicGlobalProperties`](#-dynamicglobalproperties-interface)`>`

```js
const props = await client.database.getDynamicGlobalProperties();
```

<details>
<summary><strong>📤 Example Response</strong></summary>

```js
{
  id: 0,
  head_block_number: 12345678,
  head_block_id: "00bc614e...",
  time: "2024-01-15T12:30:00",
  current_witness: "witness-name",
  total_pow: 514415,
  num_pow_witnesses: 172,
  virtual_supply: "400000000.000 PIXA",
  current_supply: "380000000.000 PIXA",
  current_pxs_supply: "15000000.000 PXS",
  total_vesting_fund_pixa: "150000000.000 PIXA",
  total_vesting_shares: "300000000000.000000 VESTS",
  total_reward_fund_pixa: "800000.000 PIXA",
  pending_rewarded_vesting_shares: "500000.000000 VESTS",
  pending_rewarded_vesting_pixa: "250.000 PIXA",
  pxs_interest_rate: 1000,  // 10% APR
  pxs_print_rate: 10000,
  maximum_block_size: 65536,
  current_aslot: 12500000,
  recent_slots_filled: "340282366920938463463374607431768211455",
  participation_count: 128,
  last_irreversible_block_num: 12345660,
  vote_power_reserve_rate: 10,
  current_reserve_ratio: 200000000
}
```

</details>

**Use Cases:**
- Check current block height
- Calculate VESTS to PIXA conversion
- Monitor network participation
- Get current witness schedule

```js
// Practical example: Calculate PIXA Power from VESTS
const props = await client.database.getDynamicGlobalProperties();
const totalVestingFund = Asset.fromString(props.total_vesting_fund_pixa);
const totalVestingShares = Asset.fromString(props.total_vesting_shares);

function vestsToPixa(vests) {
  return (vests * totalVestingFund.amount) / totalVestingShares.amount;
}

console.log(`1M VESTS = ${vestsToPixa(1000000).toFixed(3)} PIXA`);
```

---

#### `getChainProperties()`

Returns the median chain properties as voted by witnesses.

**Returns:** `Promise<`[`ChainProperties`](#-chainproperties-interface)`>`

```js
const chainProps = await client.database.getChainProperties();
```

<details>
<summary><strong>📤 Example Response</strong></summary>

```js
{
  account_creation_fee: "3.000 PIXA",
  maximum_block_size: 65536,
  pxs_interest_rate: 1000  // 10% APR (basis points)
}
```

</details>

**Use Cases:**
- Check minimum account creation fee
- Get current interest rate on PXS

```js
// Calculate actual account creation fee (30x the base fee)
const props = await client.database.getChainProperties();
const baseFee = Asset.fromString(props.account_creation_fee);
const actualFee = baseFee.multiply(30);
console.log(`Account creation costs: ${actualFee}`); // "90.000 PIXA"
```

---

#### `getCurrentMedianHistoryPrice()`

Returns the median PIXA/PXS price feed as reported by witnesses.

**Returns:** `Promise<`[`Price`](#price-class)`>`

```js
const price = await client.database.getCurrentMedianHistoryPrice();
```

<details>
<summary><strong>📤 Example Response</strong></summary>

```js
{
  base: "0.500 PXS",
  quote: "1.000 PIXA"
}
// This means 1 PIXA = 0.5 PXS
```

</details>

**Use Cases:**
- Calculate USD value of PIXA (PXS is pegged to USD)
- Estimate post payouts

```js
const price = await client.database.getCurrentMedianHistoryPrice();
const priceObj = Price.from(price);

// Convert PIXA to PXS value
const pixaAmount = Asset.fromString("100.000 PIXA");
const pxsValue = priceObj.convert(pixaAmount);
console.log(`100 PIXA ≈ ${pxsValue}`); // "50.000 PXS"
```

---

#### `getConfig()`

Returns the compile-time configuration of the node.

**Returns:** `Promise<{[name: string]: string | number | boolean}>`

```js
const config = await client.database.getConfig();
```

<details>
<summary><strong>📤 Example Response (partial)</strong></summary>

```js
{
  IS_TEST_NET: false,
  PIXA_BLOCKCHAIN_HARDFORK_VERSION: "1.27.0",
  PIXA_BLOCK_INTERVAL: 3,
  PIXA_BLOCKS_PER_DAY: 28800,
  PIXA_BLOCKS_PER_YEAR: 10512000,
  PIXA_CASHOUT_WINDOW_SECONDS: 604800,
  PIXA_CREATE_ACCOUNT_WITH_PIXA_MODIFIER: 30,
  PIXA_MAX_ACCOUNT_NAME_LENGTH: 16,
  PIXA_MAX_MEMO_SIZE: 2048,
  PIXA_MIN_ACCOUNT_NAME_LENGTH: 3,
  PIXA_SAVINGS_WITHDRAW_TIME: 259200,
  PIXA_VESTING_WITHDRAW_INTERVALS: 13,
  PIXA_VOTE_DUST_THRESHOLD: 50000000
  // ... many more
}
```

</details>

---

#### `getState(path)`

Returns the complete state for a URL path (legacy, use specific methods when possible).

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | `string` | URL path like `@username` or `trending/tag` |

**Returns:** `Promise<any>`

```js
// Get state for a user profile
const state = await client.database.getState("@alice");

// Get state for a tag
const tagState = await client.database.getState("trending/photography");
```

---

#### `getBlockHeader(blockNum)`

Returns the header of a specific block (without transactions).

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `blockNum` | `number` | Block number to fetch |

**Returns:** `Promise<`[`BlockHeader`](#-blockheader-interface)`>`

```js
const header = await client.database.getBlockHeader(12345678);
```

<details>
<summary><strong>📤 Example Response</strong></summary>

```js
{
  previous: "00bc614d...",
  timestamp: "2024-01-15T12:30:00",
  witness: "witness-name",
  transaction_merkle_root: "0000000000000000000000000000000000000000",
  extensions: []
}
```

</details>

---

#### `getBlock(blockNum)`

Returns a complete block including all transactions.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `blockNum` | `number` | Block number to fetch |

**Returns:** `Promise<`[`SignedBlock`](#-signedblock-interface)`>`

```js
const block = await client.database.getBlock(12345678);
```

<details>
<summary><strong>📤 Example Response</strong></summary>

```js
{
  previous: "00bc614d...",
  timestamp: "2024-01-15T12:30:00",
  witness: "witness-name",
  transaction_merkle_root: "abc123...",
  extensions: [],
  witness_signature: "1f4a2b...",
  block_id: "00bc614e...",
  signing_key: "PIX7abc...",
  transaction_ids: ["trx123...", "trx456..."],
  transactions: [
    {
      ref_block_num: 12345,
      ref_block_prefix: 987654321,
      expiration: "2024-01-15T12:31:00",
      operations: [
        ["vote", { voter: "alice", author: "bob", permlink: "post", weight: 10000 }]
      ],
      extensions: [],
      signatures: ["1f5b3c..."]
    }
  ]
}
```

</details>

**Use Cases:**
- Analyze block contents
- Process historical data
- Verify transactions

```js
// Process all transfers in a block
const block = await client.database.getBlock(12345678);

for (const tx of block.transactions) {
  for (const op of tx.operations) {
    const [opType, opData] = op;
    if (opType === "transfer") {
      console.log(`${opData.from} → ${opData.to}: ${opData.amount}`);
    }
  }
}
```

---

#### `getOperations(blockNum, onlyVirtual?)`

Returns all operations from a block, including virtual operations.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `blockNum` | `number` | - | Block number |
| `onlyVirtual` | `boolean` | `false` | Return only virtual operations |

**Returns:** `Promise<`[`AppliedOperation[]`](#-appliedoperation-interface)`>`

```js
// Get all operations
const allOps = await client.database.getOperations(12345678);

// Get only virtual operations (rewards, etc.)
const virtualOps = await client.database.getOperations(12345678, true);
```

<details>
<summary><strong>📤 Example Response</strong></summary>

```js
[
  {
    trx_id: "abc123...",
    block: 12345678,
    trx_in_block: 0,
    op_in_trx: 0,
    virtual_op: 0,
    timestamp: "2024-01-15T12:30:00",
    op: ["vote", { voter: "alice", author: "bob", permlink: "post", weight: 10000 }]
  },
  {
    trx_id: "0000000000000000000000000000000000000000",
    block: 12345678,
    trx_in_block: 65535,
    op_in_trx: 0,
    virtual_op: 1,
    timestamp: "2024-01-15T12:30:00",
    op: ["curation_reward", { curator: "alice", reward: "1.234567 VESTS", ... }]
  }
]
```

</details>

---

#### `getAccounts(usernames)`

Returns detailed information for multiple accounts.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `usernames` | `string[]` | Array of account names (max 1000) |

**Returns:** `Promise<`[`ExtendedAccount[]`](#-account-interface)`>`

```js
const accounts = await client.database.getAccounts(["alice", "bob", "charlie"]);
```

<details>
<summary><strong>📤 Example Response (single account)</strong></summary>

```js
[
  {
    id: 12345,
    name: "alice",
    owner: {
      weight_threshold: 1,
      account_auths: [],
      key_auths: [["PIX7abc...", 1]]
    },
    active: { /* similar structure */ },
    posting: { /* similar structure */ },
    memo_key: "PIX7xyz...",
    json_metadata: "{\"profile\":{\"name\":\"Alice\"}}",
    posting_json_metadata: "{\"profile\":{\"about\":\"Hello!\"}}",
    proxy: "",
    
    balance: "100.000 PIXA",
    savings_balance: "50.000 PIXA",
    pxs_balance: "25.000 PXS",
    savings_pxs_balance: "10.000 PXS",
    
    vesting_shares: "1000000.000000 VESTS",
    delegated_vesting_shares: "100000.000000 VESTS",
    received_vesting_shares: "50000.000000 VESTS",
    vesting_withdraw_rate: "0.000000 VESTS",
    
    reward_pixa_balance: "1.000 PIXA",
    reward_pxs_balance: "0.500 PXS",
    reward_vesting_balance: "100.000000 VESTS",
    reward_vesting_pixa: "0.050 PIXA",
    
    voting_power: 9800,  // 98%
    voting_manabar: {
      current_mana: "950000000000",
      last_update_time: 1705320600
    },
    
    post_count: 150,
    created: "2020-01-01T00:00:00",
    last_post: "2024-01-14T10:00:00",
    last_vote_time: "2024-01-15T12:00:00",
    
    curation_rewards: 50000,
    posting_rewards: 100000,
    
    witnesses_voted_for: 30
  }
]
```

</details>

**Use Cases:**
- Display user profiles
- Check balances
- Verify account authority

```js
// Get account and display formatted info
const [account] = await client.database.getAccounts(["alice"]);

if (account) {
  console.log(`@${account.name}`);
  console.log(`Balance: ${account.balance}`);
  console.log(`Pixa Power: ${account.vesting_shares}`);
  console.log(`Voting Power: ${(account.voting_power / 100).toFixed(2)}%`);
  console.log(`Posts: ${account.post_count}`);
  
  // Parse profile metadata
  try {
    const meta = JSON.parse(account.posting_json_metadata || account.json_metadata);
    if (meta.profile) {
      console.log(`Name: ${meta.profile.name || 'N/A'}`);
      console.log(`About: ${meta.profile.about || 'N/A'}`);
    }
  } catch (e) {
    // Invalid JSON metadata
  }
} else {
  console.log("Account not found");
}
```

---

#### `getDiscussions(by, query)`

Returns an array of posts/discussions based on sorting method.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `by` | `DiscussionQueryCategory` | Sorting method |
| `query` | `DisqussionQuery` | Query parameters |

**Returns:** `Promise<`[`Discussion[]`](#-discussion-interface)`>`

**Query Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tag` | `string` | No | Tag name, or username for `blog`/`feed` |
| `limit` | `number` | Yes | Results to return (max 100) |
| `filter_tags` | `string[]` | No | Tags to exclude |
| `select_authors` | `string[]` | No | Only include these authors |
| `select_tags` | `string[]` | No | Only include these tags |
| `truncate_body` | `number` | No | Truncate body to N bytes (0 = all) |
| `start_author` | `string` | No | Pagination: start from this author |
| `start_permlink` | `string` | No | Pagination: start from this permlink |
| `parent_author` | `string` | No | Filter by parent author |
| `parent_permlink` | `string` | No | Filter by parent permlink |

```js
// Get trending posts in a tag
const trending = await client.database.getDiscussions("trending", {
  tag: "photography",
  limit: 20
});

// Get posts from a user's blog
const blog = await client.database.getDiscussions("blog", {
  tag: "alice",  // For 'blog', tag = username
  limit: 10
});

// Get a user's feed (posts from people they follow)
const feed = await client.database.getDiscussions("feed", {
  tag: "alice",
  limit: 10
});

// Pagination
const page1 = await client.database.getDiscussions("trending", {
  tag: "art",
  limit: 20
});

const page2 = await client.database.getDiscussions("trending", {
  tag: "art",
  limit: 20,
  start_author: page1[page1.length - 1].author,
  start_permlink: page1[page1.length - 1].permlink
});
```

<details>
<summary><strong>📋 Discussion Query Categories</strong></summary>

| Category | Description | Tag Usage |
|----------|-------------|-----------|
| `trending` | Posts sorted by trending algorithm | Tag name |
| `hot` | Hot posts (recent + popular) | Tag name |
| `created` | Newest posts first | Tag name |
| `promoted` | Promoted posts (by spent PXS) | Tag name |
| `active` | Recently active (new comments) | Tag name |
| `blog` | Posts from user's blog | Username |
| `feed` | Posts from followed accounts | Username |
| `comments` | Comments by an author | Username |
| `votes` | Posts sorted by vote count | Tag name |
| `children` | Posts sorted by comment count | Tag name |
| `cashout` | Posts approaching payout | Tag name |

</details>

<details>
<summary><strong>📤 Example Response (single discussion)</strong></summary>

```js
[
  {
    id: 123456,
    author: "alice",
    permlink: "my-awesome-post",
    category: "photography",
    parent_author: "",
    parent_permlink: "photography",
    
    title: "My Awesome Photography Post",
    body: "Here is my post content with **markdown**...",
    json_metadata: "{\"tags\":[\"photography\",\"nature\"],\"image\":[\"https://...\"]}",
    
    created: "2024-01-14T10:00:00",
    last_update: "2024-01-14T10:00:00",
    depth: 0,
    children: 15,
    
    net_rshares: "50000000000000",
    net_votes: 42,
    
    total_payout_value: "0.000 PXS",
    curator_payout_value: "0.000 PXS",
    pending_payout_value: "12.500 PXS",
    
    active_votes: [
      { voter: "bob", weight: 10000, rshares: "1000000000", time: "2024-01-14T10:05:00" }
    ],
    
    author_reputation: 65000000000000,
    
    url: "/photography/@alice/my-awesome-post",
    root_title: "My Awesome Photography Post",
    
    beneficiaries: [],
    max_accepted_payout: "1000000.000 PXS",
    percent_pxs: 10000,
    allow_votes: true,
    allow_curation_rewards: true
  }
]
```

</details>

---

#### `getTransaction(txId)`

Returns a transaction by its ID.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `txId` | `string` | Transaction ID (40-char hex string) |

**Returns:** `Promise<`[`SignedTransaction`](#-transaction-interface)`>`

```js
const tx = await client.database.getTransaction("abc123def456...");
```

<details>
<summary><strong>📤 Example Response</strong></summary>

```js
{
  ref_block_num: 12345,
  ref_block_prefix: 987654321,
  expiration: "2024-01-15T12:31:00",
  operations: [
    ["transfer", {
      from: "alice",
      to: "bob",
      amount: "10.000 PIXA",
      memo: "Payment"
    }]
  ],
  extensions: [],
  signatures: ["1f4a2b3c..."]
}
```

</details>

---

#### `getAccountHistory(account, from, limit, operation_bitmask?)`

Returns account operation history.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `account` | `string` | Account name |
| `from` | `number` | Start index (-1 for most recent) |
| `limit` | `number` | Number of operations (max 1000) |
| `operation_bitmask` | `[number, number]` | Optional: filter by operation types |

**Returns:** `Promise<[[number,` [`AppliedOperation`](#-appliedoperation-interface)`]]>`

```js
// Get last 100 operations
const history = await client.database.getAccountHistory("alice", -1, 100);

// Process results (returns [index, operation] pairs)
for (const [index, op] of history) {
  console.log(`#${index}: ${op.op[0]} at block ${op.block}`);
}
```

**Filtering by Operation Type:**

```js
import { utils } from "@pixagram/dpixa";

const op = utils.operationOrders;

// Create filter for transfer-related operations
const transferFilter = utils.makeBitMaskFilter([
  op.transfer,
  op.transfer_to_vesting,
  op.transfer_to_savings,
  op.transfer_from_savings,
  op.claim_reward_balance
]);

const transfers = await client.database.getAccountHistory(
  "alice",
  -1,
  100,
  transferFilter
);

// Process only transfer operations
for (const [index, operation] of transfers) {
  const [opType, opData] = operation.op;
  console.log(`${opType}: ${JSON.stringify(opData)}`);
}
```

<details>
<summary><strong>📤 Example Response</strong></summary>

```js
[
  [
    12345,  // Operation index
    {
      trx_id: "abc123...",
      block: 12345678,
      trx_in_block: 5,
      op_in_trx: 0,
      virtual_op: 0,
      timestamp: "2024-01-15T12:30:00",
      op: ["transfer", {
        from: "alice",
        to: "bob",
        amount: "10.000 PIXA",
        memo: "Payment"
      }]
    }
  ]
]
```

</details>

---

#### `getVestingDelegations(account, from?, limit?)`

Returns vesting delegations made by an account.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `account` | `string` | - | Delegator account name |
| `from` | `string` | `""` | Start from delegatee (for pagination) |
| `limit` | `number` | `1000` | Max results (max 1000) |

**Returns:** `Promise<`[`VestingDelegation[]`](#-vestingdelegation-interface)`>`

```js
const delegations = await client.database.getVestingDelegations("alice", "", 100);

for (const d of delegations) {
  console.log(`Delegating ${d.vesting_shares} to @${d.delegatee}`);
}
```

<details>
<summary><strong>📤 Example Response</strong></summary>

```js
[
  {
    id: 12345,
    delegator: "alice",
    delegatee: "bob",
    vesting_shares: "100000.000000 VESTS",
    min_delegation_time: "2024-01-20T12:00:00"
  },
  {
    id: 12346,
    delegator: "alice",
    delegatee: "charlie",
    vesting_shares: "50000.000000 VESTS",
    min_delegation_time: "2024-01-22T08:00:00"
  }
]
```

</details>

---

#### `verifyAuthority(signedTransaction)`

Verifies that a signed transaction has valid signatures.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `signedTransaction` | `SignedTransaction` | Transaction with signatures |

**Returns:** `Promise<boolean>`

```js
const isValid = await client.database.verifyAuthority(signedTx);
console.log(`Transaction is ${isValid ? "valid" : "invalid"}`);
```

---

#### `getVersion()`

Returns the version information of the RPC node.

**Returns:** `Promise<{blockchain_version: string, pixa_revision: string, fc_revision: string}>`

```js
const version = await client.database.getVersion();
console.log(`Node version: ${version.blockchain_version}`);
```

---

### Blockchain

The `Blockchain` helper provides streaming capabilities for real-time blockchain data.

---

#### `getCurrentBlockNum(mode?)`

Returns the current block number.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mode` | `BlockchainMode` | `Irreversible` | Block finality mode |

**Returns:** `Promise<number>`

```js
import { BlockchainMode } from "@pixagram/dpixa";

// Get last irreversible block (confirmed, won't change)
const irreversible = await client.blockchain.getCurrentBlockNum();

// Get head block (may be reversed in case of fork)
const head = await client.blockchain.getCurrentBlockNum(BlockchainMode.Latest);

console.log(`Irreversible: ${irreversible}, Head: ${head}`);
```

---

#### `getCurrentBlockHeader(mode?)`

Returns the current block header.

**Returns:** `Promise<`[`BlockHeader`](#-blockheader-interface)`>`

```js
const header = await client.blockchain.getCurrentBlockHeader();
console.log(`Current witness: ${header.witness}`);
```

---

#### `getCurrentBlock(mode?)`

Returns the current full block.

**Returns:** `Promise<`[`SignedBlock`](#-signedblock-interface)`>`

```js
const block = await client.blockchain.getCurrentBlock();
console.log(`Block has ${block.transactions.length} transactions`);
```

---

#### `getBlockNumbers(options?)`

Returns an async iterator of block numbers.

**Parameters:**

| Option | Type | Description |
|--------|------|-------------|
| `from` | `number` | Starting block (default: current) |
| `to` | `number` | Ending block (default: infinite) |
| `mode` | `BlockchainMode` | Finality mode |

**Returns:** `AsyncGenerator<number>`

```js
// Stream new block numbers indefinitely
for await (const num of client.blockchain.getBlockNumbers()) {
  console.log(`New block: ${num}`);
}

// Process specific range
for await (const num of client.blockchain.getBlockNumbers({ 
  from: 50000000, 
  to: 50000100 
})) {
  console.log(`Processing block ${num}`);
}

// Get latest blocks (may include reversible)
for await (const num of client.blockchain.getBlockNumbers({
  mode: BlockchainMode.Latest
})) {
  console.log(`Head block: ${num}`);
}
```

---

#### `getBlocks(options?)`

Returns an async iterator of full blocks.

**Returns:** `AsyncGenerator<`[`SignedBlock`](#-signedblock-interface)`>`

```js
// Stream all new blocks
for await (const block of client.blockchain.getBlocks()) {
  console.log(`Block #${block.block_id} by @${block.witness}`);
  console.log(`  Transactions: ${block.transactions.length}`);
  
  // Process each transaction
  for (const tx of block.transactions) {
    for (const [opType, opData] of tx.operations) {
      // Handle operations
    }
  }
}

// Start from specific block
for await (const block of client.blockchain.getBlocks({ from: 50000000 })) {
  // Process historical blocks
  if (block.block_id === "target") break;
}
```

---

#### `getOperations(options?)`

Returns an async iterator of all operations (including virtual).

**Returns:** `AsyncGenerator<`[`AppliedOperation`](#-appliedoperation-interface)`>`

```js
// Stream all operations
for await (const appliedOp of client.blockchain.getOperations()) {
  const [opType, opData] = appliedOp.op;
  
  switch (opType) {
    case "transfer":
      console.log(`Transfer: ${opData.from} → ${opData.to}: ${opData.amount}`);
      break;
    case "vote":
      const voteType = opData.weight > 0 ? "upvote" : opData.weight < 0 ? "downvote" : "unvote";
      console.log(`Vote: ${opData.voter} ${voteType} @${opData.author}/${opData.permlink}`);
      break;
    case "curation_reward":  // Virtual operation
      console.log(`Curation reward: ${opData.curator} earned ${opData.reward}`);
      break;
  }
}
```

---

#### Stream Methods (Node.js Streams)

Convert iterators to Node.js readable streams.

**Returns:** `ReadableStream`

```js
// Block number stream
const numStream = client.blockchain.getBlockNumberStream();

// Block stream
const blockStream = client.blockchain.getBlockStream();

// Operations stream
const opStream = client.blockchain.getOperationsStream();

// Use with pipes
const es = require("event-stream");

blockStream
  .pipe(es.map((block, cb) => {
    cb(null, `Block ${block.block_id}\n`);
  }))
  .pipe(process.stdout);
```

---

### Broadcast API

The broadcast API sends transactions to the blockchain and returns a `TransactionConfirmation`.

<details>
<summary><strong>📤 Broadcast Response (TransactionConfirmation)</strong></summary>

```js
{
  id: "trx123abc...",     // Transaction ID
  block_num: 12345678,    // Block number where included
  trx_num: 5,             // Transaction index in block
  expired: false          // Whether transaction expired
}
```

</details>

---

#### Voting on Content

```js
import { Client, PrivateKey } from "@pixagram/dpixa";

const client = new Client(["https://api.pixagram.io"]);
const postingKey = PrivateKey.fromLogin("myuser", "mypassword", "posting");

// Upvote 100%
const result = await client.broadcast.vote({
  voter: "myuser",
  author: "post-author",
  permlink: "post-permlink",
  weight: 10000  // 100% = 10000
}, postingKey);

console.log(`Vote included in block ${result.block_num}`);
```

**Vote Weight Guide:**

| Weight | Meaning |
|--------|---------|
| `10000` | 100% upvote |
| `5000` | 50% upvote |
| `0` | Remove vote |
| `-5000` | 50% downvote |
| `-10000` | 100% downvote |

---

#### Transferring Funds

```js
const activeKey = PrivateKey.fromLogin("myuser", "mypassword", "active");

// Transfer PIXA
await client.broadcast.transfer({
  from: "myuser",
  to: "recipient",
  amount: "10.000 PIXA",
  memo: "Here's your payment!"
}, activeKey);

// Transfer PXS
await client.broadcast.transfer({
  from: "myuser",
  to: "recipient",
  amount: "5.000 PXS",
  memo: "PXS transfer"
}, activeKey);

// Encrypted memo (starts with #)
const memoKey = PrivateKey.fromLogin("myuser", "mypassword", "memo");
const recipientMemoKey = "PIX7abc..."; // Get from recipient's account

const encryptedMemo = Memo.encode(memoKey, recipientMemoKey, "Secret message");

await client.broadcast.transfer({
  from: "myuser",
  to: "recipient",
  amount: "1.000 PIXA",
  memo: encryptedMemo  // "#encoded..."
}, activeKey);
```

---

#### Creating Posts and Comments

```js
const postingKey = PrivateKey.fromLogin("myuser", "mypassword", "posting");

// Create a new post
await client.broadcast.comment({
  parent_author: "",              // Empty for root posts
  parent_permlink: "photography", // Category/tag
  author: "myuser",
  permlink: "my-first-photo-post",
  title: "My First Photography Post",
  body: `
# Hello World!

This is my first post with **markdown** support.

![My Photo](https://example.com/photo.jpg)
  `,
  json_metadata: JSON.stringify({
    tags: ["photography", "nature", "introduction"],
    image: ["https://example.com/photo.jpg"],
    app: "myapp/1.0",
    format: "markdown"
  })
}, postingKey);

// Reply to a post
await client.broadcast.comment({
  parent_author: "originalauthor",
  parent_permlink: "original-post",
  author: "myuser",
  permlink: "re-originalauthor-original-post-20240115",
  title: "",  // Replies typically have no title
  body: "Great post! Thanks for sharing this.",
  json_metadata: JSON.stringify({
    tags: ["photography"],
    app: "myapp/1.0"
  })
}, postingKey);
```

---

#### Custom JSON Operations

```js
// Follow a user
await client.broadcast.customJson({
  required_auths: [],
  required_posting_auths: ["myuser"],
  id: "follow",
  json: JSON.stringify([
    "follow",
    {
      follower: "myuser",
      following: "targetuser",
      what: ["blog"]  // ["blog"] to follow, [] to unfollow
    }
  ])
}, postingKey);

// Reblog/Resteem a post
await client.broadcast.customJson({
  required_auths: [],
  required_posting_auths: ["myuser"],
  id: "follow",
  json: JSON.stringify([
    "reblog",
    {
      account: "myuser",
      author: "post-author",
      permlink: "post-permlink"
    }
  ])
}, postingKey);
```

---

#### Claiming Rewards

```js
const postingKey = PrivateKey.fromLogin("myuser", "mypassword", "posting");

// First, check pending rewards
const [account] = await client.database.getAccounts(["myuser"]);

console.log(`Pending rewards:`);
console.log(`  PIXA: ${account.reward_pixa_balance}`);
console.log(`  PXS: ${account.reward_pxs_balance}`);
console.log(`  VESTS: ${account.reward_vesting_balance}`);

// Claim all rewards
await client.broadcast.claimRewardBalance({
  account: "myuser",
  reward_pixa: account.reward_pixa_balance,
  reward_pxs: account.reward_pxs_balance,
  reward_vests: account.reward_vesting_balance
}, postingKey);
```

---

### Resource Credits API

The RC API helps manage and monitor resource credits (transaction bandwidth).

---

#### `findRCAccounts(usernames)`

Get RC account information for multiple users.

**Returns:** `Promise<RCAccount[]>`

```js
const rcAccounts = await client.rc.findRCAccounts(["alice", "bob"]);

for (const rc of rcAccounts) {
  console.log(`@${rc.account}: ${rc.rc_manabar.current_mana} RC`);
}
```

---

#### `getRCMana(username)` / `getVPMana(username)`

Get calculated mana (regenerated to current time).

**Returns:** `Promise<Manabar>`

```js
// Get RC mana
const rcMana = await client.rc.getRCMana("alice");
console.log(`RC: ${rcMana.current_mana} / ${rcMana.max_mana} (${rcMana.percentage}%)`);

// Get Voting Power mana
const vpMana = await client.rc.getVPMana("alice");
console.log(`VP: ${vpMana.percentage}%`);
```

<details>
<summary><strong>📤 Example Manabar Response</strong></summary>

```js
{
  current_mana: "9500000000000",
  max_mana: "10000000000000",
  percentage: 95  // 95% mana remaining
}
```

</details>

---

#### `getResourceParams()`

Returns the global resource parameters (used for advanced RC cost calculation).

**Returns:** `Promise<RCParams>`

```js
const params = await client.rc.getResourceParams();
console.log(params);
```

---

#### `getResourcePool()`

Returns the global resource pool state.

**Returns:** `Promise<RCPool>`

```js
const pool = await client.rc.getResourcePool();
console.log(pool);
```

---

#### `calculateRCMana(rc_account)`

Calculates the current RC mana from a raw RC account object (as returned by `findRCAccounts()`). Regenerates mana to the current time.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `rc_account` | `RCAccount` | RC account object from `findRCAccounts()` |

**Returns:** `Manabar`

```js
const rcAccounts = await client.rc.findRCAccounts(["alice"]);
const mana = client.rc.calculateRCMana(rcAccounts[0]);
console.log(`RC: ${mana.percentage}%`);
```

---

#### `calculateVPMana(account)`

Calculates the current voting power mana from a standard account object (as returned by `getAccounts()`). Regenerates mana to the current time.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `account` | [`Account`](#-account-interface) | Account object from `getAccounts()` |

**Returns:** `Manabar`

```js
const [account] = await client.database.getAccounts(["alice"]);
const vp = client.rc.calculateVPMana(account);
console.log(`Voting Power: ${vp.percentage}%`);
```

---

### Pixamind API

The Pixamind API provides access to community features and notifications.

---

#### `getRankedPosts(options)`

Get trending, hot, or new posts with community support.

**Returns:** `Promise<`[`Discussion[]`](#-discussion-interface)`>`

```js
const posts = await client.pixamind.getRankedPosts({
  sort: "trending",
  tag: "photography",
  limit: 20
});
```

---

#### `getCommunity(options)`

Get community details.

**Returns:** `Promise<`[`CommunityDetail[]`](#-communitydetail-interface)`>`

```js
const community = await client.pixamind.getCommunity({
  name: "hive-123456"
});
```

<details>
<summary><strong>📤 Example Response</strong></summary>

```js
{
  id: 1234,
  name: "hive-123456",
  title: "Photography Lovers",
  about: "A community for photography enthusiasts",
  lang: "en",
  type_id: 1,
  is_nsfw: false,
  subscribers: 5000,
  sum_pending: 1500,
  num_pending: 100,
  num_authors: 200,
  created_at: "2021-01-01T00:00:00",
  avatar_url: "https://...",
  description: "Welcome to our community!",
  flag_text: "",
  settings: {},
  team: ["admin1", "mod1", "mod2"],
  admins: ["admin1"]
}
```

</details>

---

#### `getAccountPosts(options)`

Get posts by a particular account.

**Parameters:**

| Option | Type | Description |
|--------|------|-------------|
| `sort` | `string` | Sort order: `"blog"`, `"feed"`, `"posts"`, `"comments"`, `"replies"` |
| `account` | `string` | Account name |
| `limit` | `number` | Max results to return |
| `start_author` | `string` | Pagination: start author |
| `start_permlink` | `string` | Pagination: start permlink |

**Returns:** `Promise<`[`Discussion[]`](#-discussion-interface)`>`

```js
const posts = await client.pixamind.getAccountPosts({
  sort: "posts",
  account: "alice",
  limit: 10
});

for (const post of posts) {
  console.log(`${post.title} (${post.pending_payout_value})`);
}
```

---

#### `listCommunities(options)`

List all available communities.

**Parameters:**

| Option | Type | Description |
|--------|------|-------------|
| `last` | `string` | Last community name for pagination |
| `limit` | `number` | Max results to return |
| `sort` | `string` | Sort order: `"rank"`, `"new"`, `"subs"` |
| `query` | `string` | Search query string |

**Returns:** `Promise<`[`CommunityDetail[]`](#-communitydetail-interface)`>`

```js
const communities = await client.pixamind.listCommunities({
  limit: 25,
  sort: "rank"
});

for (const c of communities) {
  console.log(`${c.title} — ${c.subscribers} subscribers`);
}
```

---

#### `listAllSubscriptions(account)`

List all community subscriptions for an account.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `account` | `string \| object` | Account name or `{ account: "name" }` |

**Returns:** `Promise<`[`Discussion[]`](#-discussion-interface)`>` — returns role and community info

```js
const subs = await client.pixamind.listAllSubscriptions("alice");

for (const sub of subs) {
  console.log(`Subscribed to: ${sub.title}`);
}
```

---

#### `getAccountNotifications(options)`

Get notifications for an account.

**Returns:** `Promise<`[`Notifications[]`](#-notifications-interface)`>`

```js
const notifications = await client.pixamind.getAccountNotifications({
  account: "alice",
  limit: 50
});
```

<details>
<summary><strong>📤 Example Response</strong></summary>

```js
[
  {
    id: 12345,
    type: "vote",
    score: 50,
    date: "2024-01-15T12:30:00",
    msg: "@bob voted on your post",
    url: "@alice/my-post"
  },
  {
    id: 12344,
    type: "reply",
    score: 100,
    date: "2024-01-15T12:25:00",
    msg: "@charlie replied to your post",
    url: "@alice/my-post#@charlie/re-alice-my-post"
  }
]
```

</details>

---

### Account By Key API

Find accounts associated with a public key.

---

#### `getKeyReferences(keys)`

Find all accounts that use a specific public key.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `keys` | `(string \| PublicKey)[]` | Array of public keys |

**Returns:** `Promise<`[`AccountsByKey`](#-accountsbykey-interface)`>`

```js
const result = await client.keys.getKeyReferences([
  "PIX7abc123...",
  "PIX7xyz789..."
]);

// result.accounts = [["alice", "alice-alt"], ["bob"]]
```

**Use Case Example:**

```js
// Find account for a key
const key = PrivateKey.fromLogin("user", "pass", "posting").createPublic();
const { accounts } = await client.keys.getKeyReferences([key.toString()]);

if (accounts[0].length > 0) {
  console.log(`Key belongs to: ${accounts[0].join(", ")}`);
} else {
  console.log("Key not found on any account");
}
```

---

## Working with Assets

### Asset Class

The `Asset` class provides a convenient way to work with blockchain tokens.

#### Creating Assets

```js
import { Asset } from "@pixagram/dpixa";

// From string (most common)
const pixa = Asset.fromString("100.000 PIXA");
const pxs = Asset.fromString("50.500 PXS");
const vests = Asset.fromString("1000000.000000 VESTS");

// From number with symbol
const amount = Asset.from(100, "PIXA");  // "100.000 PIXA"

// Using constructor
const asset = new Asset(100.5, "PIXA");  // "100.500 PIXA"

// Validate expected symbol
const validated = Asset.fromString("100.000 PIXA", "PIXA");  // OK
// Asset.fromString("100.000 PXS", "PIXA");  // Throws!
```

#### Asset Properties & Methods

```js
const asset = Asset.fromString("123.456 PIXA");

// Properties
asset.amount;         // 123.456 (number)
asset.symbol;         // "PIXA" (string)
asset.getPrecision(); // 3 (decimal places)

// Arithmetic (returns NEW Asset)
asset.add(10);           // "133.456 PIXA"
asset.subtract(20);      // "103.456 PIXA"
asset.multiply(2);       // "246.912 PIXA"
asset.divide(2);         // "61.728 PIXA"

// Static methods
Asset.min(a, b);    // Returns smaller
Asset.max(a, b);    // Returns larger

// Serialization
asset.toString();  // "123.456 PIXA"
asset.toJSON();    // "123.456 PIXA"
```

<details>
<summary><strong>📋 Asset Symbols Reference</strong></summary>

| Symbol | Description | Precision | Example |
|--------|-------------|-----------|---------|
| `PIXA` | Main token | 3 | `"100.000 PIXA"` |
| `PXS` | Pixa Dollar (stablecoin) | 3 | `"50.500 PXS"` |
| `VESTS` | Vesting shares (Pixa Power) | 6 | `"1000000.000000 VESTS"` |
| `TESTS` | Testnet main token | 3 | `"100.000 TESTS"` |
| `TPS` | Testnet dollar | 3 | `"50.000 TPS"` |

</details>

---

### Price Class

The `Price` class represents an exchange rate between two assets.

```js
import { Price, Asset } from "@pixagram/dpixa";

// Create from Asset instances
const price = new Price(
  Asset.fromString("1.000 PIXA"),   // base
  Asset.fromString("0.500 PXS")     // quote
);
// Means: 1 PIXA = 0.5 PXS

// Create from object
const price2 = Price.from({
  base: "1.000 PIXA",
  quote: "0.500 PXS"
});

// Convert between assets
const pixaAmount = Asset.fromString("100.000 PIXA");
const pxsValue = price.convert(pixaAmount);
console.log(pxsValue.toString());  // "50.000 PXS"

// String representation
console.log(price.toString());  // "1.000 PIXA:0.500 PXS"
```

---

### Helper Functions

#### `getVestingSharePrice(props)`

Calculate the current VESTS to PIXA conversion rate.

**Returns:** `Price`

```js
import { getVestingSharePrice } from "@pixagram/dpixa";

const props = await client.database.getDynamicGlobalProperties();
const vestingPrice = getVestingSharePrice(props);

// Convert VESTS to PIXA
const vests = Asset.fromString("1000000.000000 VESTS");
const pixa = vestingPrice.convert(vests);
console.log(`1M VESTS = ${pixa}`);  // e.g., "500.000 PIXA"
```

#### `getVests(account, subtractDelegated?, addReceived?)`

Calculate effective vesting shares for an account.

**Returns:** `number`

```js
import { getVests } from "@pixagram/dpixa";

const [account] = await client.database.getAccounts(["alice"]);

// Get total effective VESTS
const totalVests = getVests(account, true, true);
// Subtracts delegated, adds received

// Get only owned VESTS (no delegations)
const ownedVests = getVests(account, true, false);

// Get raw VESTS (ignore delegations)
const rawVests = getVests(account, false, false);
```

---

## Cryptography

### Private Keys

#### Creating Private Keys

```js
import { PrivateKey } from "@pixagram/dpixa";

// From username/password (most common method)
const postingKey = PrivateKey.fromLogin("username", "password", "posting");
const activeKey = PrivateKey.fromLogin("username", "password", "active");
const ownerKey = PrivateKey.fromLogin("username", "password", "owner");
const memoKey = PrivateKey.fromLogin("username", "password", "memo");

// From WIF (Wallet Import Format) string
const key = PrivateKey.fromString("5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3");

// From arbitrary seed
const seedKey = PrivateKey.fromSeed("my-secret-seed-phrase");

// From buffer
const bufferKey = PrivateKey.from(someBuffer);
```

<details>
<summary><strong>📋 Key Roles Reference</strong></summary>

| Role | Usage | Required For |
|------|-------|--------------|
| `owner` | Account recovery, changing keys | Changing owner/active/posting keys, account recovery |
| `active` | Financial operations | Transfers, power up/down, witness voting, market orders |
| `posting` | Social operations | Posting, commenting, voting, following |
| `memo` | Private messaging | Encrypting/decrypting private memos |

**Security Note:** Always use the minimum required key. Never use owner key for regular operations.

</details>

#### Using Private Keys

```js
const privateKey = PrivateKey.fromLogin("user", "pass", "posting");

// Get corresponding public key
const publicKey = privateKey.createPublic();
console.log(publicKey.toString());  // "PIX7abc..."

// Sign a message (32-byte hash)
const message = cryptoUtils.sha256(Buffer.from("Hello, World!"));
const signature = privateKey.sign(message);

// Export as WIF string
const wif = privateKey.toString();
console.log(wif);  // "5K..."

// Get shared secret (for memo encryption)
const recipientPubKey = PublicKey.fromString("PIX7xyz...");
const sharedSecret = privateKey.get_shared_secret(recipientPubKey);
```

---

### Public Keys

```js
import { PublicKey, PrivateKey } from "@pixagram/dpixa";

// From string
const pubKey = PublicKey.fromString("PIX7hLHCpMfLeHD4pkpKPrCFRGqPKcqLp4GZrw2NVHHLv9FpT4rQz");

// From private key
const privateKey = PrivateKey.fromLogin("user", "pass", "posting");
const publicKey = privateKey.createPublic();

// Verify a signature
const message = cryptoUtils.sha256(Buffer.from("Hello"));
const signature = privateKey.sign(message);
const isValid = publicKey.verify(message, signature);
console.log(`Signature valid: ${isValid}`);  // true

// Export
const wif = publicKey.toString();  // "PIX7hLHCpM..."
```

---

### Signatures

```js
import { Signature, PrivateKey, cryptoUtils } from "@pixagram/dpixa";

const privateKey = PrivateKey.fromLogin("user", "pass", "active");
const message = cryptoUtils.sha256(Buffer.from("Sign this message"));

// Create signature
const signature = privateKey.sign(message);

// Export signature
const sigString = signature.toString();  // Hex string
const sigBuffer = signature.toBuffer();  // Buffer

// Import signature
const importedSig = Signature.fromString(sigString);
const fromBuffer = Signature.fromBuffer(sigBuffer);

// Recover public key from signature
const recoveredPubKey = signature.recover(message);
```

---

### Memo Encryption

```js
import { Memo, PrivateKey } from "@pixagram/dpixa";

// Get recipient's public memo key from their account
const [recipient] = await client.database.getAccounts(["recipient"]);
const recipientMemoKey = recipient.memo_key;

// Sender's private memo key
const senderPrivate = PrivateKey.fromLogin("sender", "password", "memo");

// Encrypt a memo
const encrypted = Memo.encode(
  senderPrivate,
  recipientMemoKey,
  "This is a secret message!"
);
console.log(encrypted);  // "#JfoiM3FbR3..." (starts with #)

// Decrypt (recipient side)
const recipientPrivate = PrivateKey.fromLogin("recipient", "password", "memo");
const decrypted = Memo.decode(recipientPrivate, encrypted);
console.log(decrypted);  // "This is a secret message!"
```

---

### Crypto Utilities

```js
import { cryptoUtils } from "@pixagram/dpixa";

// Hashing
const sha256 = cryptoUtils.sha256("Hello World");           // Buffer
const doubleSha = cryptoUtils.doubleSha256("Hello");        // sha256(sha256(x))
const ripemd = cryptoUtils.ripemd160("Hello");              // Buffer

// Key encoding
const encoded = cryptoUtils.encodePrivate(keyBuffer);   // WIF string
const decoded = cryptoUtils.decodePrivate("5K...");     // Buffer
const pubEncoded = cryptoUtils.encodePublic(pubKeyBuffer, "PIX");

// Validation
const isWif = cryptoUtils.isWif("5KQwrPbwd...");        // true
const isCanonical = cryptoUtils.isCanonicalSignature(sigBuffer);

// Transaction utilities
const digest = cryptoUtils.transactionDigest(transaction);
const txId = cryptoUtils.generateTrxId(transaction);

// Sign a transaction
const signedTx = cryptoUtils.signTransaction(
  transaction,
  [privateKey1, privateKey2],  // Can use multiple keys
  chainId  // Optional, defaults to main chain
);
```

---

## Building Transactions

For advanced use cases, you can build and sign transactions manually.

```js
import { Client, PrivateKey, cryptoUtils } from "@pixagram/dpixa";

const client = new Client(["https://api.pixagram.io"]);

// Get reference block info
const props = await client.database.getDynamicGlobalProperties();
const refBlockNum = props.head_block_number - 3;
const refBlock = await client.database.getBlock(refBlockNum);

// Build transaction
const transaction = {
  ref_block_num: refBlockNum & 0xFFFF,
  ref_block_prefix: Buffer.from(refBlock.block_id, "hex").readUInt32LE(4),
  expiration: new Date(Date.now() + 60000).toISOString().slice(0, -5),
  operations: [
    ["vote", {
      voter: "myuser",
      author: "post-author",
      permlink: "post-permlink",
      weight: 10000
    }]
  ],
  extensions: []
};

// Sign transaction
const privateKey = PrivateKey.fromLogin("myuser", "password", "posting");
const signedTx = cryptoUtils.signTransaction(
  transaction,
  [privateKey],
  client.chainId
);

// Broadcast
const result = await client.call("condenser_api", "broadcast_transaction_synchronous", [signedTx]);
console.log(`Transaction ID: ${result.id}`);
```

---

## Operations Reference

<details>
<summary><strong>📋 Transfer Operations</strong></summary>

### `transfer`
```js
["transfer", {
  from: "sender",
  to: "recipient",
  amount: "10.000 PIXA",  // or PXS
  memo: "Optional message"
}]
```

### `transfer_to_vesting` (Power Up)
```js
["transfer_to_vesting", {
  from: "sender",
  to: "recipient",  // Can be same or different
  amount: "100.000 PIXA"
}]
```

### `withdraw_vesting` (Power Down)
```js
["withdraw_vesting", {
  account: "user",
  vesting_shares: "1000000.000000 VESTS"  // 0 to cancel
}]
```

### `delegate_vesting_shares`
```js
["delegate_vesting_shares", {
  delegator: "user",
  delegatee: "recipient",
  vesting_shares: "100000.000000 VESTS"  // 0 to undelegate
}]
```

### `recurrent_transfer`
```js
["recurrent_transfer", {
  from: "sender",
  to: "recipient",
  amount: "10.000 PIXA",
  memo: "Monthly payment",
  recurrence: 24,    // Hours between transfers
  executions: 12,    // Number of transfers (0 to cancel)
  extensions: []
}]
```

</details>

<details>
<summary><strong>📋 Content Operations</strong></summary>

### `comment`
```js
["comment", {
  parent_author: "",           // Empty for root post
  parent_permlink: "category", // Category/tag for posts
  author: "user",
  permlink: "my-post",
  title: "Post Title",         // Empty for comments
  body: "Post content...",
  json_metadata: JSON.stringify({
    tags: ["tag1", "tag2"],
    image: ["https://..."],
    app: "myapp/1.0"
  })
}]
```

### `comment_options`
```js
["comment_options", {
  author: "user",
  permlink: "my-post",
  max_accepted_payout: "1000000.000 PXS",
  percent_pxs: 10000,  // 0-10000
  allow_votes: true,
  allow_curation_rewards: true,
  extensions: [
    [0, {
      beneficiaries: [
        { account: "beneficiary1", weight: 1000 }  // 10%
      ]
    }]
  ]
}]
```

### `vote`
```js
["vote", {
  voter: "user",
  author: "post_author",
  permlink: "post_permlink",
  weight: 10000  // -10000 to 10000
}]
```

### `delete_comment`
```js
["delete_comment", {
  author: "user",
  permlink: "my-post"
}]
```

</details>

<details>
<summary><strong>📋 Account Operations</strong></summary>

### `account_create`
```js
["account_create", {
  fee: "3.000 PIXA",
  creator: "existing_user",
  new_account_name: "newuser",
  owner: { weight_threshold: 1, account_auths: [], key_auths: [["PIX...", 1]] },
  active: { weight_threshold: 1, account_auths: [], key_auths: [["PIX...", 1]] },
  posting: { weight_threshold: 1, account_auths: [], key_auths: [["PIX...", 1]] },
  memo_key: "PIX...",
  json_metadata: "{}"
}]
```

### `claim_reward_balance`
```js
["claim_reward_balance", {
  account: "user",
  reward_pixa: "1.000 PIXA",
  reward_pxs: "0.500 PXS",
  reward_vests: "100.000000 VESTS"
}]
```

### `account_witness_vote`
```js
["account_witness_vote", {
  account: "user",
  witness: "witness_name",
  approve: true  // false to remove vote
}]
```

</details>

<details>
<summary><strong>📋 Custom Operations</strong></summary>

### `custom_json`
```js
["custom_json", {
  required_auths: [],
  required_posting_auths: ["user"],
  id: "follow",                 // Operation identifier (max 32 chars)
  json: JSON.stringify([...])   // JSON payload
}]
```

### `custom`
```js
["custom", {
  required_auths: ["user"],
  id: 0,
  data: Buffer.from("...")  // Raw binary data
}]
```

### `custom_binary`
```js
["custom_binary", {
  required_owner_auths: [],
  required_active_auths: [],
  required_posting_auths: ["user"],
  required_auths: [],
  id: "app_id",
  data: Buffer.from("...")
}]
```

</details>

<details>
<summary><strong>📋 Governance Operations</strong></summary>

### `account_witness_vote`
```js
["account_witness_vote", {
  account: "user",
  witness: "witness_name",
  approve: true  // false to remove vote
}]
```

### `account_witness_proxy`
```js
["account_witness_proxy", {
  account: "user",
  proxy: "proxy_account"  // "" to clear proxy
}]
```

### `witness_update`
```js
["witness_update", {
  owner: "witness_name",
  url: "https://mywitness.com",
  block_signing_key: "PIX7abc...",
  props: {
    account_creation_fee: "3.000 PIXA",
    maximum_block_size: 65536,
    pxs_interest_rate: 1000
  },
  fee: "0.000 PIXA"
}]
```

### `witness_set_properties`
```js
["witness_set_properties", {
  owner: "witness_name",
  props: [
    ["key", "hex_encoded_signing_key"],
    ["account_creation_fee", "hex_encoded_fee"],
    ["url", "hex_encoded_url"]
  ],
  extensions: []
}]
```

> 💡 Use [`utils.buildWitnessUpdateOp()`](#build-witness-update) to easily construct this operation.

### `create_proposal`
```js
["create_proposal", {
  creator: "user",
  receiver: "recipient",
  start_date: "2024-02-01T00:00:00",
  end_date: "2024-03-01T00:00:00",
  daily_pay: "100.000 PXS",
  subject: "Proposal title",
  permlink: "proposal-post-permlink",
  extensions: []
}]
```

### `update_proposal_votes`
```js
["update_proposal_votes", {
  voter: "user",
  proposal_ids: [1, 5, 12],
  approve: true,
  extensions: []
}]
```

### `update_proposal`
```js
["update_proposal", {
  proposal_id: 42,
  creator: "user",
  daily_pay: "50.000 PXS",
  subject: "Updated title",
  permlink: "updated-permlink",
  end_date: "2024-04-01T00:00:00",
  extensions: []
}]
```

### `remove_proposal`
```js
["remove_proposal", {
  proposal_owner: "user",
  proposal_ids: [42],
  extensions: []
}]
```

### `decline_voting_rights`
```js
["decline_voting_rights", {
  account: "user",
  decline: true  // irreversible!
}]
```

</details>

<details>
<summary><strong>📋 Market Operations</strong></summary>

### `limit_order_create`
```js
["limit_order_create", {
  owner: "user",
  orderid: 1001,
  amount_to_sell: "10.000 PIXA",
  min_to_receive: "5.000 PXS",
  fill_or_kill: false,
  expiration: "2024-02-01T00:00:00"
}]
```

### `limit_order_create2`
```js
["limit_order_create2", {
  owner: "user",
  orderid: 1002,
  amount_to_sell: "10.000 PIXA",
  fill_or_kill: false,
  exchange_rate: {
    base: "1.000 PIXA",
    quote: "0.500 PXS"
  },
  expiration: "2024-02-01T00:00:00"
}]
```

### `limit_order_cancel`
```js
["limit_order_cancel", {
  owner: "user",
  orderid: 1001
}]
```

### `convert`
```js
["convert", {
  owner: "user",
  requestid: 1,
  amount: "100.000 PXS"  // PXS → PIXA (3.5 day delay)
}]
```

### `collateralized_convert`
```js
["collateralized_convert", {
  owner: "user",
  requestid: 2,
  amount: "100.000 PIXA"  // Instant PIXA → PXS
}]
```

### `feed_publish` (witnesses only)
```js
["feed_publish", {
  publisher: "witness_name",
  exchange_rate: {
    base: "0.500 PXS",
    quote: "1.000 PIXA"
  }
}]
```

</details>

<details>
<summary><strong>📋 Savings Operations</strong></summary>

### `transfer_to_savings`
```js
["transfer_to_savings", {
  from: "user",
  to: "user",        // Can be same account
  amount: "100.000 PIXA",  // or PXS
  memo: "Savings deposit"
}]
```

### `transfer_from_savings`
```js
["transfer_from_savings", {
  from: "user",
  request_id: 1,
  to: "user",
  amount: "50.000 PIXA",
  memo: "Withdrawal"
  // 3-day delay before funds arrive
}]
```

### `cancel_transfer_from_savings`
```js
["cancel_transfer_from_savings", {
  from: "user",
  request_id: 1
}]
```

</details>

<details>
<summary><strong>📋 Escrow Operations</strong></summary>

### `escrow_transfer`
```js
["escrow_transfer", {
  from: "buyer",
  to: "seller",
  agent: "escrow_agent",
  escrow_id: 1,
  pxs_amount: "100.000 PXS",
  pixa_amount: "0.000 PIXA",
  fee: "1.000 PXS",
  ratification_deadline: "2024-01-20T00:00:00",
  escrow_expiration: "2024-02-01T00:00:00",
  json_meta: "{}"
}]
```

### `escrow_approve`
```js
["escrow_approve", {
  from: "buyer",
  to: "seller",
  agent: "escrow_agent",
  who: "escrow_agent",  // Who is approving
  escrow_id: 1,
  approve: true
}]
```

### `escrow_dispute`
```js
["escrow_dispute", {
  from: "buyer",
  to: "seller",
  agent: "escrow_agent",
  who: "buyer",  // Who is disputing
  escrow_id: 1
}]
```

### `escrow_release`
```js
["escrow_release", {
  from: "buyer",
  to: "seller",
  agent: "escrow_agent",
  who: "escrow_agent",
  receiver: "seller",
  escrow_id: 1,
  pxs_amount: "100.000 PXS",
  pixa_amount: "0.000 PIXA"
}]
```

</details>

<details>
<summary><strong>📋 Account Recovery Operations</strong></summary>

### `request_account_recovery`
```js
["request_account_recovery", {
  recovery_account: "recovery_partner",
  account_to_recover: "hacked_user",
  new_owner_authority: {
    weight_threshold: 1,
    account_auths: [],
    key_auths: [["PIX7new...", 1]]
  },
  extensions: []
}]
```

### `recover_account`
```js
["recover_account", {
  account_to_recover: "hacked_user",
  new_owner_authority: { /* new authority */ },
  recent_owner_authority: { /* previous authority */ },
  extensions: []
}]
```

### `change_recovery_account`
```js
["change_recovery_account", {
  account_to_recover: "user",
  new_recovery_account: "trusted_friend",
  extensions: []
}]
```

</details>

<details>
<summary><strong>📋 Virtual Operations (Read-Only)</strong></summary>

| Operation | Description |
|-----------|-------------|
| `author_reward` | Author payout |
| `curation_reward` | Curator payout |
| `comment_reward` | Comment/post payout |
| `fill_convert_request` | Conversion completed |
| `fill_vesting_withdraw` | Power down payment |
| `fill_order` | Market order filled |
| `producer_reward` | Witness block reward |
| `interest` | PXS interest payment |
| `return_vesting_delegation` | Delegation returned |

</details>

---

## Utilities

### Operation Bitmask Filter

```js
import { utils } from "@pixagram/dpixa";

const op = utils.operationOrders;

// Create filter for specific operations
const filter = utils.makeBitMaskFilter([
  op.vote,
  op.comment,
  op.transfer,
  op.custom_json
]);

// Use with getAccountHistory
const history = await client.database.getAccountHistory("alice", -1, 100, filter);
```

### Sleep

```js
await utils.sleep(2000);  // Wait 2 seconds
```

### Copy Objects

```js
const copy = utils.copy(originalObject);  // Deep copy
```

### Iterator to Stream

```js
const stream = utils.iteratorStream(client.blockchain.getBlocks());
stream.on("data", (block) => console.log(block));
```

### Build Witness Update

```js
const witnessOp = utils.buildWitnessUpdateOp("mywitness", {
  key: publicKey,
  account_creation_fee: "3.000 PIXA",
  maximum_block_size: 65536,
  pxs_interest_rate: 1000,
  url: "https://mywitness.com"
});
```

**Returns:** [`WitnessSetPropertiesOperation`](#-operation-interfaces) — ready to broadcast

---

### Wait For Event

```js
// Wait for a specific event from an EventEmitter
const result = await utils.waitForEvent(emitter, "data");
```

Utility that returns a `Promise` which resolves when the specified event is emitted.

---

### Retrying Fetch

Low-level utility used internally by the `Client` for RPC calls with failover. Rarely needed directly.

```js
const { response, currentAddress } = await utils.retryingFetch(
  currentAddress,     // string - current RPC URL
  allAddresses,       // string | string[] - all RPC URLs
  fetchOptions,       // any - fetch request options
  timeout,            // number - ms before giving up
  failoverThreshold,  // number - max retry rounds
  consoleOnFailover,  // boolean - log failovers
  backoffFn           // (tries: number) => number - backoff strategy
);
```

---

## Serialization

The `Types` object provides serializers for blockchain data types. Used internally for transaction signing, but available for custom use.

```js
import { Types } from "@pixagram/dpixa";

// Primitive serializers
Types.UInt8       // Unsigned 8-bit integer
Types.UInt16      // Unsigned 16-bit integer
Types.UInt32      // Unsigned 32-bit integer
Types.UInt64      // Unsigned 64-bit integer
Types.Int8        // Signed 8-bit integer
Types.Int16       // Signed 16-bit integer
Types.Int32       // Signed 32-bit integer
Types.Int64       // Signed 64-bit integer
Types.Boolean     // Boolean
Types.String      // Variable-length string
Types.Void        // Void (throws on serialize — placeholder)

// Blockchain-specific serializers
Types.Date        // Date string → 4-byte uint32 timestamp
Types.Asset       // Asset string → fixed binary format
Types.PublicKey   // Public key → 33-byte compressed point
Types.Authority   // Authority object → threshold + key/account lists
Types.Price       // Price object → base + quote assets
Types.Operation   // Operation tuple → varint ID + serialized params
Types.Transaction // Full transaction → ref_block + expiration + ops
Types.EncryptedMemo // Encrypted memo → nonce + check + encrypted bytes
Types.Binary(size?) // Raw binary data (optional fixed size)

// Compound serializers (factories)
Types.Array(itemSerializer)                  // Varint-length array
Types.Optional(valueSerializer)              // 1-byte flag + optional value
Types.Object(keySerializers)                 // Ordered key-value pairs
Types.FlatMap(keySerializer, valueSerializer) // Key-value map
Types.StaticVariant(itemSerializers)         // Tagged union [index, data]
```

---

## Error Handling

```js
try {
  await client.broadcast.transfer({
    from: "alice",
    to: "bob",
    amount: "10.000 PIXA",
    memo: ""
  }, activeKey);
} catch (error) {
  if (error.message.includes("insufficient")) {
    console.error("Insufficient balance");
  } else if (error.message.includes("authority")) {
    console.error("Wrong key or insufficient authority");
  } else if (error.message.includes("bandwidth")) {
    console.error("Insufficient resource credits");
  } else {
    console.error("Error:", error.message);
  }
}
```

### Retry Pattern

```js
async function withRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries} in ${delay}ms...`);
      await utils.sleep(delay);
      delay *= 2;
    }
  }
}

const accounts = await withRetry(() => client.database.getAccounts(["alice"]));
```

---

## Types & Interfaces

> All interfaces below are referenced throughout this documentation. Use your editor's search to jump between method signatures and their return types.

<details>
<summary><strong>📋 <a id="-dynamicglobalproperties-interface"></a>DynamicGlobalProperties Interface</strong></summary>

Returned by: [`database.getDynamicGlobalProperties()`](#getdynamicglobalproperties)

```typescript
interface DynamicGlobalProperties {
  id: number;
  head_block_number: number;
  head_block_id: string;
  time: string;
  current_witness: string;
  total_pow: number;
  num_pow_witnesses: number;
  virtual_supply: string | Asset;
  current_supply: string | Asset;
  current_pxs_supply: string | Asset;
  total_vesting_fund_pixa: string | Asset;
  total_vesting_shares: string | Asset;
  total_reward_fund_pixa: string | Asset;
  pending_rewarded_vesting_shares: string | Asset;
  pending_rewarded_vesting_pixa: string | Asset;
  pxs_interest_rate: number;
  pxs_print_rate: number;
  maximum_block_size: number;
  current_aslot: number;
  recent_slots_filled: string;
  participation_count: number;
  last_irreversible_block_num: number;
  vote_power_reserve_rate: number;
  current_reserve_ratio: number;
}
```

</details>

<details>
<summary><strong>📋 <a id="-chainproperties-interface"></a>ChainProperties Interface</strong></summary>

Returned by: [`database.getChainProperties()`](#getchainproperties)

```typescript
interface ChainProperties {
  account_creation_fee: string | Asset;
  maximum_block_size: number;
  pxs_interest_rate: number;
}
```

</details>

<details>
<summary><strong>📋 <a id="-account-interface"></a>Account / ExtendedAccount Interface</strong></summary>

Returned by: [`database.getAccounts()`](#getaccountsusernames)

```typescript
interface Account {
  id: number;
  name: string;
  owner: AuthorityType;
  active: AuthorityType;
  posting: AuthorityType;
  memo_key: string;
  json_metadata: string;
  posting_json_metadata: string;
  proxy: string;
  balance: string | Asset;
  savings_balance: string | Asset;
  pxs_balance: string | Asset;
  savings_pxs_balance: string | Asset;
  savings_pxs_seconds: string;
  savings_pxs_seconds_last_update: string;
  savings_pxs_last_interest_payment: string;
  savings_withdraw_requests: number;
  vesting_shares: string | Asset;
  delegated_vesting_shares: string | Asset;
  received_vesting_shares: string | Asset;
  vesting_withdraw_rate: string | Asset;
  to_withdraw: string | number;
  withdrawn: string | number;
  withdraw_routes: number;
  reward_pixa_balance: string | Asset;
  reward_pxs_balance: string | Asset;
  reward_vesting_balance: string | Asset;
  voting_power: number;
  voting_manabar: {
    current_mana: string | number;
    last_update_time: number;
  };
  post_count: number;
  created: string;
  last_post: string;
  last_vote_time: string;
  witnesses_voted_for: number;
}

interface ExtendedAccount extends Account {
  curation_rewards: number;
  posting_rewards: number;
  // ... additional chain-state fields
}
```

</details>

<details>
<summary><strong>📋 <a id="-appliedoperation-interface"></a>AppliedOperation Interface</strong></summary>

Returned by: [`database.getOperations()`](#getoperationsblocknum-onlyvirtual), [`database.getAccountHistory()`](#getaccounthistoryaccount-from-limit-operation_bitmask), [`blockchain.getOperations()`](#getoperationsoptions)

```typescript
interface AppliedOperation {
  trx_id: string;
  block: number;
  trx_in_block: number;
  op_in_trx: number;
  virtual_op: number;
  timestamp: string;
  op: Operation;
}
```

</details>

<details>
<summary><strong>📋 <a id="-blockheader-interface"></a>BlockHeader Interface</strong></summary>

Returned by: [`database.getBlockHeader()`](#getblockheaderblocknum), [`blockchain.getCurrentBlockHeader()`](#getcurrentblockheadermode)

```typescript
interface BlockHeader {
  previous: string;
  timestamp: string;
  witness: string;
  transaction_merkle_root: string;
  extensions: any[];
}
```

</details>

<details>
<summary><strong>📋 <a id="-signedblock-interface"></a>SignedBlock Interface</strong></summary>

Returned by: [`database.getBlock()`](#getblockblocknum), [`blockchain.getCurrentBlock()`](#getcurrentblockmode), [`blockchain.getBlocks()`](#getblocksoptions)

Extends: [`BlockHeader`](#-blockheader-interface)

```typescript
interface SignedBlock extends BlockHeader {
  witness_signature: string;
  block_id: string;
  signing_key: string;
  transaction_ids: string[];
  transactions: Transaction[];
}
```

</details>

<details>
<summary><strong>📋 <a id="-transaction-interface"></a>[Transaction / SignedTransaction / TransactionConfirmation](#-transaction-interface) Interfaces</strong></summary>

Returned by: [`database.getTransaction()`](#gettransactiontxid) (SignedTransaction), all `broadcast.*` methods (TransactionConfirmation)

```typescript
interface Transaction {
  ref_block_num: number;
  ref_block_prefix: number;
  expiration: string;
  operations: Operation[];
  extensions: any[];
}

interface SignedTransaction extends Transaction {
  signatures: string[];
}

interface TransactionConfirmation {
  id: string;
  block_num: number;
  trx_num: number;
  expired: boolean;
}
```

</details>

<details>
<summary><strong>📋 <a id="-authority-interface"></a>Authority Class / AuthorityType Interface</strong></summary>

Used in: [`Account`](#-account-interface) (owner, active, posting), account creation/update operations

```typescript
interface AuthorityType {
  weight_threshold: number;
  account_auths: [string, number][];
  key_auths: [string | PublicKey, number][];
}
```

The `Authority` class implements `AuthorityType` and provides convenience methods:

```js
import { Authority, PublicKey } from "@pixagram/dpixa";

// Create from a single public key
const auth = Authority.from("PIX7abc...");

// Create from an AuthorityType object
const auth2 = Authority.from({
  weight_threshold: 1,
  account_auths: [],
  key_auths: [["PIX7abc...", 1]]
});

// Create from PublicKey instance
const pubKey = PublicKey.fromString("PIX7abc...");
const auth3 = Authority.from(pubKey);
```

</details>

<details>
<summary><strong>📋 <a id="-discussion-interface"></a>Discussion / Comment Interfaces</strong></summary>

Returned by: [`database.getDiscussions()`](#getdiscussionsby-query), [`pixamind.getRankedPosts()`](#getrankedpostsoptions), [`pixamind.getAccountPosts()`](#getaccountpostsoptions)

`Discussion` extends `Comment` with additional display-oriented fields.

```typescript
interface Comment {
  id: number;
  category: string;
  parent_author: string;
  parent_permlink: string;
  author: string;
  permlink: string;
  title: string;
  body: string;
  json_metadata: string;
  last_update: string;
  created: string;
  last_payout: string;
  depth: number;
  children: number;
  net_rshares: string;
  abs_rshares: string;
  children_abs_rshares: string;
  cashout_time: string;
  max_cashout_time: string;
  total_vote_weight: number;
  total_payout_value: string | Asset;
  curator_payout_value: string | Asset;
  author_rewards: string;
  net_votes: number;
  max_accepted_payout: string;
  percent_pxs: number;
  allow_replies: boolean;
  allow_votes: boolean;
  allow_curation_rewards: boolean;
  beneficiaries: BeneficiaryRoute[];
}

interface Discussion extends Comment {
  active_votes: any[];
  author_reputation: number;
  body_length: string;
  pending_payout_value: string | Asset;
  url: string;
  root_title: string;
  first_reblogged_by?: any;
  first_reblogged_on?: any;
}
```

</details>

<details>
<summary><strong>📋 <a id="-disqussionquery-interface"></a>DisqussionQuery Interface</strong></summary>

Used by: [`database.getDiscussions()`](#getdiscussionsby-query)

```typescript
interface DisqussionQuery {
  tag?: string;
  limit: number;
  filter_tags?: string[];
  select_authors?: string[];
  select_tags?: string[];
  truncate_body?: number;
  start_author?: string;
  start_permlink?: string;
  parent_author?: string;
  parent_permlink?: string;
}
```

</details>

<details>
<summary><strong>📋 <a id="-vestingdelegation-interface"></a>[VestingDelegation](#-vestingdelegation-interface) Interface</strong></summary>

Returned by: [`database.getVestingDelegations()`](#getvestingdelegationsaccount-from-limit)

```typescript
interface VestingDelegation {
  id: number;
  delegator: string;
  delegatee: string;
  vesting_shares: string | Asset;
  min_delegation_time: string;
}
```

</details>

<details>
<summary><strong>📋 <a id="-communitydetail-interface"></a>CommunityDetail Interface</strong></summary>

Returned by: [`pixamind.getCommunity()`](#getcommunityoptions), [`pixamind.listCommunities()`](#listcommunitiesoptions)

```typescript
interface CommunityDetail {
  id: number;
  name: string;
  title: string;
  about: string;
  lang: string;
  type_id: number;
  is_nsfw: boolean;
  subscribers: number;
  sum_pending: number;
  num_pending: number;
  num_authors: number;
  created_at: string;
  avatar_url: string;
  description: string;
  flag_text: string;
  settings: object;
  team: string[];
  admins: string[];
}
```

</details>

<details>
<summary><strong>📋 <a id="-notifications-interface"></a>Notifications Interface</strong></summary>

Returned by: [`pixamind.getAccountNotifications()`](#getaccountnotificationsoptions)

```typescript
interface Notifications {
  id: number;
  type: string;      // "vote", "reply", "mention", "follow", "reblog", etc.
  score: number;
  date: string;
  msg: string;
  url: string;
}
```

</details>

<details>
<summary><strong>📋 <a id="-accountsbykey-interface"></a>[AccountsByKey](#-accountsbykey-interface) Interface</strong></summary>

Returned by: [`keys.getKeyReferences()`](#getkeyreferenceskeys)

```typescript
interface AccountsByKey {
  accounts: string[][];  // Array of arrays — each inner array = accounts for that key
}
```

</details>

<details>
<summary><strong>📋 <a id="-beneficiaryroute-interface"></a>BeneficiaryRoute Interface</strong></summary>

Used in: [`CommentOptionsOperation`](#operations-reference), [`Discussion`](#-discussion-interface)

```typescript
interface BeneficiaryRoute {
  account: string;
  weight: number;  // 0-10000 (basis points, 10000 = 100%)
}
```

</details>

<details>
<summary><strong>📋 <a id="-blockchainstreamoptions-interface"></a>BlockchainStreamOptions Interface</strong></summary>

Used by: [`blockchain.getBlockNumbers()`](#getblocknumbersoptions), [`blockchain.getBlocks()`](#getblocksoptions), [`blockchain.getOperations()`](#getoperationsoptions)

```typescript
interface BlockchainStreamOptions {
  from?: number;           // Starting block number (default: current)
  to?: number;             // Ending block number (default: infinite)
  mode?: BlockchainMode;   // Finality mode
}
```

</details>

<details>
<summary><strong>📋 <a id="-smtasset-interface"></a>SMTAsset Interface</strong></summary>

Used for SMT (Smart Media Token) asset representations.

```typescript
interface SMTAsset {
  amount: string | number;
  precision: number;
  nai: string;
}
```

</details>

<details>
<summary><strong>📋 <a id="-hexbuffer-class"></a>HexBuffer Class</strong></summary>

Buffer wrapper that serializes to a hex-encoded string. Useful for binary data in operations.

```js
import { HexBuffer } from "@pixagram/dpixa";

// Create from hex string
const hex = HexBuffer.from("deadbeef");

// Create from buffer
const buf = HexBuffer.from(Buffer.from([0xde, 0xad]));

// Create from byte array
const arr = HexBuffer.from([0xde, 0xad, 0xbe, 0xef]);

// Export
hex.toString();        // "deadbeef"
hex.toString("hex");   // "deadbeef"
hex.toJSON();          // "deadbeef"
hex.buffer;            // <Buffer de ad be ef>
```

</details>

<details>
<summary><strong>📋 <a id="-operation-interfaces"></a>[Operation Interfaces (full list)](#-operation-interfaces)</strong></summary>

All operations follow the tuple pattern `[OperationName, { ...params }]`.

**Type aliases:**

```typescript
type OperationName =
  | "vote" | "comment" | "transfer" | "transfer_to_vesting"
  | "withdraw_vesting" | "limit_order_create" | "limit_order_cancel"
  | "feed_publish" | "convert" | "account_create" | "account_update"
  | "witness_update" | "account_witness_vote" | "account_witness_proxy"
  | "pow" | "custom" | "report_over_production" | "delete_comment"
  | "custom_json" | "comment_options" | "set_withdraw_vesting_route"
  | "limit_order_create2" | "claim_account" | "create_claimed_account"
  | "request_account_recovery" | "recover_account" | "change_recovery_account"
  | "escrow_transfer" | "escrow_dispute" | "escrow_release" | "pow2"
  | "escrow_approve" | "transfer_to_savings" | "transfer_from_savings"
  | "cancel_transfer_from_savings" | "custom_binary" | "decline_voting_rights"
  | "reset_account" | "set_reset_account" | "claim_reward_balance"
  | "delegate_vesting_shares" | "account_create_with_delegation"
  | "witness_set_properties" | "account_update2" | "create_proposal"
  | "update_proposal_votes" | "remove_proposal" | "update_proposal"
  | "collateralized_convert" | "recurrent_transfer";

type VirtualOperationName =
  | "author_reward" | "curation_reward" | "comment_reward"
  | "fill_convert_request" | "fill_vesting_withdraw" | "fill_order"
  | "producer_reward" | "interest" | "return_vesting_delegation"
  | "comment_benefactor_reward" | "clear_null_account_balance"
  | "sps_fund" | "sps_convert" | "changed_recovery_account"
  | "transfer_to_vesting_completed" | "account_created"
  | "vesting_shares_split" | "system_warning" | "shutdown_witness";
```

**Individual operation interfaces** — each extends `Operation` with typed `[0]` (name) and `[1]` (params):

| Interface | Operation Name |
|-----------|---------------|
| `VoteOperation` | `vote` |
| `CommentOperation` | `comment` |
| `CommentOptionsOperation` | `comment_options` |
| `TransferOperation` | `transfer` |
| `TransferToVestingOperation` | `transfer_to_vesting` |
| `WithdrawVestingOperation` | `withdraw_vesting` |
| `DelegateVestingSharesOperation` | `delegate_vesting_shares` |
| `SetWithdrawVestingRouteOperation` | `set_withdraw_vesting_route` |
| `RecurrentTransferOperation` | `recurrent_transfer` |
| `AccountCreateOperation` | `account_create` |
| `AccountCreateWithDelegationOperation` | `account_create_with_delegation` |
| `CreateClaimedAccountOperation` | `create_claimed_account` |
| `ClaimAccountOperation` | `claim_account` |
| `AccountUpdateOperation` | `account_update` |
| `AccountUpdate2Operation` | `account_update2` |
| `ClaimRewardBalanceOperation` | `claim_reward_balance` |
| `DeleteCommentOperation` | `delete_comment` |
| `CustomJsonOperation` | `custom_json` |
| `CustomOperation` | `custom` |
| `CustomBinaryOperation` | `custom_binary` |
| `LimitOrderCreateOperation` | `limit_order_create` |
| `LimitOrderCreate2Operation` | `limit_order_create2` |
| `LimitOrderCancelOperation` | `limit_order_cancel` |
| `ConvertOperation` | `convert` |
| `CollateralizedConvertOperation` | `collateralized_convert` |
| `FeedPublishOperation` | `feed_publish` |
| `TransferToSavingsOperation` | `transfer_to_savings` |
| `TransferFromSavingsOperation` | `transfer_from_savings` |
| `CancelTransferFromSavingsOperation` | `cancel_transfer_from_savings` |
| `EscrowTransferOperation` | `escrow_transfer` |
| `EscrowApproveOperation` | `escrow_approve` |
| `EscrowDisputeOperation` | `escrow_dispute` |
| `EscrowReleaseOperation` | `escrow_release` |
| `AccountWitnessVoteOperation` | `account_witness_vote` |
| `AccountWitnessProxyOperation` | `account_witness_proxy` |
| `WitnessUpdateOperation` | `witness_update` |
| `WitnessSetPropertiesOperation` | `witness_set_properties` |
| `CreateProposalOperation` | `create_proposal` |
| `UpdateProposalOperation` | `update_proposal` |
| `UpdateProposalVotesOperation` | `update_proposal_votes` |
| `RemoveProposalOperation` | `remove_proposal` |
| `RequestAccountRecoveryOperation` | `request_account_recovery` |
| `RecoverAccountOperation` | `recover_account` |
| `ChangeRecoveryAccountOperation` | `change_recovery_account` |
| `DeclineVotingRightsOperation` | `decline_voting_rights` |
| `ResetAccountOperation` | `reset_account` |
| `SetResetAccountOperation` | `set_reset_account` |
| `ReportOverProductionOperation` | `report_over_production` |
| `PowOperation` | `pow` |
| `Pow2Operation` | `pow2` |

</details>

---

## [Enumerations](#enumerations)

```js
import { [BlockchainMode](#enumerations) } from "@pixagram/dpixa";

// BlockchainMode
BlockchainMode.Irreversible  // 0 — Only confirmed blocks (default)
BlockchainMode.Latest        // 1 — Head block (may be reversed on fork)
```

See also: [Asset Symbols](#asset-symbols-reference), [Discussion Query Categories](#discussion-query-categories), [Key Roles](#key-roles-reference)

---

## [Constants](#constants)

```js
import { 
  VERSION,
  DEFAULT_ADDRESS_PREFIX,
  DEFAULT_CHAIN_ID,
  NETWORK_ID
} from "@pixagram/dpixa";

console.log(VERSION);                // Library version string
console.log(DEFAULT_ADDRESS_PREFIX); // "PIX"
console.log(DEFAULT_CHAIN_ID);       // Buffer (32 bytes)
console.log(NETWORK_ID);             // Buffer (network ID for WIF)
```

---

## [Advanced Usage](#advanced-usage)

### Custom Backoff Strategy

```js
const client = new Client(["https://api.pixagram.io"], {
  backoff: (tries) => {
    // Exponential backoff with jitter
    const base = Math.min(1000 * Math.pow(2, tries), 30000);
    const jitter = Math.random() * 1000;
    return base + jitter;
  }
});
```

### Connection Pooling (Node.js)

```js
const https = require("https");

const agent = new https.Agent({
  keepAlive: true,
  maxSockets: 10
});

const client = new Client(["https://api.pixagram.io"], {
  agent: agent
});
```

### Building a Vote Bot

```js
async function autoVoter(authors, weight = 10000) {
  const postingKey = PrivateKey.fromLogin("mybot", "password", "posting");
  
  for await (const op of client.blockchain.getOperations()) {
    const [opType, opData] = op.op;
    
    if (opType === "comment" && 
        opData.parent_author === "" &&  // Root post only
        authors.includes(opData.author)) {
      
      try {
        await client.broadcast.vote({
          voter: "mybot",
          author: opData.author,
          permlink: opData.permlink,
          weight: weight
        }, postingKey);
        
        console.log(`Voted on @${opData.author}/${opData.permlink}`);
      } catch (error) {
        console.error(`Vote failed: ${error.message}`);
      }
    }
  }
}

autoVoter(["favorite-author1", "favorite-author2"]);
```

---

## Important Notes

> ⚠️ **WebSocket Removed**: As of v0.7.0, WebSocket support has been removed. Use HTTP(S) URLs.

> 💡 **CORS**: If running your own node, configure proper CORS headers for browser access.

> 🔐 **Security**: Never expose private keys in client-side code. Use minimum required key level.

> 📡 **Node Selection**: Use multiple RPC nodes for reliability with automatic failover.

---

## License

MIT

---

*Share and Enjoy!* 🚀