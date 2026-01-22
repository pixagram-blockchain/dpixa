[**@pixagram/dpixa**](../../../../README.md)

***

[@pixagram/dpixa](../../../../globals.md) / [utils](../README.md) / retryingFetch

# Function: retryingFetch()

> **retryingFetch**(`currentAddress`, `allAddresses`, `opts`, `timeout`, `failoverThreshold`, `consoleOnFailover`, `backoff`, `fetchTimeout?`): `Promise`\<\{ `currentAddress`: `string`; `response`: `any`; \}\>

Defined in: utils.ts:99

Fetch API wrapper that retries until timeout is reached.

## Parameters

### currentAddress

`string`

### allAddresses

`string` | `string`[]

### opts

`any`

### timeout

`number`

### failoverThreshold

`number`

### consoleOnFailover

`boolean`

### backoff

(`tries`) => `number`

### fetchTimeout?

(`tries`) => `number`

## Returns

`Promise`\<\{ `currentAddress`: `string`; `response`: `any`; \}\>
