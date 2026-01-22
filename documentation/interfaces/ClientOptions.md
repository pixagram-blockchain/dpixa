[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / ClientOptions

# Interface: ClientOptions

Defined in: client.ts:130

RPC Client options
------------------

## Properties

### addressPrefix?

> `optional` **addressPrefix**: `string`

Defined in: client.ts:142

Pixa address prefix. Defaults to main network:
`PIX`

***

### agent?

> `optional` **agent**: `any`

Defined in: client.ts:174

Node.js http(s) agent, use if you want http keep-alive.
Defaults to using https.globalAgent.

#### See

https://nodejs.org/api/http.html#http_new_agent_options.

***

### backoff()?

> `optional` **backoff**: (`tries`) => `number`

Defined in: client.ts:168

Retry backoff function, returns milliseconds. Default = defaultBackoff.

#### Parameters

##### tries

`number`

#### Returns

`number`

***

### chainId?

> `optional` **chainId**: `string`

Defined in: client.ts:137

Pixa chain id. Defaults to main pixa network:
need the new id?
`18dcf0a285365fc58b71f18b3d3fec954aa0c141c44e4e5cb4cf777b9eab274e`

***

### consoleOnFailover?

> `optional` **consoleOnFailover**: `boolean`

Defined in: client.ts:163

Whether a console.log should be made when RPC failed over to another one

***

### failoverThreshold?

> `optional` **failoverThreshold**: `number`

Defined in: client.ts:158

Specifies the amount of times the urls (RPC nodes) should be
iterated and retried in case of timeout errors.
(important) Requires url parameter to be an array (string[])!
Can be set to 0 to iterate and retry forever. Defaults to 3 rounds.

***

### rebrandedApi?

> `optional` **rebrandedApi**: `boolean`

Defined in: client.ts:178

Deprecated - don't use

***

### timeout?

> `optional` **timeout**: `number`

Defined in: client.ts:150

Send timeout, how long to wait in milliseconds before giving
up on a rpc call. Note that this is not an exact timeout,
no in-flight requests will be aborted, they will just not
be retried any more past the timeout.
Can be set to 0 to retry forever. Defaults to 60 * 1000 ms.
