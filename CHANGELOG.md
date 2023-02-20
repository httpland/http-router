# [3.0.0-beta.4](https://github.com/httpland/http-router/compare/3.0.0-beta.3...3.0.0-beta.4) (2023-02-20)


### Bug Fixes

* **router:** fix merge routes logic ([d22c067](https://github.com/httpland/http-router/commit/d22c06763ed4be1f146ca4fa60b7e6f17e73898d))


### Features

* **router:** change handler interface to remove context from request object ([b0d66cd](https://github.com/httpland/http-router/commit/b0d66cd65f3c2cd7f0edfda8e9aa328e0236437c))
* **router:** change route pattern interface ([56051de](https://github.com/httpland/http-router/commit/56051de80aa9550339ad8c8cab92c074b9d87db6))
* **types:** improve interface of `Handler` and `Middleware` ([d11598a](https://github.com/httpland/http-router/commit/d11598a5f84aa9896b03cffc4dc29e885c5823bb))

# [3.0.0-beta.3](https://github.com/httpland/http-router/compare/3.0.0-beta.2...3.0.0-beta.3) (2023-02-18)


### Features

* delete API ([181c7c6](https://github.com/httpland/http-router/commit/181c7c62513d8c26c1213b6e8457ff85a4fc1694)), closes [#31](https://github.com/httpland/http-router/issues/31)
* **router.ts:** add new router and types ([4e9479e](https://github.com/httpland/http-router/commit/4e9479e190e8fc4016b5c9e6e04e4682707cc4dc))


### BREAKING CHANGES

* delete `MethodRouter`, `URLRouter` and releated types

# [3.0.0-beta.2](https://github.com/httpland/http-router/compare/3.0.0-beta.1...3.0.0-beta.2) (2023-02-16)


### Features

* **routers:** add new Router What is mutable and middleware ready ([841fe3c](https://github.com/httpland/http-router/commit/841fe3ca2adb99a8f8735916261a4e12cdd7c80d))

# [3.0.0-beta.1](https://github.com/httpland/http-router/compare/2.1.0...3.0.0-beta.1) (2022-10-08)


### Features

* **routers:** add throwing error to URLRouter ([f8032e8](https://github.com/httpland/http-router/commit/f8032e8e6b960e9f05f1e7568c923567690e17da)), closes [#29](https://github.com/httpland/http-router/issues/29)
* **routers:** remove `onError` field from types ([1870d07](https://github.com/httpland/http-router/commit/1870d0716d52c38ab318b190f938cb1e39a1aa35)), closes [#29](https://github.com/httpland/http-router/issues/29)
* **utils:** remove `validateURLRoutes` ([4ebbb75](https://github.com/httpland/http-router/commit/4ebbb75bedeb7e4a6a180f73f7f859f5dfcfcc99)), closes [#29](https://github.com/httpland/http-router/issues/29)


### BREAKING CHANGES

* **utils:** no export `validateURLRoutes`
* **routers:** remove `onError` field from router
* **routers:** `URLRouter` will not grip the error and throw error as is

# [2.1.0](https://github.com/httpland/http-router/compare/2.0.0...2.1.0) (2022-10-08)


### Bug Fixes

* **router:** fix to always call before each and after each ([fb9f0f4](https://github.com/httpland/http-router/commit/fb9f0f4c2dfe70f883bfa1a5577fdfb7044d6918))
* **router:** use lru cache instead of plain object ([fc79627](https://github.com/httpland/http-router/commit/fc79627928c108426b4109ed971ccb316b869aba)), closes [#26](https://github.com/httpland/http-router/issues/26)


### Features

* **router:** add `afterEach` hooks to router option ([95c13bf](https://github.com/httpland/http-router/commit/95c13bf82888b132a27f283c6610a8b2fa52c21e)), closes [#10](https://github.com/httpland/http-router/issues/10)
* **routers:** add `beforeEach` hooks to router ([116c2d9](https://github.com/httpland/http-router/commit/116c2d919cad1b6fcf04af336b63ad46c501fc75))
* **types:** add `MethodRouteHandler` types ([822ece7](https://github.com/httpland/http-router/commit/822ece7a6e3a5c94dd726f2cf8167843c2152447)), closes [#27](https://github.com/httpland/http-router/issues/27)


### Performance Improvements

* **router:** add non matched pattern to cache ([0eaa017](https://github.com/httpland/http-router/commit/0eaa017a3c5d99ee2502f4a6843fdb6e9aaaa459))

# [2.1.0-beta.3](https://github.com/httpland/http-router/compare/2.1.0-beta.2...2.1.0-beta.3) (2022-10-08)


### Bug Fixes

* **router:** fix to always call before each and after each ([fb9f0f4](https://github.com/httpland/http-router/commit/fb9f0f4c2dfe70f883bfa1a5577fdfb7044d6918))

# [2.1.0-beta.2](https://github.com/httpland/http-router/compare/2.1.0-beta.1...2.1.0-beta.2) (2022-10-08)


### Bug Fixes

* **router:** use lru cache instead of plain object ([fc79627](https://github.com/httpland/http-router/commit/fc79627928c108426b4109ed971ccb316b869aba)), closes [#26](https://github.com/httpland/http-router/issues/26)


### Features

* **routers:** add `beforeEach` hooks to router ([116c2d9](https://github.com/httpland/http-router/commit/116c2d919cad1b6fcf04af336b63ad46c501fc75))

# [2.1.0-beta.1](https://github.com/httpland/http-router/compare/2.0.0...2.1.0-beta.1) (2022-10-07)


### Features

* **router:** add `afterEach` hooks to router option ([95c13bf](https://github.com/httpland/http-router/commit/95c13bf82888b132a27f283c6610a8b2fa52c21e)), closes [#10](https://github.com/httpland/http-router/issues/10)
* **types:** add `MethodRouteHandler` types ([822ece7](https://github.com/httpland/http-router/commit/822ece7a6e3a5c94dd726f2cf8167843c2152447)), closes [#27](https://github.com/httpland/http-router/issues/27)


### Performance Improvements

* **router:** add non matched pattern to cache ([0eaa017](https://github.com/httpland/http-router/commit/0eaa017a3c5d99ee2502f4a6843fdb6e9aaaa459))

# [2.0.0](https://github.com/httpland/http-router/compare/1.2.0...2.0.0) (2022-10-04)

### Bug Fixes

* **utils:** change priority of overlapping routes ([6c921a0](https://github.com/httpland/http-router/commit/6c921a066461d30f09fb0fb8eb225ba10790a3c7))
* **utils:** fix throwing error pattern ([2a07e6e](https://github.com/httpland/http-router/commit/2a07e6ed67a57dd63da4f4b2e4e27f223a656fe8))

### Features

* **errors:** remove `RouterError` and use `Error` instead ([bdde112](https://github.com/httpland/http-router/commit/bdde112407eac5884dedd792feb97c088ce02eee)), closes [#16](https://github.com/httpland/http-router/issues/16)
* **mod:** export API types ([eba25ff](https://github.com/httpland/http-router/commit/eba25ffdd66cb0c5657025a1a351962d7f2cc630)), closes [#13](https://github.com/httpland/http-router/issues/13)
* **mod:** remove unnessesary module from API ([8201730](https://github.com/httpland/http-router/commit/82017300db7308c8319de9dd82a5f716dc33b01c)), closes [#18](https://github.com/httpland/http-router/issues/18)
* **router:** delete validating routes and throwing error ([9841c78](https://github.com/httpland/http-router/commit/9841c783a2ccf84d603bad888602bb96c313c9dc)), closes [#21](https://github.com/httpland/http-router/issues/21)
* **routers:** add `URLRouter` and `MethodRouter` instead of `createRouter` ([f0306c9](https://github.com/httpland/http-router/commit/f0306c9e7e9849ec502c22afb66f6ec20e63db00)), closes [#13](https://github.com/httpland/http-router/issues/13)
* **types:** add `result` field to URL router route handler context ([a6c2956](https://github.com/httpland/http-router/commit/a6c295649a906fd953d77588715e1c0907d051af)), closes [#19](https://github.com/httpland/http-router/issues/19)
* **types:** add `URLRoutes` related types ([c883b66](https://github.com/httpland/http-router/commit/c883b66415311aa93d2faf5c7e5463f285f148cd)), closes [#14](https://github.com/httpland/http-router/issues/14)
* **types:** change `params` of url route handler context types ([d2c779e](https://github.com/httpland/http-router/commit/d2c779e750a78def590567365cd57b4aa4041e48)), closes [#20](https://github.com/httpland/http-router/issues/20)
* **types:** change types and add test case ([e4419c6](https://github.com/httpland/http-router/commit/e4419c675b8e85070ddabace6d926dc0ee0e3ed9)), closes [#14](https://github.com/httpland/http-router/issues/14)
* **types:** remove `route` field from url router route handler context ([2bf003e](https://github.com/httpland/http-router/commit/2bf003ed181ab7556b1937b0a947ec368d7c7a07)), closes [#19](https://github.com/httpland/http-router/issues/19)
* **types:** remove duplicated ([a8ae0ce](https://github.com/httpland/http-router/commit/a8ae0cedd5be78c1ce1038aec37c9ab567756af7)), closes [#17](https://github.com/httpland/http-router/issues/17)
* **utils:** add assert to `nest` ([752a0b8](https://github.com/httpland/http-router/commit/752a0b8bd52f62ffca2aec2c452c492fb2edddd2))
* **utils:** add validation for url routes ([cfe13eb](https://github.com/httpland/http-router/commit/cfe13eb9478dc945824c47fc40ccb03b5a997ca5))
* **utils:** change concatenate url path logic ([d9b120f](https://github.com/httpland/http-router/commit/d9b120fe187b2b8686d38f023e880f8d13ea8bf3))
* **utils:** remove validation and throwing logic from `nest` ([dbfb1d2](https://github.com/httpland/http-router/commit/dbfb1d2490cb64ca0b810fe84128dd33aab3af45)), closes [#21](https://github.com/httpland/http-router/issues/21)
* **utils:** use custom inspect instead of `Deno.inspect` ([b7553c0](https://github.com/httpland/http-router/commit/b7553c0b43db9f4816d5973f411ba65480a977bf)), closes [#22](https://github.com/httpland/http-router/issues/22)

### BREAKING CHANGES

* **types:** remove optional flag from `params` in url route handler context types
* **types:** remove `route` field from url router route handler context
* **mod:** made unimportant modules private
* **routers:** The `createRouter` has been removed and `URLRouter` and `MethodRouter` have been
added.
Nested notation has been removed and restricted to flat notation only.
* **types:** remove dupicated types
* **errors:** `RouterError` is removed. `Error` is used instead of `RouterError.

# [2.0.0-beta.3](https://github.com/httpland/http-router/compare/2.0.0-beta.2...2.0.0-beta.3) (2022-10-03)

### Bug Fixes

* **utils:** change priority of overlapping routes ([6c921a0](https://github.com/httpland/http-router/commit/6c921a066461d30f09fb0fb8eb225ba10790a3c7))

### Features

* **router:** delete validating routes and throwing error ([9841c78](https://github.com/httpland/http-router/commit/9841c783a2ccf84d603bad888602bb96c313c9dc)), closes [#21](https://github.com/httpland/http-router/issues/21)
* **utils:** add validation for url routes ([cfe13eb](https://github.com/httpland/http-router/commit/cfe13eb9478dc945824c47fc40ccb03b5a997ca5))
* **utils:** change concatenate url path logic ([d9b120f](https://github.com/httpland/http-router/commit/d9b120fe187b2b8686d38f023e880f8d13ea8bf3))
* **utils:** remove validation and throwing logic from `nest` ([dbfb1d2](https://github.com/httpland/http-router/commit/dbfb1d2490cb64ca0b810fe84128dd33aab3af45)), closes [#21](https://github.com/httpland/http-router/issues/21)
* **utils:** use custom inspect instead of `Deno.inspect` ([b7553c0](https://github.com/httpland/http-router/commit/b7553c0b43db9f4816d5973f411ba65480a977bf)), closes [#22](https://github.com/httpland/http-router/issues/22)

# [2.0.0-beta.2](https://github.com/httpland/http-router/compare/2.0.0-beta.1...2.0.0-beta.2) (2022-10-02)

### Bug Fixes

* **utils:** fix throwing error pattern ([2a07e6e](https://github.com/httpland/http-router/commit/2a07e6ed67a57dd63da4f4b2e4e27f223a656fe8))

### Features

* **mod:** export API types ([eba25ff](https://github.com/httpland/http-router/commit/eba25ffdd66cb0c5657025a1a351962d7f2cc630)), closes [#13](https://github.com/httpland/http-router/issues/13)
* **mod:** remove unnessesary module from API ([8201730](https://github.com/httpland/http-router/commit/82017300db7308c8319de9dd82a5f716dc33b01c)), closes [#18](https://github.com/httpland/http-router/issues/18)
* **types:** add `result` field to URL router route handler context ([a6c2956](https://github.com/httpland/http-router/commit/a6c295649a906fd953d77588715e1c0907d051af)), closes [#19](https://github.com/httpland/http-router/issues/19)
* **types:** add `URLRoutes` related types ([c883b66](https://github.com/httpland/http-router/commit/c883b66415311aa93d2faf5c7e5463f285f148cd)), closes [#14](https://github.com/httpland/http-router/issues/14)
* **types:** change `params` of url route handler context types ([d2c779e](https://github.com/httpland/http-router/commit/d2c779e750a78def590567365cd57b4aa4041e48)), closes [#20](https://github.com/httpland/http-router/issues/20)
* **types:** change types and add test case ([e4419c6](https://github.com/httpland/http-router/commit/e4419c675b8e85070ddabace6d926dc0ee0e3ed9)), closes [#14](https://github.com/httpland/http-router/issues/14)
* **types:** remove `route` field from url router route handler context ([2bf003e](https://github.com/httpland/http-router/commit/2bf003ed181ab7556b1937b0a947ec368d7c7a07)), closes [#19](https://github.com/httpland/http-router/issues/19)
* **utils:** add assert to `nest` ([752a0b8](https://github.com/httpland/http-router/commit/752a0b8bd52f62ffca2aec2c452c492fb2edddd2))

### BREAKING CHANGES

* **types:** remove optional flag from `params` in url route handler context types
* **types:** remove `route` field from url router route handler context
* **mod:** made unimportant modules private

# [2.0.0-beta.1](https://github.com/httpland/http-router/compare/1.2.0...2.0.0-beta.1) (2022-10-01)

### Features

* **errors:** remove `RouterError` and use `Error` instead ([bdde112](https://github.com/httpland/http-router/commit/bdde112407eac5884dedd792feb97c088ce02eee)), closes [#16](https://github.com/httpland/http-router/issues/16)
* **routers:** add `URLRouter` and `MethodRouter` instead of `createRouter` ([f0306c9](https://github.com/httpland/http-router/commit/f0306c9e7e9849ec502c22afb66f6ec20e63db00)), closes [#13](https://github.com/httpland/http-router/issues/13)
* **types:** remove duplicated ([a8ae0ce](https://github.com/httpland/http-router/commit/a8ae0cedd5be78c1ce1038aec37c9ab567756af7)), closes [#17](https://github.com/httpland/http-router/issues/17)

### BREAKING CHANGES

* **routers:** The `createRouter` has been removed and `URLRouter` and `MethodRouter` have been
added.
Nested notation has been removed and restricted to flat notation only.
* **types:** remove dupicated types
* **errors:** `RouterError` is removed. `Error` is used instead of `RouterError.

# [1.2.0](https://github.com/httpland/http-router/compare/1.1.0...1.2.0) (2022-09-13)

### Bug Fixes

* **router:** fix error message typo ([cd59870](https://github.com/httpland/http-router/commit/cd598706e6b53549201820510755d8096540322d))
* **router:** use url path join instread of std/path join ([29ef6a2](https://github.com/httpland/http-router/commit/29ef6a2548bb4efce1a3fb2955fd9a8d744a008e))

### Features

* **constants:** add set of http method ([3d97f9a](https://github.com/httpland/http-router/commit/3d97f9a23455bf9ec928f3ef4bb928f5aabaa822))
* **errors:** add basic router error ([4987665](https://github.com/httpland/http-router/commit/49876650c7ad49c1f01300bc5dee0dc077ff97e4))
* **router:** accept nested route literal ([d2cc85b](https://github.com/httpland/http-router/commit/d2cc85bccdb0e431c7c01235ad0a9d05eda6407f)), closes [#6](https://github.com/httpland/http-router/issues/6)
* **router:** add `basePath` option that change router base path ([329c2bf](https://github.com/httpland/http-router/commit/329c2bfbc7c75cbce64a7f434fbcb6afd06ba480))
* **router:** add catching URLPattern error and convert to AggregateError within RouterError ([be135e7](https://github.com/httpland/http-router/commit/be135e7c2b7e948f6c30a05fcf697d926924e443))
* **router:** add debug flag to see internal error detail ([e0d75bd](https://github.com/httpland/http-router/commit/e0d75bd66cf363a66dc75ee6ecffac18fe6a7b99)), closes [#8](https://github.com/httpland/http-router/issues/8)
* **router:** add detect routing table error ([0f70875](https://github.com/httpland/http-router/commit/0f708757e33714a00bbfd28d0884fb46dcadbdf5)), closes [#6](https://github.com/httpland/http-router/issues/6)
* **router:** add validating to catch all handler and method handler are same route or not ([a589c4e](https://github.com/httpland/http-router/commit/a589c4e02e88aa40c881fad2bdda3e5c1b2f1338))
* **router:** rename `MethodRouteHandlers` to `MethodHandlers` types ([d147749](https://github.com/httpland/http-router/commit/d147749d4d874646aafe3faa4830921e9ca7cbc4))
* **types:** rename `Method` to `HttpMethod`, mark deprecate ([62ae347](https://github.com/httpland/http-router/commit/62ae347be9b0ba4f7ebcfd9a331a579c85cc228f))

### Performance Improvements

* **router:** improve response time by caching matching result ([ffdc8b0](https://github.com/httpland/http-router/commit/ffdc8b0acdac97cdb1a70d9a3d9d3ad47198eb9b)), closes [#7](https://github.com/httpland/http-router/issues/7)
* **router:** remove unnessesary url pattern test ([704228d](https://github.com/httpland/http-router/commit/704228d61819388379768ef280c3b510d733f8c5))

# [1.2.0-beta.5](https://github.com/httpland/http-router/compare/1.2.0-beta.4...1.2.0-beta.5) (2022-09-13)

### Bug Fixes

* **router:** fix error message typo ([cd59870](https://github.com/httpland/http-router/commit/cd598706e6b53549201820510755d8096540322d))

# [1.2.0-beta.4](https://github.com/httpland/http-router/compare/1.2.0-beta.3...1.2.0-beta.4) (2022-09-13)

### Features

* **router:** add debug flag to see internal error detail ([e0d75bd](https://github.com/httpland/http-router/commit/e0d75bd66cf363a66dc75ee6ecffac18fe6a7b99)), closes [#8](https://github.com/httpland/http-router/issues/8)
* **router:** rename `MethodRouteHandlers` to `MethodHandlers` types ([d147749](https://github.com/httpland/http-router/commit/d147749d4d874646aafe3faa4830921e9ca7cbc4))

# [1.2.0-beta.3](https://github.com/httpland/http-router/compare/1.2.0-beta.2...1.2.0-beta.3) (2022-09-13)

### Features

* **router:** add catching URLPattern error and convert to AggregateError within RouterError ([be135e7](https://github.com/httpland/http-router/commit/be135e7c2b7e948f6c30a05fcf697d926924e443))
* **router:** add validating to catch all handler and method handler are same route or not ([a589c4e](https://github.com/httpland/http-router/commit/a589c4e02e88aa40c881fad2bdda3e5c1b2f1338))

### Performance Improvements

* **router:** improve response time by caching matching result ([ffdc8b0](https://github.com/httpland/http-router/commit/ffdc8b0acdac97cdb1a70d9a3d9d3ad47198eb9b)), closes [#7](https://github.com/httpland/http-router/issues/7)

# [1.2.0-beta.2](https://github.com/httpland/http-router/compare/1.2.0-beta.1...1.2.0-beta.2) (2022-09-13)

### Bug Fixes

* **router:** use url path join instread of std/path join ([29ef6a2](https://github.com/httpland/http-router/commit/29ef6a2548bb4efce1a3fb2955fd9a8d744a008e))

### Features

* **constants:** add set of http method ([3d97f9a](https://github.com/httpland/http-router/commit/3d97f9a23455bf9ec928f3ef4bb928f5aabaa822))
* **errors:** add basic router error ([4987665](https://github.com/httpland/http-router/commit/49876650c7ad49c1f01300bc5dee0dc077ff97e4))
* **router:** accept nested route literal ([d2cc85b](https://github.com/httpland/http-router/commit/d2cc85bccdb0e431c7c01235ad0a9d05eda6407f)), closes [#6](https://github.com/httpland/http-router/issues/6)
* **router:** add detect routing table error ([0f70875](https://github.com/httpland/http-router/commit/0f708757e33714a00bbfd28d0884fb46dcadbdf5)), closes [#6](https://github.com/httpland/http-router/issues/6)
* **types:** rename `Method` to `HttpMethod`, mark deprecate ([62ae347](https://github.com/httpland/http-router/commit/62ae347be9b0ba4f7ebcfd9a331a579c85cc228f))

# [1.2.0-beta.1](https://github.com/httpland/http-router/compare/1.1.0...1.2.0-beta.1) (2022-09-11)

### Features

* **router:** add `basePath` option that change router base path ([329c2bf](https://github.com/httpland/http-router/commit/329c2bfbc7c75cbce64a7f434fbcb6afd06ba480))

### Performance Improvements

* **router:** remove unnessesary url pattern test ([704228d](https://github.com/httpland/http-router/commit/704228d61819388379768ef280c3b510d733f8c5))

# [1.1.0](https://github.com/httpland/http-router/compare/1.0.0...1.1.0) (2022-08-12)

### Features

* **router:** change route handler context ([c59dc21](https://github.com/httpland/http-router/commit/c59dc21980df76c33949eb0271dc58a4472b5cb3))

# [1.1.0-beta.1](https://github.com/httpland/http-router/compare/1.0.0...1.1.0-beta.1) (2022-08-12)

### Features

* **router:** change route handler context ([c59dc21](https://github.com/httpland/http-router/commit/c59dc21980df76c33949eb0271dc58a4472b5cb3))

# 1.0.0 (2022-08-11)

### Bug Fixes

* **router:** fix to return response statusText ([77f69df](https://github.com/httpland/http-router/commit/77f69dfec23e98e79ea0e793760fc99c2cf8318a))

### Features

* **_tools:** add npm release script ([7d0664e](https://github.com/httpland/http-router/commit/7d0664e2e2914ea3d343acabcf2879048007fd8f))
* **router:** add basic http request router ([9620752](https://github.com/httpland/http-router/commit/9620752e77e05ede71753a0ecc95941124c716c7))
* **router:** add registering HEAD request handler automatically ([207aae7](https://github.com/httpland/http-router/commit/207aae7c33149572ba06c5a40a071ccd81664893))
* **router:** export `MethodRouteHandlers` types ([5148d04](https://github.com/httpland/http-router/commit/5148d04a1744c2ae7bc002ede6ad575478c52321))

# [1.0.0-beta.5](https://github.com/httpland/http-router/compare/1.0.0-beta.4...1.0.0-beta.5) (2022-08-11)

### Features

* **router:** export `MethodRouteHandlers` types ([5148d04](https://github.com/httpland/http-router/commit/5148d04a1744c2ae7bc002ede6ad575478c52321))

# [1.0.0-beta.4](https://github.com/httpland/http-router/compare/1.0.0-beta.3...1.0.0-beta.4) (2022-08-10)

### Features

* **router:** add registering HEAD request handler automatically ([207aae7](https://github.com/httpland/http-router/commit/207aae7c33149572ba06c5a40a071ccd81664893))

# [1.0.0-beta.3](https://github.com/httpland/http-router/compare/1.0.0-beta.2...1.0.0-beta.3) (2022-08-09)

### Features

* **_tools:** add npm release script ([7d0664e](https://github.com/httpland/http-router/commit/7d0664e2e2914ea3d343acabcf2879048007fd8f))

# [1.0.0-beta.2](https://github.com/TomokiMiyauci/http-router/compare/1.0.0-beta.1...1.0.0-beta.2) (2022-08-08)

### Bug Fixes

* **router:** fix to return response statusText ([77f69df](https://github.com/TomokiMiyauci/http-router/commit/77f69dfec23e98e79ea0e793760fc99c2cf8318a))

# 1.0.0-beta.1 (2022-08-08)

### Features

* **router:** add basic http request router ([9620752](https://github.com/TomokiMiyauci/http-router/commit/9620752e77e05ede71753a0ecc95941124c716c7))
