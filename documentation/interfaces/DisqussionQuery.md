[**@pixagram/dpixa**](../README.md)

***

[@pixagram/dpixa](../globals.md) / DisqussionQuery

# Interface: DisqussionQuery

Defined in: helpers/database.ts:65

## Properties

### filter\_tags?

> `optional` **filter\_tags**: `string`[]

Defined in: helpers/database.ts:74

***

### limit

> **limit**: `number`

Defined in: helpers/database.ts:73

Number of results, max 100.

***

### parent\_author?

> `optional` **parent\_author**: `string`

Defined in: helpers/database.ts:91

***

### parent\_permlink?

> `optional` **parent\_permlink**: `string`

Defined in: helpers/database.ts:92

***

### select\_authors?

> `optional` **select\_authors**: `string`[]

Defined in: helpers/database.ts:75

***

### select\_tags?

> `optional` **select\_tags**: `string`[]

Defined in: helpers/database.ts:76

***

### start\_author?

> `optional` **start\_author**: `string`

Defined in: helpers/database.ts:85

Name of author to start from, used for paging.
Should be used in conjunction with `start_permlink`.

***

### start\_permlink?

> `optional` **start\_permlink**: `string`

Defined in: helpers/database.ts:90

Permalink of post to start from, used for paging.
Should be used in conjunction with `start_author`.

***

### tag?

> `optional` **tag**: `string`

Defined in: helpers/database.ts:69

Name of author or tag to fetch.

***

### truncate\_body?

> `optional` **truncate\_body**: `number`

Defined in: helpers/database.ts:80

Number of bytes of post body to fetch, default 0 (all)
