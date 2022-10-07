# [1.0.0-beta.6](https://github.com/httpland/http-router/compare/1.0.0-beta.5...1.0.0-beta.6) (2022-10-07)


### Bug Fixes

* **router:** fix error message typo ([9c6c602](https://github.com/httpland/http-router/commit/9c6c60273fbe255ee550927149b6dc5188e08495))
* **router:** use url path join instread of std/path join ([a862498](https://github.com/httpland/http-router/commit/a862498212481c9604762ee5a28df2b558619386))
* **utils:** change priority of overlapping routes ([e6efb5f](https://github.com/httpland/http-router/commit/e6efb5f47863cc47c2aa98dab6b93d23f62dd276))
* **utils:** fix throwing error pattern ([8e1b556](https://github.com/httpland/http-router/commit/8e1b556669f59991c379fb663b02a69bb1a36b06))


### Features

* **constants:** add set of http method ([e6ca6bf](https://github.com/httpland/http-router/commit/e6ca6bf3d4050b5d6774f8802b85ab0bfff556e1))
* **errors:** add basic router error ([72501ca](https://github.com/httpland/http-router/commit/72501ca3472fd0e670b33745b621bb3b16e871fc))
* **errors:** remove `RouterError` and use `Error` instead ([3a2b7ba](https://github.com/httpland/http-router/commit/3a2b7ba9607d8b1b76d954cbc58643af5beba5ec)), closes [#16](https://github.com/httpland/http-router/issues/16)
* **mod:** export API types ([3a16511](https://github.com/httpland/http-router/commit/3a16511f67788d3f37e9b0dd766b2c81259a5614)), closes [#13](https://github.com/httpland/http-router/issues/13)
* **mod:** remove unnessesary module from API ([d837a23](https://github.com/httpland/http-router/commit/d837a23ef5bb7045ab0a152adbf9298c14dc0438)), closes [#18](https://github.com/httpland/http-router/issues/18)
* **router:** accept nested route literal ([6302c93](https://github.com/httpland/http-router/commit/6302c9322c82d75963301f81beb2688273149c82)), closes [#6](https://github.com/httpland/http-router/issues/6)
* **router:** add `afterEach` hooks to router option ([95c13bf](https://github.com/httpland/http-router/commit/95c13bf82888b132a27f283c6610a8b2fa52c21e)), closes [#10](https://github.com/httpland/http-router/issues/10)
* **router:** add `basePath` option that change router base path ([329f51a](https://github.com/httpland/http-router/commit/329f51aac221bea854f94bd01d0a95020aa4bddd))
* **router:** add catching URLPattern error and convert to AggregateError within RouterError ([f853ff9](https://github.com/httpland/http-router/commit/f853ff9c2e324dcd6dd7261788c0b1b67f0fb784))
* **router:** add debug flag to see internal error detail ([a61ed19](https://github.com/httpland/http-router/commit/a61ed1937ae14a11111e88ae09464d7cd01315b2)), closes [#8](https://github.com/httpland/http-router/issues/8)
* **router:** add detect routing table error ([821a74c](https://github.com/httpland/http-router/commit/821a74cb5b9960611bf0b1291d9d13c4ccc0f127)), closes [#6](https://github.com/httpland/http-router/issues/6)
* **router:** add validating to catch all handler and method handler are same route or not ([970071a](https://github.com/httpland/http-router/commit/970071a7e6a546dfe289dfb1dbe720060093fd91))
* **router:** change route handler context ([68477f3](https://github.com/httpland/http-router/commit/68477f3224224b8b88bc42e7222e3f10f613e26f))
* **router:** delete validating routes and throwing error ([589c2bf](https://github.com/httpland/http-router/commit/589c2bfbab3aea8d427ca2d4ff7d75d1ced43bf4)), closes [#21](https://github.com/httpland/http-router/issues/21)
* **router:** rename `MethodRouteHandlers` to `MethodHandlers` types ([70e98b0](https://github.com/httpland/http-router/commit/70e98b0403802e2a79b8cebaf9ed1d9557fc28a8))
* **routers:** add `URLRouter` and `MethodRouter` instead of `createRouter` ([6eadfab](https://github.com/httpland/http-router/commit/6eadfab0ba4b197e7534d726ccf73a9d839b1f0c)), closes [#13](https://github.com/httpland/http-router/issues/13)
* **types:** add `MethodRouteHandler` types ([822ece7](https://github.com/httpland/http-router/commit/822ece7a6e3a5c94dd726f2cf8167843c2152447)), closes [#27](https://github.com/httpland/http-router/issues/27)
* **types:** add `result` field to URL router route handler context ([c900c50](https://github.com/httpland/http-router/commit/c900c507354d7d160f82c1b68a86b6989ea9dc3f)), closes [#19](https://github.com/httpland/http-router/issues/19)
* **types:** add `URLRoutes` related types ([38da6e3](https://github.com/httpland/http-router/commit/38da6e31ef71a23b0c715e1877b53ab5e055f19a)), closes [#14](https://github.com/httpland/http-router/issues/14)
* **types:** change `params` of url route handler context types ([d7bac36](https://github.com/httpland/http-router/commit/d7bac3687dab94dd7ae14a6eba069c19d9601ad1)), closes [#20](https://github.com/httpland/http-router/issues/20)
* **types:** change types and add test case ([c446983](https://github.com/httpland/http-router/commit/c446983bc4ccbcb9135e1f0432ebfc7d6e9779b1)), closes [#14](https://github.com/httpland/http-router/issues/14)
* **types:** remove `route` field from url router route handler context ([ed3d4e0](https://github.com/httpland/http-router/commit/ed3d4e01cf6fceed4770a2b350d6a8cdd6de1550)), closes [#19](https://github.com/httpland/http-router/issues/19)
* **types:** remove duplicated ([43a79b5](https://github.com/httpland/http-router/commit/43a79b576e185562d739a7f0bffd523e8e90a0f7)), closes [#17](https://github.com/httpland/http-router/issues/17)
* **types:** rename `Method` to `HttpMethod`, mark deprecate ([0a27f66](https://github.com/httpland/http-router/commit/0a27f661be8235cae6e55fa9abf2a81f6dd8c1ea))
* **utils:** add assert to `nest` ([83a9f3b](https://github.com/httpland/http-router/commit/83a9f3bfc8b3da1656f9fe4e9ce8ef4a3b15191d))
* **utils:** add validation for url routes ([5aaccaa](https://github.com/httpland/http-router/commit/5aaccaa057270e216ac4cbf1082334201b238a65))
* **utils:** change concatenate url path logic ([1286dc6](https://github.com/httpland/http-router/commit/1286dc660d9766fd88ce186577d77aeda1a5e843))
* **utils:** remove validation and throwing logic from `nest` ([1476d1c](https://github.com/httpland/http-router/commit/1476d1c114b63e5c5505a48d4282a6bf5f6cb164)), closes [#21](https://github.com/httpland/http-router/issues/21)
* **utils:** use custom inspect instead of `Deno.inspect` ([799bff1](https://github.com/httpland/http-router/commit/799bff1a40ca2e4fd294bd24b341d631374dff7d)), closes [#22](https://github.com/httpland/http-router/issues/22)


### Performance Improvements

* **router:** add non matched pattern to cache ([0eaa017](https://github.com/httpland/http-router/commit/0eaa017a3c5d99ee2502f4a6843fdb6e9aaaa459))
* **router:** improve response time by caching matching result ([095fb81](https://github.com/httpland/http-router/commit/095fb8162f2c774a23566aa1190d70ac54f8489f)), closes [#7](https://github.com/httpland/http-router/issues/7)
* **router:** remove unnessesary url pattern test ([10ee3c1](https://github.com/httpland/http-router/commit/10ee3c1902a75a83fbd455fe587ec1e337c5e13c))


### BREAKING CHANGES

* **types:** remove optional flag from `params` in url route handler context types
* **types:** remove `route` field from url router route handler context
* **mod:** made unimportant modules private
* **routers:** The `createRouter` has been removed and `URLRouter` and `MethodRouter` have been
added.
Nested notation has been removed and restricted to flat notation only.
* **types:** remove dupicated types
* **errors:** `RouterError` is removed. `Error` is used instead of `RouterError.

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
