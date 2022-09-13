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
