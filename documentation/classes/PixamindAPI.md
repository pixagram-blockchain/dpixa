[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / PixamindAPI

# Class: PixamindAPI

Defined in: helpers/pixamind.ts:79

## Constructors

### Constructor

> **new PixamindAPI**(`client`): `PixamindAPI`

Defined in: helpers/pixamind.ts:80

#### Parameters

##### client

[`Client`](Client.md)

#### Returns

`PixamindAPI`

## Properties

### client

> `readonly` **client**: [`Client`](Client.md)

Defined in: helpers/pixamind.ts:80

## Methods

### call()

> **call**(`method`, `params?`): `Promise`\<`any`\>

Defined in: helpers/pixamind.ts:87

Convenience of calling pixamind api

#### Parameters

##### method

`string`

##### params?

`any`

#### Returns

`Promise`\<`any`\>

***

### getAccountNotifications()

> **getAccountNotifications**(`options?`): `Promise`\<[`Notifications`](../interfaces/Notifications.md)[]\>

Defined in: helpers/pixamind.ts:129

Get particular account notifications feed

#### Parameters

##### options?

`AccountNotifsQuery`

#### Returns

`Promise`\<[`Notifications`](../interfaces/Notifications.md)[]\>

***

### getAccountPosts()

> **getAccountPosts**(`options`): `Promise`\<[`Discussion`](../interfaces/Discussion.md)[]\>

Defined in: helpers/pixamind.ts:103

Get posts by particular account from Pixamind

#### Parameters

##### options

`AccountPostsQuery`

#### Returns

`Promise`\<[`Discussion`](../interfaces/Discussion.md)[]\>

***

### getCommunity()

> **getCommunity**(`options`): `Promise`\<[`CommunityDetail`](../interfaces/CommunityDetail.md)[]\>

Defined in: helpers/pixamind.ts:112

Get community details such as who are the admin,
moderators, how many subscribers, etc..

#### Parameters

##### options

`CommunityQuery`

#### Returns

`Promise`\<[`CommunityDetail`](../interfaces/CommunityDetail.md)[]\>

***

### getRankedPosts()

> **getRankedPosts**(`options`): `Promise`\<[`Discussion`](../interfaces/Discussion.md)[]\>

Defined in: helpers/pixamind.ts:95

Get trending, hot, recent community posts from Pixamind

#### Parameters

##### options

`PostsQuery`

#### Returns

`Promise`\<[`Discussion`](../interfaces/Discussion.md)[]\>

***

### listAllSubscriptions()

> **listAllSubscriptions**(`account`): `Promise`\<[`Discussion`](../interfaces/Discussion.md)[]\>

Defined in: helpers/pixamind.ts:121

List all subscriptions by particular account

#### Parameters

##### account

the account you want to query

`string` | `object`

#### Returns

`Promise`\<[`Discussion`](../interfaces/Discussion.md)[]\>

return role, what community the account joined

***

### listCommunities()

> **listCommunities**(`options`): `Promise`\<[`CommunityDetail`](../interfaces/CommunityDetail.md)[]\>

Defined in: helpers/pixamind.ts:137

List all available communities on pixamind

#### Parameters

##### options

`ListCommunitiesQuery`

#### Returns

`Promise`\<[`CommunityDetail`](../interfaces/CommunityDetail.md)[]\>
