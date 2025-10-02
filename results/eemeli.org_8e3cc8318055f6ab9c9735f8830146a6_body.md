# YAML – YAML

来源: [eemeli.org](https://eemeli.org/yaml/)

提取模式: body

---

[ NAV ![](https://eemeli.org/yaml/images/navbar-cad8cdcb.png) ](https://eemeli.org/yaml/)

![](https://eemeli.org/yaml/images/logo-ff1f79b2.png)

- [YAML](https://eemeli.org/yaml/#yaml)
  - [API Overview](https://eemeli.org/yaml/#api-overview)
- [Parse & Stringify](https://eemeli.org/yaml/#parse-amp-stringify)
  - [YAML.parse](https://eemeli.org/yaml/#yaml-parse)
  - [YAML.stringify](https://eemeli.org/yaml/#yaml-stringify)
- [Options](https://eemeli.org/yaml/#options)
  - [Parse Options](https://eemeli.org/yaml/#parse-options)
  - [Document Options](https://eemeli.org/yaml/#document-options)
  - [Schema Options](https://eemeli.org/yaml/#schema-options)
  - [CreateNode Options](https://eemeli.org/yaml/#createnode-options)
  - [ToJS Options](https://eemeli.org/yaml/#tojs-options)
  - [ToString Options](https://eemeli.org/yaml/#tostring-options)
- [Documents](https://eemeli.org/yaml/#documents)
  - [Parsing Documents](https://eemeli.org/yaml/#parsing-documents)
  - [Creating Documents](https://eemeli.org/yaml/#creating-documents)
  - [Document Methods](https://eemeli.org/yaml/#document-methods)
  - [Stream Directives](https://eemeli.org/yaml/#stream-directives)
- [Content Nodes](https://eemeli.org/yaml/#content-nodes)
  - [Scalar Values](https://eemeli.org/yaml/#scalar-values)
  - [Collections](https://eemeli.org/yaml/#collections)
  - [Alias Nodes](https://eemeli.org/yaml/#alias-nodes)
  - [Creating Nodes](https://eemeli.org/yaml/#creating-nodes)
  - [Finding and Modifying Nodes](https://eemeli.org/yaml/#finding-and-modifying-nodes)
  - [Identifying Node Types](https://eemeli.org/yaml/#identifying-node-types)
  - [Comments and Blank Lines](https://eemeli.org/yaml/#comments-and-blank-lines)
- [Custom Data Types](https://eemeli.org/yaml/#custom-data-types)
  - [Built-in Custom Tags](https://eemeli.org/yaml/#built-in-custom-tags)
  - [Writing Custom Tags](https://eemeli.org/yaml/#writing-custom-tags)
- [Parsing YAML](https://eemeli.org/yaml/#parsing-yaml)
  - [Lexer](https://eemeli.org/yaml/#lexer)
  - [Parser](https://eemeli.org/yaml/#parser)
  - [Composer](https://eemeli.org/yaml/#composer)
  - [Working with CST Tokens](https://eemeli.org/yaml/#working-with-cst-tokens)
- [Errors](https://eemeli.org/yaml/#errors)
  - [Silencing Errors and Warnings](https://eemeli.org/yaml/#silencing-errors-and-warnings)
- [Command-line Tool](https://eemeli.org/yaml/#command-line-tool)
- [YAML Syntax](https://eemeli.org/yaml/#yaml-syntax)

  - [Tags](https://eemeli.org/yaml/#tags)
  - [Version Differences](https://eemeli.org/yaml/#version-differences)

- [Version 2.8.1 (changelog)](https://github.com/eemeli/yaml/releases)
- [github.com/eemeli/yaml](https://github.com/eemeli/yaml)
- [`npm install yaml`](https://www.npmjs.com/package/yaml)

# YAML

> To install:

    npm install yaml
    # or
    deno add jsr:@eemeli/yaml

> To use:

    import { parse, stringify } from 'yaml'
    // or
    import YAML from 'yaml'
    // or
    const YAML = require('yaml')

`yaml` is a definitive library for [YAML](http://yaml.org/), the human friendly data serialization standard. This library:

- Supports both YAML 1.1 and YAML 1.2 and all common data schemas,
- Passes all of the [yaml-test-suite](https://github.com/yaml/yaml-test-suite) tests,
- Can accept any string as input without throwing, parsing as much YAML out of it as it can, and
- Supports parsing, modifying, and writing YAML comments and blank lines.

The library is released under the ISC open source license, and the code is [available on GitHub](https://github.com/eemeli/yaml/). It has no external dependencies and runs on Node.js as well as modern browsers.

For the purposes of versioning, any changes that break any of the endpoints or APIs documented here will be considered semver-major breaking changes. Undocumented library internals may change between minor versions, and previous APIs may be deprecated (but not removed).

The minimum supported TypeScript version of the included typings is 3.9; for use in earlier versions you may need to set `skipLibCheck: true` in your config. This requirement may be updated between minor versions of the library.

For build instructions and contribution guidelines, see [docs/CONTRIBUTING.md](https://github.com/eemeli/yaml/blob/main/docs/CONTRIBUTING.md) in the repo.

**Note:** These docs are for `yaml@2`. For v1, see the [v1.10.0 tag](https://github.com/eemeli/yaml/tree/v1.10.0) for the source and [eemeli.org/yaml/v1](https://eemeli.org/yaml/v1/) for the documentation.

## API Overview

The API provided by `yaml` has three layers, depending on how deep you need to go: [Parse & Stringify](https://eemeli.org/yaml/#parse-amp-stringify), [Documents](https://eemeli.org/yaml/#documents), and the underlying [Lexer/Parser/Composer](https://eemeli.org/yaml/#parsing-yaml). The first has the simplest API and "just works", the second gets you all the bells and whistles supported by the library along with a decent [AST](https://eemeli.org/yaml/#content-nodes), and the third lets you get progressively closer to YAML source, if that's your thing.

A [command-line tool](https://eemeli.org/yaml/#command-line-tool) is also included.

### Parse & Stringify

    import { parse, stringify } from 'yaml'

- [`parse(str, reviver?, options?): value`](https://eemeli.org/yaml/#yaml-parse)
- [`stringify(value, replacer?, options?): string`](https://eemeli.org/yaml/#yaml-stringify)

### Documents

    import {
      Document,
      isDocument,
      parseAllDocuments,
      parseDocument
    } from 'yaml'

- [`Document`](https://eemeli.org/yaml/#documents)
  - [`constructor(value, replacer?, options?)`](https://eemeli.org/yaml/#creating-documents)
  - [`#contents`](https://eemeli.org/yaml/#content-nodes)
  - [`#directives`](https://eemeli.org/yaml/#stream-directives)
  - [`#errors`](https://eemeli.org/yaml/#errors)
  - [`#warnings`](https://eemeli.org/yaml/#errors)
- [`parseAllDocuments(str, options?): Document[]`](https://eemeli.org/yaml/#parsing-documents)
- [`parseDocument(str, options?): Document`](https://eemeli.org/yaml/#parsing-documents)

### Content Nodes

    import {
      isAlias, isCollection, isMap, isNode,
      isPair, isScalar, isSeq, Scalar,
      visit, visitAsync, YAMLMap, YAMLSeq
    } from 'yaml'

- [`is*(foo): boolean`](https://eemeli.org/yaml/#identifying-node-types)
- [`new Scalar(value)`](https://eemeli.org/yaml/#scalar-values)
- [`new YAMLMap()`](https://eemeli.org/yaml/#collections)
- [`new YAMLSeq()`](https://eemeli.org/yaml/#collections)
- [`doc.createAlias(node, name?): Alias`](https://eemeli.org/yaml/#creating-nodes)
- [`doc.createNode(value, options?): Node`](https://eemeli.org/yaml/#creating-nodes)
- [`doc.createPair(key, value): Pair`](https://eemeli.org/yaml/#creating-nodes)
- [`visit(node, visitor)`](https://eemeli.org/yaml/#finding-and-modifying-nodes)
- [`visitAsync(node, visitor)`](https://eemeli.org/yaml/#finding-and-modifying-nodes)

### Parsing YAML

    import { Composer, Lexer, Parser } from 'yaml'

- [`new Lexer().lex(src)`](https://eemeli.org/yaml/#lexer)
- [`new Parser(onNewLine?).parse(src)`](https://eemeli.org/yaml/#parser)
- [`new Composer(options?).compose(tokens)`](https://eemeli.org/yaml/#composer)

# Parse & Stringify

    # file.yml
    YAML:
      - A human-readable data serialization language
      - https://en.wikipedia.org/wiki/YAML
    yaml:
      - A complete JavaScript implementation
      - https://www.npmjs.com/package/yaml

At its simplest, you can use `YAML.parse(str)` and `YAML.stringify(value)` just as you'd use `JSON.parse(str)` and `JSON.stringify(value)`. If that's enough for you, everything else in these docs is really just implementation details.

## YAML.parse

    import fs from 'fs'
    import YAML from 'yaml'

    YAML.parse('3.14159')
    // 3.14159

    YAML.parse('[ true, false, maybe, null ]\n')
    // [ true, false, 'maybe', null ]

    const file = fs.readFileSync('./file.yml', 'utf8')
    YAML.parse(file)
    // { YAML:
    //   [ 'A human-readable data serialization language',
    //     'https://en.wikipedia.org/wiki/YAML' ],
    //   yaml:
    //   [ 'A complete JavaScript implementation',
    //     'https://www.npmjs.com/package/yaml' ] }

#### `YAML.parse(str, reviver?, options = {}): any`

`str` should be a string with YAML formatting. If defined, the `reviver` function follows the [JSON implementation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter). See [Options](https://eemeli.org/yaml/#options) for more information on the last argument, an optional configuration object.

The returned value will match the type of the root value of the parsed YAML document, so Maps become objects, Sequences arrays, and scalars result in nulls, booleans, numbers and strings.

`YAML.parse` may throw on error, and it may log warnings using `console.warn`. It only supports input consisting of a single YAML document; for multi-document support you should use [`YAML.parseAllDocuments`](https://eemeli.org/yaml/#parsing-documents).

## YAML.stringify

    YAML.stringify(3.14159)
    // '3.14159\n'

    YAML.stringify([true, false, 'maybe', null])
    // `- true
    // - false
    // - maybe
    // - null
    // `

    YAML.stringify({ number: 3, plain: 'string', block: 'two\nlines\n' })
    // `number: 3
    // plain: string
    // block: >
    //   two
    //
    //   lines
    // `

#### `YAML.stringify(value, replacer?, options = {}): string`

`value` can be of any type. The returned string will always include `\n` as the last character, as is expected of YAML documents. If defined, the `replacer` array or function follows the [JSON implementation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter). See [Options](https://eemeli.org/yaml/#options) for more information on the last argument, an optional configuration object. For JSON compatibility, using a number or a string as the `options` value will set the `indent` option accordingly.

As strings in particular may be represented in a number of different styles, the simplest option for the value in question will always be chosen, depending mostly on the presence of escaped or control characters and leading & trailing whitespace.

To create a stream of documents, you may call `YAML.stringify` separately for each document's `value`, and concatenate the documents with the string `...\n` as a separator.

# Options

    import { parse, stringify } from 'yaml'

    parse('number: 999')
    // { number: 999 }

    parse('number: 999', { intAsBigInt: true })
    // { number: 999n }

    parse('number: 999', { schema: 'failsafe' })
    // { number: '999' }

The options supported by various `yaml` features are split into various categories, depending on how and where they are used. Options in various categories do not overlap, so it's fine to use a single "bag" of options and pass it to each function or method.

## Parse Options

Parse options affect the parsing and composition of a YAML Document from it source.

Used by: `parse()`, `parseDocument()`, `parseAllDocuments()`, `new Composer()`, and `new Document()`

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| intAsBigInt | `boolean` | `false` | Whether integers should be parsed into [BigInt](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/BigInt) rather than `number` values. |
| keepSourceTokens | `boolean` | `false` | Include a `srcToken` value on each parsed `Node`, containing the [CST token](https://eemeli.org/yaml/#working-with-cst-tokens) that was composed into this node. |
| lineCounter | `LineCounter` |  | If set, newlines will be tracked, to allow for `lineCounter.linePos(offset)` to provide the `{ line, col }` positions within the input. |
| prettyErrors | `boolean` | `true` | Include line/col position in errors, along with an extract of the source string. |
| strict | `boolean` | `true` | When parsing, do not ignore errors [required](https://eemeli.org/yaml/#silencing-errors-and-warnings) by the YAML 1.2 spec, but caused by unambiguous content. |
| stringKeys | `boolean` | `false` | Parse all mapping keys as strings. Treat all non-scalar keys as errors. |
| uniqueKeys | `boolean ⎮ (a, b) => boolean` | `true` | Whether key uniqueness is checked, or customised. If set to be a function, it will be passed two parsed nodes and should return a boolean value indicating their equality. |

## Document Options

Document options are relevant for operations on the `Document` object, which makes them relevant for both conversion directions.

Used by: `parse()`, `parseDocument()`, `parseAllDocuments()`, `stringify()`, `new Composer()`, and `new Document()`

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| logLevel | `'warn' ⎮ 'error' ⎮` `'silent'` | `'warn'` | Control the verbosity of `parse()`. Set to `'error'` to silence warnings, and to `'silent'` to also silence most errors (not recommended). |
| version | `'1.1' ⎮ '1.2'` | `'1.2'` | The YAML version used by documents without a `%YAML` directive. |

By default, the library will emit warnings as required by the YAML spec during parsing. If you'd like to silence these, set the `logLevel` option to `'error'`.

## Schema Options

    parse('3') // 3 (Using YAML 1.2 core schema by default)
    parse('3', { schema: 'failsafe' }) // '3'

    parse('No') // 'No'
    parse('No', { schema: 'json' }) // SyntaxError: Unresolved plain scalar "No"
    parse('No', { schema: 'yaml-1.1' }) // false
    parse('No', { version: '1.1' }) // false

Schema options determine the types of values that the document supports.

Aside from defining the language structure, the YAML 1.2 spec defines a number of different _schemas_ that may be used. The default is the [`core`](http://yaml.org/spec/1.2/spec.html#id2804923) schema, which is the most common one. The [`json`](http://yaml.org/spec/1.2/spec.html#id2803231) schema is effectively the minimum schema required to parse JSON; both it and the core schema are supersets of the minimal [`failsafe`](http://yaml.org/spec/1.2/spec.html#id2802346) schema.

The `yaml-1.1` schema matches the more liberal [YAML 1.1 types](http://yaml.org/type/) (also used by YAML 1.0), including binary data and timestamps as distinct tags. This schema accepts a greater variance in scalar values (with e.g. `'No'` being parsed as `false` rather than a string value). The `!!value` and `!!yaml` types are not supported.

Used by: `parse()`, `parseDocument()`, `parseAllDocuments()`, `stringify()`, `new Composer()`, `new Document()`, and `doc.setSchema()`

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| compat | `string ⎮ Tag[] ⎮ null` | `null` | When parsing, warn about compatibility issues with the given schema. When stringifying, use scalar styles that are parsed correctly by the `compat` schema as well as the actual schema. |
| customTags | `Tag[] ⎮ function` |  | Array of [additional tags](https://eemeli.org/yaml/#custom-data-types) to include in the schema |
| merge | `boolean` | 1.1: `true` 1.2: `false` | Enable support for `<<` merge keys. Default value depends on YAML version. |
| resolveKnownTags | `boolean` | `true` | When using the `'core'` schema, support parsing values with these explicit [YAML 1.1 tags](https://yaml.org/type/): `!!binary`, `!!omap`, `!!pairs`, `!!set`, `!!timestamp`. By default `true`. |
| schema | `string ⎮ Schema` | 1.1: `'yaml-1.1'` 1.2: `'core'` | The base schema to use. Default value depends on YAML version. Built-in support is provided for `'core'`, `'failsafe'`, `'json'`, and `'yaml-1.1'`. If using another string value, `customTags` must be an array of tags. |
| sortMapEntries | `boolean ⎮` `(a, b: Pair) => number` | `false` | When stringifying, sort map entries. If `true`, sort by comparing key values using the native less-than `<` operator. |
| toStringDefaults | `ToStringOptions` |  | Override default values for `toString()` options. |

    const src = `
      source: &base { a: 1, b: 2 }
      target:
        <<: *base
        b: base`
    const mergeResult = parse(src, { merge: true })
    mergeResult.target
    // { a: 1, b: 'base' }

**Merge** keys are a [YAML 1.1 feature](http://yaml.org/type/merge.html) that is not a part of the 1.2 spec. To use a merge key, assign a map or its alias or an array of such as the value of a `<<` key in a mapping. Multiple merge keys may be used on the same map, with earlier values taking precedence over latter ones, in case both define a value for the same key.

## CreateNode Options

Used by: `stringify()`, `new Document()`, `doc.createNode()`, and `doc.createPair()`

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| aliasDuplicateObjects | `boolean` | `true` | During node construction, use anchors and aliases to keep strictly equal non-null objects as equivalent in YAML. |
| anchorPrefix | `string` | `'a'` | Default prefix for anchors, resulting in anchors `a1`, `a2`, ... by default. |
| flow | `boolean` | `false` | Force the top-level collection node to use flow style. |
| keepUndefined | `boolean` | `false` | Keep `undefined` object values when creating mappings and return a Scalar node when stringifying `undefined`. |
| tag | `string` |  | Specify the top-level collection type, e.g. `'!!omap'`. Note that this requires the corresponding tag to be available in this document's schema. |

## ToJS Options

    parse('{[1, 2]: many}') // { '[ 1, 2 ]': 'many' }
    parse('{[1, 2]: many}', { mapAsMap: true }) // Map { [ 1, 2 ] => 'many' }

These options influence how the document is transformed into "native" JavaScript representation.

Used by: `parse()`, `doc.toJS()` and `node.toJS()`

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| mapAsMap | `boolean` | `false` | Use Map rather than Object to represent mappings. |
| maxAliasCount | `number` | `100` | Prevent [exponential entity expansion attacks](https://en.wikipedia.org/wiki/Billion_laughs_attack) by limiting data aliasing; set to `-1` to disable checks; `0` disallows all alias nodes. |
| onAnchor | `(value: any, count: number) => void` |  | Optional callback for each aliased anchor in the document. |
| reviver | `(key: any, value: any) => any` |  | Optionally apply a [reviver function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter) to the output, following the JSON specification but with appropriate extensions for handling `Map` and `Set`. |

## ToString Options

    stringify(
      { this: null, that: 'value' },
      { defaultStringType: 'QUOTE_SINGLE', nullStr: '~' }
    )
    // 'this': ~
    // 'that': 'value'

The `doc.toString()` method may be called with additional options to control the resulting YAML string representation of the document.

Used by: `stringify()` and `doc.toString()`

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| blockQuote | `boolean ⎮ 'folded' ⎮ 'literal'` | `true` | Use block quote styles for scalar values where applicable. Set to `false` to disable block quotes completely. |
| collectionStyle | `'any' ⎮ 'block' ⎮ 'flow'` | `'any'` | Enforce `'block'` or `'flow'` style on maps and sequences. By default, allows each collection to set its own `flow: boolean` property. |
| commentString | `(comment: string) => string` |  | Output should be valid for the current schema. By default, empty comment lines are left empty, lines consisting of a single space are replaced by `#`, and all other lines are prefixed with a `#`. |
| defaultKeyType | `'BLOCK_FOLDED' ⎮ 'BLOCK_LITERAL' ⎮` `'QUOTE_DOUBLE' ⎮ 'QUOTE_SINGLE' ⎮` `'PLAIN' ⎮ null` | `null` | If not `null`, overrides `defaultStringType` for implicit key values. |
| defaultStringType | `'BLOCK_FOLDED' ⎮ 'BLOCK_LITERAL' ⎮` `'QUOTE_DOUBLE' ⎮ 'QUOTE_SINGLE' ⎮` `'PLAIN'` | `'PLAIN'` | The default type of string literal used to stringify values. |
| directives | `boolean ⎮ null` | `null` | Include directives in the output. If `true`, at least the document-start marker `---` is always included. If `false`, no directives or marker is ever included. If `null`, directives and marker may be included if required. |
| doubleQuotedAsJSON | `boolean` | `false` | Restrict double-quoted strings to use JSON-compatible syntax. |
| doubleQuotedMinMultiLineLength | `number` | `40` | Minimum length for double-quoted strings to use multiple lines to represent the value instead of escaping newlines. |
| falseStr | `string` | `'false'` | String representation for `false` values. |
| flowCollectionPadding | `boolean` | `true` | When true, a single space of padding will be added inside the delimiters of non-empty single-line flow collections. |
| indent | `number` | `2` | The number of spaces to use when indenting code. Should be a strictly positive integer. |
| indentSeq | `boolean` | `true` | Whether block sequences should be indented. |
| lineWidth | `number` | `80` | Maximum line width (set to `0` to disable folding). This is a soft limit, as only double-quoted semantics allow for inserting a line break in the middle of a word. |
| minContentWidth | `number` | `20` | Minimum line width for highly-indented content (set to `0` to disable). Ignored if greater than lineWidth. |
| nullStr | `string` | `'null'` | String representation for `null` values. |
| simpleKeys | `boolean` | `false` | Require keys to be scalars and always use implicit rather than explicit notation. |
| singleQuote | `boolean ⎮ null` | `null` | Use 'single quote' rather than "double quote" where applicable. Set to `false` to disable single quotes completely. |
| trueStr | `string` | `'true'` | String representation for `true` values. |

# Documents

In order to work with YAML features not directly supported by native JavaScript data types, such as comments, anchors and aliases, `yaml` provides the `Document` API.

## Parsing Documents

    import fs from 'fs'
    import { parseAllDocuments, parseDocument } from 'yaml'

    const file = fs.readFileSync('./file.yml', 'utf8')
    const doc = parseDocument(file)
    doc.contents
    // YAMLMap {
    //   items:
    //    [ Pair {
    //        key: Scalar { value: 'YAML', range: [ 0, 4, 4 ] },
    //        value:
    //         YAMLSeq {
    //           items:
    //            [ Scalar {
    //                value: 'A human-readable data serialization language',
    //                range: [ 10, 54, 55 ] },
    //              Scalar {
    //                value: 'https://en.wikipedia.org/wiki/YAML',
    //                range: [ 59, 93, 94 ] } ],
    //           range: [ 8, 94, 94 ] } },
    //      Pair {
    //        key: Scalar { value: 'yaml', range: [ 94, 98, 98 ] },
    //        value:
    //         YAMLSeq {
    //           items:
    //            [ Scalar {
    //                value: 'A complete JavaScript implementation',
    //                range: [ 104, 140, 141 ] },
    //              Scalar {
    //                value: 'https://www.npmjs.com/package/yaml',
    //                range: [ 145, 180, 180 ] } ],
    //           range: [ 102, 180, 180 ] } } ],
    //   range: [ 0, 180, 180 ] }

These functions should never throw, provided that `str` is a string and the `options` are valid. Errors and warnings are included in the documents' `errors` and `warnings` arrays. In particular, if `errors` is not empty it's likely that the document's parsed `contents` are not entirely correct.

The `contents` of a parsed document will always consist of `Scalar`, `Map`, `Seq` or `null` values.

#### `parseDocument(str, options = {}): Document`

Parses a single `Document` from the input `str`; used internally by `parse`. Will include an error if `str` contains more than one document. See [Options](https://eemeli.org/yaml/#options) for more information on the second parameter.

#### `parseAllDocuments(str, options = {}): Document[]`

When parsing YAML, the input string `str` may consist of a stream of documents separated from each other by `...` document end marker lines. `parseAllDocuments` will return an array of `Document` objects that allow these documents to be parsed and manipulated with more control. See [Options](https://eemeli.org/yaml/#options) for more information on the second parameter.

## Creating Documents

#### `new Document(value, replacer?, options = {})`

Creates a new document. If `value` is defined, the document `contents` are initialised with that value, wrapped recursively in appropriate [content nodes](https://eemeli.org/yaml/#content-nodes). If `value` is `undefined`, the document's `contents` is initialised as `null`. If defined, a `replacer` may filter or modify the initial document contents, following the same algorithm as the [JSON implementation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter). See [Options](https://eemeli.org/yaml/#options) for more information on the last argument.

| Member | Type | Description |
| --- | --- | --- |
| commentBefore | `string?` | A comment at the very beginning of the document. If not empty, separated from the rest of the document by a blank line or the doc-start indicator when stringified. |
| comment | `string?` | A comment at the end of the document. If not empty, separated from the rest of the document by a blank line when stringified. |
| contents | [`Node`](https://eemeli.org/yaml/#content-nodes) `⎮ any` | The document contents. |
| directives | [`Directives`](https://eemeli.org/yaml/#stream-directives) | Controls for the `%YAML` and `%TAG` directives, as well as the doc-start marker `---`. |
| errors | [`Error[]`](https://eemeli.org/yaml/#errors) | Errors encountered during parsing. |
| schema | `Schema` | The schema used with the document. |
| warnings | [`Error[]`](https://eemeli.org/yaml/#errors) | Warnings encountered during parsing. |

    import { Document } from 'yaml'

    const doc = new Document(['some', 'values', { balloons: 99 }])
    doc.commentBefore = ' A commented document'

    String(doc)
    // # A commented document
    //
    // - some
    // - values
    // - balloons: 99

The Document members are all modifiable, though it's unlikely that you'll have reason to change `errors`, `schema` or `warnings`. In particular you may be interested in both reading and writing **`contents`**. Although `parseDocument()` and `parseAllDocuments()` will leave it with `YAMLMap`, `YAMLSeq`, `Scalar` or `null` contents, it can be set to anything.

## Document Methods

| Method | Returns | Description |
| --- | --- | --- |
| clone() | `Document` | Create a deep copy of this Document and its contents. Custom Node values that inherit from `Object` still refer to their original instances. |
| createAlias(node: Node, name?: string) | `Alias` | Create a new `Alias` node, adding the required anchor for `node`. If `name` is empty, a new anchor name will be generated. |
| createNode(value, options?) | `Node` | Recursively wrap any input with appropriate `Node` containers. See [Creating Nodes](https://eemeli.org/yaml/#creating-nodes) for more information. |
| createPair(key, value, options?) | `Pair` | Recursively wrap `key` and `value` into a `Pair` object. See [Creating Nodes](https://eemeli.org/yaml/#creating-nodes) for more information. |
| setSchema(version, options?) | `void` | Change the YAML version and schema used by the document. `version` must be either `'1.1'` or `'1.2'`; accepts all Schema options. |
| toJS(options?) | `any` | A plain JavaScript representation of the document `contents`. |
| toJSON() | `any` | A JSON representation of the document `contents`. |
| toString(options?) | `string` | A YAML representation of the document. |

    const doc = parseDocument('a: 1\nb: [2, 3]\n')
    doc.get('a') // 1
    doc.getIn([]) // YAMLMap { items: [Pair, Pair], ... }
    doc.hasIn(['b', 0]) // true
    doc.addIn(['b'], 4) // -> doc.get('b').items.length === 3
    doc.deleteIn(['b', 1]) // true
    doc.getIn(['b', 1]) // 4

In addition to the above, the document object also provides the same **accessor methods** as [collections](https://eemeli.org/yaml/#collections), based on the top-level collection: `add`, `delete`, `get`, `has`, and `set`, along with their deeper variants `addIn`, `deleteIn`, `getIn`, `hasIn`, and `setIn`. For the `*In` methods using an empty `path` value (i.e. `null`, `undefined`, or `[]`) will refer to the document's top-level `contents`.

#### `Document#toJS()`, `Document#toJSON()` and `Document#toString()`

    const src = '1969-07-21T02:56:15Z'
    const doc = parseDocument(src, { customTags: ['timestamp'] })

    doc.toJS()
    // Date { 1969-07-21T02:56:15.000Z }

    doc.toJSON()
    // '1969-07-21T02:56:15.000Z'

    String(doc)
    // '1969-07-21T02:56:15\n'

For a plain JavaScript representation of the document, **`toJS(options = {})`** is your friend. Its output may include `Map` and `Set` collections (e.g. if the `mapAsMap` option is true) and complex scalar values like `Date` for `!!timestamp`, but all YAML nodes will be resolved. See [Options](https://eemeli.org/yaml/#options) for more information on the optional parameter.

For a representation consisting only of JSON values, use **`toJSON()`**.

To stringify a document as YAML, use **`toString(options = {})`**. This will also be called by `String(doc)` (with no options). This method will throw if the `errors` array is not empty. See [Options](https://eemeli.org/yaml/#options) for more information on the optional parameter.

## Stream Directives

    const doc = new Document()
    doc.directives
    > {
        docStart: null, // set true to force the doc-start marker
        docEnd: false, // set true to force the doc-end marker
        tags: { '!!': 'tag:yaml.org,2002:' }, // Record<handle, prefix>
        yaml: { explicit: false, version: '1.2' }
      }

A YAML document may be preceded by `%YAML` and `%TAG` directives; their state is accessible via the `directives` member of a `Document`. After parsing or other creation, the contents of `doc.directives` are mutable, and will influence the YAML string representation of the document.

The contents of `doc.directives.tags` are used both for the `%TAG` directives and when stringifying tags within the document. Each of the handles must start and end with a `!` character; `!` is by default the local tag and `!!` is used for default tags. See the section on [custom tags](https://eemeli.org/yaml/#writing-custom-tags) for more on this topic.

`doc.contents.yaml` determines if an explicit `%YAML` directive should be included in the output, and what version it should use. If changing the version after the document's creation, you'll probably want to use `doc.setSchema()` as it will also update the schema accordingly.

# Content Nodes

After parsing, the `contents` value of each `YAML.Document` is the root of an [Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) of nodes representing the document (or `null` for an empty document).

Both scalar and collection values may have an `anchor` associated with them; this is rendered in the string representation with a `&` prefix, so e.g. in `foo: &aa bar`, the value `bar` has the anchor `aa`. Anchors are used by [Alias nodes](https://eemeli.org/yaml/#alias-nodes) to allow for the same value to be used in multiple places in the document. It is valid to have an anchor associated with a node even if it has no aliases.

## Scalar Values

    class NodeBase {
      comment?: string        // a comment on or immediately after this
      commentBefore?: string  // a comment before this
      range?: [number, number, number]
          // The `[start, value-end, node-end]` character offsets for the part
          // of the source parsed into this node (undefined if not parsed).
          // The `value-end` and `node-end` positions are themselves not
          // included in their respective ranges.
      spaceBefore?: boolean
          // a blank line before this node and its commentBefore
      tag?: string       // a fully qualified tag, if required
      clone(): NodeBase  // a copy of this node
      toJS(doc, options?): any // a plain JS representation of this node
      toJSON(): any      // a plain JSON representation of this node
    }

For scalar values, the `tag` will not be set unless it was explicitly defined in the source document; this also applies for unsupported tags that have been resolved using a fallback tag (string, `YAMLMap`, or `YAMLSeq`).

    class Scalar<T = unknown> extends NodeBase {
      anchor?: string  // an anchor associated with this node
      format?: 'BIN' | 'HEX' | 'OCT' | 'TIME' | undefined
          // By default (undefined), numbers use decimal notation.
          // The YAML 1.2 core schema only supports 'HEX' and 'OCT'.
      type?:
        'BLOCK_FOLDED' | 'BLOCK_LITERAL' | 'PLAIN' |
        'QUOTE_DOUBLE' | 'QUOTE_SINGLE' | undefined
      value: T
    }

A parsed document's contents will have all of its non-object values wrapped in `Scalar` objects, which themselves may be in some hierarchy of `YAMLMap` and `YAMLSeq` collections. However, this is not a requirement for the document's stringification, which is rather tolerant regarding its input values, and will use [`doc.createNode()`](https://eemeli.org/yaml/#creating-nodes) when encountering an unwrapped value.

When stringifying, the node `type` will be taken into account by `!!str` and `!!binary` values, and ignored by other scalars. On the other hand, `!!int` and `!!float` stringifiers will take `format` into account.

## Collections

    class Pair<K = unknown, V = unknown> {
      key: K    // When parsed, key and value are always
      value: V  // Node or null, but can be set to anything
    }

    class Collection extends NodeBase {
      anchor?: string  // an anchor associated with this node
      flow?: boolean   // use flow style when stringifying this
      schema?: Schema
      addIn(path: Iterable<unknown>, value: unknown): void
      clone(schema?: Schema): NodeBase  // a deep copy of this collection
      deleteIn(path: Iterable<unknown>): boolean
      getIn(path: Iterable<unknown>, keepScalar?: boolean): unknown
      hasIn(path: Iterable<unknown>): boolean
      setIn(path: Iterable<unknown>, value: unknown): void
    }

    class YAMLMap<K = unknown, V = unknown> extends Collection {
      items: Pair<K, V>[]
      add(pair: Pair<K, V> | { key: K; value: V }, overwrite?: boolean): void
      delete(key: K): boolean
      get(key: K, keepScalar?: boolean): unknown
      has(key: K): boolean
      set(key: K, value: V): void
    }

    class YAMLSeq<T = unknown> extends Collection {
      items: T[]
      add(value: T): void
      delete(key: number | Scalar<number>): boolean
      get(key: number | Scalar<number>, keepScalar?: boolean): unknown
      has(key: number | Scalar<number>): boolean
      set(key: number | Scalar<number>, value: T): void
    }

Within all YAML documents, two forms of collections are supported: sequential `YAMLSeq` collections and key-value `YAMLMap` collections. The JavaScript representations of these collections both have an `items` array, which may (`YAMLSeq`) or must (`YAMLMap`) consist of `Pair` objects that contain a `key` and a `value` of any type, including `null`. The `items` array of a `YAMLSeq` object may contain values of any type.

When stringifying collections, by default block notation will be used. Flow notation will be selected if `flow` is `true`, the collection is within a surrounding flow collection, or if the collection is in an implicit key.

The `yaml-1.1` schema includes [additional collections](https://yaml.org/type/index.html) that are based on `YAMLMap` and `YAMLSeq`: `OMap` and `Pairs` are sequences of `Pair` objects (`OMap` requires unique keys & corresponds to the JS Map object), and `Set` is a map of keys with null values that corresponds to the JS Set object.

All of the collections provide the following accessor methods:

| Method | Returns | Description |
| --- | --- | --- |
| add(value), addIn(path, value) | `void` | Adds a value to the collection. For `!!map` and `!!omap` the value must be a Pair instance or a `{ key, value }` object, which may not have a key that already exists in the map. |
| delete(key), deleteIn(path) | `boolean` | Removes a value from the collection. Returns `true` if the item was found and removed. |
| get(key, [keep]), getIn(path, [keep]) | `any` | Returns value at `key`, or `undefined` if not found. By default unwraps scalar values from their surrounding node; to disable set `keep` to `true` (collections are always returned intact). |
| has(key), hasIn(path) | `boolean` | Checks if the collection includes a value with the key `key`. |
| set(key, value), setIn(path, value) | `any` | Sets a value in this collection. For `!!set`, `value` needs to be a boolean to add/remove the item from the set. When overwriting a `Scalar` value with a scalar, the original node is retained. |

    const doc = new YAML.Document({ a: 1, b: [2, 3] }) // { a: 1, b: [ 2, 3 ] }
    doc.add({ key: 'c', value: 4 }) // { a: 1, b: [ 2, 3 ], c: 4 }
    doc.addIn(['b'], 5)             // { a: 1, b: [ 2, 3, 5 ], c: 4 }
    doc.set('c', 42)                // { a: 1, b: [ 2, 3, 5 ], c: 42 }
    doc.setIn(['c', 'x']) // Error: Expected YAML collection at c. Remaining path: x
    doc.delete('c')                 // { a: 1, b: [ 2, 3, 5 ] }
    doc.deleteIn(['b', 1])          // { a: 1, b: [ 2, 5 ] }

    doc.get('a') // 1
    doc.get('a', true) // Scalar { value: 1 }
    doc.getIn(['b', 1]) // 5
    doc.has(doc.createNode('a')) // true
    doc.has('c') // false
    doc.hasIn(['b', '0']) // true

For all of these methods, the keys may be nodes or their wrapped scalar values (i.e. `42` will match `Scalar { value: 42 }`). Keys for `!!seq` should be positive integers, or their string representations. `add()` and `set()` do not automatically call `doc.createNode()` to wrap the value.

Each of the methods also has a variant that requires an iterable as the first parameter, and allows fetching or modifying deeper collections. If any intermediate node in `path` is a scalar rather than a collection, an error will be thrown. If any of the intermediate collections is not found:

- `getIn` and `hasIn` will return `undefined` or `false` (respectively)
- `addIn` and `setIn` will create missing collections; non-negative integer keys will create sequences, all other keys create maps
- `deleteIn` will throw an error

Note that for `addIn` the path argument points to the collection rather than the item; for maps its `value` should be a `Pair` or an object with `{ key, value }` fields.

## Alias Nodes

    class Alias extends NodeBase {
      source: string
      resolve(doc: Document): Scalar | YAMLMap | YAMLSeq | undefined
    }

    const obj = YAML.parse('[ &x { X: 42 }, Y, *x ]')
      // => [ { X: 42 }, 'Y', { X: 42 } ]
    obj[2].Z = 13
      // => [ { X: 42, Z: 13 }, 'Y', { X: 42, Z: 13 } ]
    YAML.stringify(obj)
      // - &a1
      //   X: 42
      //   Z: 13
      // - Y
      // - *a1

`Alias` nodes provide a way to include a single node in multiple places in a document; the `source` of an alias node must be a preceding anchor in the document. Circular references are fully supported, and where possible the JS representation of alias nodes will be the actual source object. For ease of use, alias nodes also provide a `resolve(doc)` method to dereference its source node.

When nodes are constructed from JS structures (e.g. during `YAML.stringify()`), multiple references to the same object will result in including an autogenerated anchor at its first instance, and alias nodes to that anchor at later references.

## Creating Nodes

    const doc = new YAML.Document(['some', 'values'])
    // Document {
    //   contents:
    //     YAMLSeq {
    //       items:
    //        [ Scalar { value: 'some' },
    //          Scalar { value: 'values' } ] } }

    const map = doc.createNode({ balloons: 99 })
    // YAMLMap {
    //   items:
    //    [ Pair {
    //        key: Scalar { value: 'balloons' },
    //        value: Scalar { value: 99 } } ] }

    doc.add(map)
    doc.get(0, true).comment = ' A commented item'
    String(doc)
    // - some # A commented item
    // - values
    // - balloons: 99

#### `doc.createNode(value, replacer?, options?): Node`

To create a new node, use the `createNode(value, options?)` document method. This will recursively wrap any input with appropriate `Node` containers. Generic JS `Object` values as well as `Map` and its descendants become mappings, while arrays and other iterable objects result in sequences. With `Object`, entries that have an `undefined` value are dropped.

If `value` is already a `Node` instance, it will be directly returned. To create a copy of a node, use instead the `node.clone()` method. For collections, the method accepts a single `Schema` argument, which allows overwriting the original's `schema` value.

Use a `replacer` to apply a replacer array or function, following the [JSON implementation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter). To force flow styling on a collection, use the `flow: true` option. For all available options, see the [CreateNode Options](https://eemeli.org/yaml/#createnode-options) section.

The primary purpose of this method is to enable attaching comments or other metadata to a value, or to otherwise exert more fine-grained control over the stringified output. To that end, you'll need to assign its return value to the `contents` of a document (or somewhere within said contents), as the document's schema is required for YAML string output. If you're not interested in working with such metadata, document `contents` may also include non-`Node` values at any level.

#### `doc.createAlias(node, name?): Alias`

    const alias = doc.createAlias(doc.get(1, true), 'foo')
    doc.add(alias)
    String(doc)
    // - some # A commented item
    // - &foo values
    // - balloons: 99
    // - *foo

Create a new `Alias` node, ensuring that the target `node` has the required anchor. If `node` already has an anchor, `name` is ignored. Otherwise, the `node.anchor` value will be set to `name`, or if an anchor with that name is already present in the document, `name` will be used as a prefix for a new unique anchor. If `name` is undefined, the generated anchor will use 'a' as a prefix.

You should make sure to only add alias nodes to the document after the nodes to which they refer, or the document's YAML stringification will fail.

#### `new YAMLMap(), new YAMLSeq(), doc.createPair(key, value): Pair`

    import { Document, YAMLSeq } from 'yaml'

    const doc = new Document(new YAMLSeq())
    doc.contents.items = [
      'some values',
      42,
      { including: 'objects', 3: 'a string' }
    ]
    doc.add(doc.createPair(1, 'a number'))

    doc.toString()
    // - some values
    // - 42
    // - "3": a string
    //   including: objects
    // - 1: a number

To construct a `YAMLSeq` or `YAMLMap`, use `new Document()` or `doc.createNode()` with array, object or iterable input, or create the collections directly by importing the classes from `yaml`.

Once created, normal array operations may be used to modify the `items` array. New `Pair` objects may created either by importing the class from `yaml` and using its `new Pair(key, value)` constructor, or by using the `doc.createPair(key, value, options?)` method. The latter will recursively wrap the `key` and `value` as nodes, and accepts the same options as `doc.createNode()`

## Finding and Modifying Nodes

    const doc = YAML.parseDocument(`
      - some values
      - 42
      - "3": a string
        including: objects
      - 1: a number
    `)

    const obs = doc.getIn([2, 'including'], true)
    obs.type = 'QUOTE_DOUBLE'

    YAML.visit(doc, {
      Pair(_, pair) {
        if (pair.key && pair.key.value === '3') return YAML.visit.REMOVE
      },
      Scalar(key, node) {
        if (
          key !== 'key' &&
          typeof node.value === 'string' &&
          node.type === 'PLAIN'
        ) {
          node.type = 'QUOTE_SINGLE'
        }
      }
    })

    String(doc)
    // - 'some values'
    // - 42
    // - including: "objects"
    // - 1: 'a number'

In general, it's safe to modify nodes manually, e.g. splicing the `items` array of a `YAMLMap` or setting its `flow` value to `true`. For operations on nodes at a known location in the tree, it's probably easiest to use `doc.getIn(path, true)` to access them. For more complex or general operations, a visitor API is provided:

#### `YAML.visit(node, visitor): void`

Apply a visitor to an AST node or document.

Walks through the tree (depth-first) starting from `node`, calling a `visitor` function with three arguments:

- `key`: For sequence values and map `Pair`, the node's index in the collection. Within a `Pair`, `'key'` or `'value'`, correspondingly. `null` for the root node.
- `node`: The current node.
- `path`: The ancestry of the current node.

The return value of the visitor may be used to control the traversal:

- `undefined` (default): Do nothing and continue
- `YAML.visit.SKIP`: Do not visit the children of this node, continue with next sibling
- `YAML.visit.BREAK`: Terminate traversal completely
- `YAML.visit.REMOVE`: Remove the current node, then continue with the next one
- `Node`: Replace the current node, then continue by visiting it
- `number`: While iterating the items of a sequence or map, set the index of the next step. This is useful especially if the index of the current node has changed.

If `visitor` is a single function, it will be called with all values encountered in the tree, including e.g. `null` values. Alternatively, separate visitor functions may be defined for each `Map`, `Pair`, `Seq`, `Alias` and `Scalar` node. To define the same visitor function for more than one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar) and `Node` (alias, map, seq & scalar) targets. Of all these, only the most specific defined one will be used for each node.

#### `YAML.visitAsync(node, visitor): Promise<void>`

The same as `visit()`, but allows for visitor functions that return a promise which resolves to one of the above-defined control values.

## Identifying Node Types

    import {
      isAlias,
      isCollection, // map or seq
      isDocument,
      isMap,
      isNode, // alias, scalar, map or seq
      isPair,
      isScalar,
      isSeq
    } from 'yaml'

    const doc = new Document({ foo: [13, 42] })
    isDocument(doc) === true
    isNode(doc) === false
    isMap(doc.contents) === true
    isNode(doc.contents) === true
    isPair(doc.contents.items[0]) === true
    isCollection(doc.get('foo')) === true
    isScalar(doc.getIn(['foo', 1])) === true

#### `isAlias(x: unknown): boolean`

#### `isCollection(x: unknown): boolean`

#### `isDocument(x: unknown): boolean`

#### `isMap(x: unknown): boolean`

#### `isNode(x: unknown): boolean`

#### `isPair(x: unknown): boolean`

#### `isScalar(x: unknown): boolean`

#### `isSeq(x: unknown): boolean`

To find out what you've got, a family of custom type guard functions is provided. These should be preferred over other methods such as `instanceof` checks, as they'll work even if the nodes have been created by a different instance of the library.

Internally, node identification uses property symbols that are set on instances during their construction.

## Comments and Blank Lines

    const doc = YAML.parseDocument(`
    # This is YAML.
    ---
    it has:

      - an array

      - of values
    `)

    doc.toJS() // { 'it has': [ 'an array', 'of values' ] }
    doc.commentBefore // ' This is YAML.'

    const seq = doc.get('it has')
    seq.spaceBefore // true

    seq.items[0].comment = ' item comment'
    seq.comment = ' collection end comment'

    doc.toString()
    // # This is YAML.
    //
    // it has:
    //
    //   - an array # item comment
    //
    //   - of values
    //   # collection end comment

A primary differentiator between this and other YAML libraries is the ability to programmatically handle comments, which according to [the spec](http://yaml.org/spec/1.2/spec.html#id2767100) "must not have any effect on the serialization tree or representation graph. In particular, comments are not associated with a particular node." Similarly to comments, the YAML spec instructs non-content blank lines to be discarded.

This library _does_ allow comments and blank lines to be handled programmatically, and does attach them to particular nodes (most often, the following node). Each `Scalar`, `Map`, `Seq` and the `Document` itself has `comment`, `commentBefore` members that may be set to a stringifiable value, and a `spaceBefore` boolean to add an empty line before the comment.

The string contents of comments are not processed by the library, except for merging adjacent comment and blank lines together. Document comments will be separated from the rest of the document by a blank line. In the node member values, comment lines terminating with the `#` indicator are represented by a single space, while completely empty lines are represented as empty strings.

Scalar block values with "keep" chomping (i.e. with `+` in their header) consider any trailing empty lines to be a part of their content, so the following node's `spaceBefore` or `commentBefore` with leading whitespace is ignored.

**Note** : Due to implementation details, the library's comment handling is not completely stable, in particular for trailing comments. When creating, writing, and then reading a YAML file, comments may sometimes be associated with a different node.

# Custom Data Types

    import { parse, parseDocument } from 'yaml'

    parse('2001-12-15 2:59:43')
    // '2001-12-15 2:59:43'

    parse('!!timestamp 2001-12-15 2:59:43')
    // 2001-12-15T02:59:43.000Z (Date instance)

    const doc = parseDocument('2001-12-15 2:59:43', { customTags: ['timestamp'] })
    doc.contents.value.toDateString()
    // 'Sat Dec 15 2001'

The easiest way to extend a [schema](https://eemeli.org/yaml/#data-schemas) is by defining the additional **tags** that you wish to support. To do that, the `customTags` option allows you to provide an array of custom tag objects or tag identifiers. In particular, the built-in tags that are a part of the `core` and `yaml-1.1` schemas may be referred to by their string identifiers. For those tags that are available in both, only the `core` variant is provided as a custom tag.

For further customisation, `customTags` may also be a function `(Tag[]) => (Tag[])` that may modify the schema's base tag array.

Some additional data types are available separately via the [`yaml-types`](https://github.com/eemeli/yaml-types) package, including support for:

- BigInt values
- Error objects
- Objects with a null prototype
- RegExp values
- Symbols

## Built-in Custom Tags

    parse('[ one, true, 42 ]')
    // [ 'one', true, 42 ]

    parse('[ one, true, 42 ]', { schema: 'failsafe' })
    // [ 'one', 'true', '42' ]

    parse('[ one, true, 42 ]', { schema: 'failsafe', customTags: ['int'] })
    // [ 'one', 'true', 42 ]

### YAML 1.2 Core Schema

These tags are a part of the YAML 1.2 [Core Schema](https://yaml.org/spec/1.2/spec.html#id2804923), and may be useful when constructing a parser or stringifier for a more limited set of types, based on the `failsafe` schema. Some of these define a `format` value; this will be added to the parsed nodes and affects the node's stringification.

If including more than one custom tag from this set, make sure that the `'float'` and `'int'` tags precede any of the other `!!float` and `!!int` tags.

| Identifier | Regular expression | YAML Type | Format | Example values |
| --- | --- | --- | --- | --- |
| `'bool'` | `true⎮True⎮TRUE⎮false⎮False⎮FALSE` | `!!bool` |  | `true`, `false` |
| `'float'` | `[-+]?(0⎮[1-9][0-9]*)\.[0-9]*` | `!!float` |  | `4.2`, `-0.0` |
| `'floatExp'` | `[-+]?(0⎮[1-9][0-9]*)(\.[0-9]*)?[eE][-+]?[0-9]+` | `!!float` | `'EXP'` | `4.2e9` |
| `'floatNaN'` | `[-+]?(\.inf⎮\.Inf⎮\.INF)⎮\.nan⎮\.NaN⎮\.NAN` | `!!float` |  | `-Infinity` |
| `'int'` | `[-+]?[0-9]+` | `!!int` |  | `42`, `-0` |
| `'intHex'` | `0x[0-9a-fA-F]+` | `!!int` | `'HEX'` | `0xff0033` |
| `'intOct'` | `0o[0-7]+` | `!!int` | `'OCT'` | `0o127` |
| `'null'` | `~⎮null⎮Null⎮NULL` | `!!null` |  | `null` |

### YAML 1.1

These tags are a part of the YAML 1.1 [language-independent types](https://yaml.org/type/), but are not a part of any default YAML 1.2 schema.

| Identifier | YAML Type | JS Type | Description |
| --- | --- | --- | --- |
| `'binary'` | [`!!binary`](https://yaml.org/type/binary.html) | `Uint8Array` | Binary data, represented in YAML as base64 encoded characters. |
| `'floatTime'` | [`!!float`](https://yaml.org/type/float.html) | `Number` | Sexagesimal floating-point number format, e.g. `190:20:30.15`. To stringify with this tag, the node `format` must be `'TIME'`. |
| `'intTime'` | [`!!int`](https://yaml.org/type/int.html) | `Number` | Sexagesimal integer number format, e.g. `190:20:30`. To stringify with this tag, the node `format` must be `'TIME'`. |
| `'merge'` | [`!!merge`](https://yaml.org/type/merge.html) | `Symbol('<<')` | A `<<` merge key which allows one or more mappings to be merged with the current one. |
| `'omap'` | [`!!omap`](https://yaml.org/type/omap.html) | `Map` | Ordered sequence of key: value pairs without duplicates. Using `mapAsMap: true` together with this tag is not recommended, as it makes the parse → stringify loop non-idempotent. |
| `'pairs'` | [`!!pairs`](https://yaml.org/type/pairs.html) | `Array` | Ordered sequence of key: value pairs allowing duplicates. To create from JS, use `doc.createNode(array, { tag: '!!pairs' })`. |
| `'set'` | [`!!set`](https://yaml.org/type/set.html) | `Set` | Unordered set of non-equal values. |
| `'timestamp'` | [`!!timestamp`](https://yaml.org/type/timestamp.html) | `Date` | A point in time, e.g. `2001-12-15T02:59:43`. |

## Writing Custom Tags

    import { YAMLMap, stringify } from 'yaml'
    import { stringifyString } from 'yaml/util'

    const regexp = {
      identify: value => value instanceof RegExp,
      tag: '!re',
      resolve(str) {
        const match = str.match(/^\/([\s\S]+)\/([gimuy]*)$/)
        if (!match) throw new Error('Invalid !re value')
        return new RegExp(match[1], match[2])
      }
    }

    const sharedSymbol = {
      identify: value => value?.constructor === Symbol,
      tag: '!symbol/shared',
      resolve: str => Symbol.for(str),
      stringify(item, ctx, onComment, onChompKeep) {
        const key = Symbol.keyFor(item.value)
        if (key === undefined) throw new Error('Only shared symbols are supported')
        return stringifyString({ value: key }, ctx, onComment, onChompKeep)
      }
    }

    class YAMLNullObject extends YAMLMap {
      tag = '!nullobject'
      toJSON(_, ctx) {
        const obj = super.toJSON(_, { ...ctx, mapAsMap: false }, Object)
        return Object.assign(Object.create(null), obj)
      }
    }

    const nullObject = {
      tag: '!nullobject',
      collection: 'map',
      nodeClass: YAMLNullObject,
      identify: v => !!(typeof v === 'object' && v && !Object.getPrototypeOf(v))
    }

    // slightly more complicated object type
    class YAMLError extends YAMLMap {
      tag = '!error'
      toJSON(_, ctx) {
        const { name, message, stack, ...rest } = super.toJSON(
          _,
          { ...ctx, mapAsMap: false },
          Object
        )
        // craft the appropriate error type
        const Cls =
          name === 'EvalError'
            ? EvalError
            : name === 'RangeError'
              ? RangeError
              : name === 'ReferenceError'
                ? ReferenceError
                : name === 'SyntaxError'
                  ? SyntaxError
                  : name === 'TypeError'
                    ? TypeError
                    : name === 'URIError'
                      ? URIError
                      : Error
        if (Cls.name !== name) {
          Object.defineProperty(er, 'name', {
            value: name,
            enumerable: false,
            configurable: true
          })
        }
        Object.defineProperty(er, 'stack', {
          value: stack,
          enumerable: false,
          configurable: true
        })
        return Object.assign(er, rest)
      }

      static from(schema, obj, ctx) {
        const { name, message, stack } = obj
        // ensure these props remain, even if not enumerable
        return super.from(schema, { ...obj, name, message, stack }, ctx)
      }
    }

    const error = {
      tag: '!error',
      collection: 'map',
      nodeClass: YAMLError,
      identify: v => !!(typeof v === 'object' && v && v instanceof Error)
    }

    stringify(
      {
        regexp: /foo/gi,
        symbol: Symbol.for('bar'),
        nullobj: Object.assign(Object.create(null), { a: 1, b: 2 }),
        error: new Error('This was an error')
      },
      { customTags: [regexp, sharedSymbol, nullObject, error] }
    )
    // regexp: !re /foo/gi
    // symbol: !symbol/shared bar
    // nullobj: !nullobject
    //   a: 1
    //   b: 2
    // error: !error
    //   name: Error
    //   message: 'This was an error'
    //   stack: |
    //     at some-file.js:1:3

In YAML-speak, a custom data type is represented by a _tag_. To define your own tag, you need to account for the ways that your data is both parsed and stringified. Furthermore, both of those processes are split into two stages by the intermediate AST node structure.

If you wish to implement your own custom tags, the [`!!binary`](https://github.com/eemeli/yaml/blob/main/src/schema/yaml-1.1/binary.ts) and [`!!set`](https://github.com/eemeli/yaml/blob/main/src/schema/yaml-1.1/set.ts) tags as well as the [`yaml-types`](https://github.com/eemeli/yaml-types) package provide relatively cohesive examples to study in addition to the simple examples in the sidebar here.

Custom collection types (ie, Maps, Sets, objects, and arrays; anything with child properties that may not be propertly serialized to a scalar value) may provide a `nodeClass` property that extends the [`YAMLMap`](https://github.com/eemeli/yaml/blob/main/src/nodes/YAMLMap.ts) and [`YAMLSeq`](https://github.com/eemeli/yaml/blob/main/src/nodes/YAMLSeq.ts) classes, which will be used for parsing and stringifying objects with the specified tag.

### Parsing Custom Data

At the lowest level, the [`Lexer`](https://eemeli.org/yaml/#lexer) and [`Parser`](https://eemeli.org/yaml/#parser) will take care of turning string input into a concrete syntax tree (CST). In the CST all scalar values are available as strings, and maps & sequences as collections of nodes. Each schema includes a set of default data types, which handle converting at least strings, maps and sequences into their AST nodes. These are considered to have _implicit_ tags, and are autodetected. Custom tags, on the other hand, should almost always define an _explicit_ `tag` with which their value will be prefixed. This may be application-specific local `!tag`, a shorthand `!ns!tag`, or a verbatim `!<tag:example.com,2019:tag>`.

Once identified by matching the `tag`, the `resolve(value, onError): Node | any` function will turn a parsed value into an AST node. `value` may be either a `string`, a `YAMLMap` or a `YAMLSeq`, depending on the node's shape. A custom tag should verify that value is of its expected type.

Note that during the CST -> AST composition, the anchors and comments attached to each node are also resolved for each node. This metadata will unfortunately be lost when converting the values to JS objects, so collections should have values that extend one of the existing collection classes. Collections should therefore either fall back to their parent classes' `toJSON()` methods, or define their own in order to allow their contents to be expressed as the appropriate JS object.

### Creating Nodes and Stringifying Custom Data

As with parsing, turning input data into its YAML string representation is a two-stage process as the input is first turned into an AST tree before stringifying it. This allows for metadata and comments to be attached to each node, and for e.g. circular references to be resolved. For scalar values, this means just wrapping the value within a `Scalar` class while keeping it unchanged.

As values may be wrapped within objects and arrays, `doc.createNode()` uses each tag's `identify(value): boolean` function to detect custom data types. For the same reason, collections need to define their own `createNode(schema, value, ctx): Collection` functions that may recursively construct their equivalent collection class instances.

Finally, `stringify(item, ctx, ...): string` defines how your data should be represented as a YAML string, in case the default stringifiers aren't enough. For collections in particular, the default stringifier should be perfectly sufficient. `'yaml/util'` exports `stringifyNumber(item)` and `stringifyString(item, ctx, ...)`, which may be of use for custom scalar data.

### Custom Tag API

    import {
      createNode, // (value, tagName, ctx) => Node -- Create a new node
      createPair, // (key, value, ctx) => Pair -- Create a new pair
      debug, // (logLevel, ...messages) => void -- Log debug messages to console
      findPair, // (items, key) => Pair? -- Given a key, find a matching Pair
      foldFlowLines, // (text, indent, mode, options) => string -- Fold long lines
      mapTag, // CollectionTag
      seqTag, // CollectionTag
      stringTag, // ScalarTag
      stringifyNumber, // (node) => string
      stringifyString, // (node, ctx, ...) => string
      toJS, // (value, arg, ctx) => any -- Recursively convert to plain JS
      warn // (logLevel, warning) => void -- Emit a warning
    } from 'yaml/util'

To define your own tag, you'll need to define an object comprising of some of the following fields. Those in bold are required:

- `createNode(schema, value, ctx): Node` is an optional factory function, used e.g. by collections when wrapping JS objects as AST nodes.
- `format: string` If a tag has multiple forms that should be parsed and/or stringified differently, use `format` to identify them. Used by `!!int` and `!!float`.
- **`identify(value): boolean`** is used by `doc.createNode()` to detect your data type, e.g. using `typeof` or `instanceof`. Required.
- `nodeClass: Node` is the `Node` child class that implements this tag. Required for collections and tags that have overlapping JS representations.
- **`resolve(value, onError): Node | any`** turns a parsed value into an AST node; `value` is either a `string`, a `YAMLMap` or a `YAMLSeq`. `onError(msg)` should be called with an error message string when encountering errors, as it'll allow you to still return some value for the node. If returning a non-`Node` value, the output will be wrapped as a `Scalar`. Required.
- `stringify(item, ctx, onComment, onChompKeep): string` is an optional function stringifying the `item` AST node in the current context `ctx`. `onComment` and `onChompKeep` are callback functions for a couple of special cases. If your data includes a suitable `.toString()` method, you can probably leave this undefined and use the default stringifier.
- **`tag: string`** is the identifier for your data type, with which its stringified form will be prefixed. Should either be a !-prefixed local `!tag`, or a fully qualified `tag:domain,date:foo`. Required.
- `test: RegExp` and `default: boolean` allow for values to be stringified without an explicit tag and detected using a regular expression. For most cases, it's unlikely that you'll actually want to use these, even if you first think you do.

# Parsing YAML

    import {
      Composer,
      CST,
      Lexer,
      LineCounter,
      Parser,
    } from 'yaml'

If you're interested only in the final output, [`parse()`](https://eemeli.org/yaml/#yaml-parse) will directly produce native JavaScript If you'd like to retain the comments and other metadata, [`parseDocument()` and `parseAllDocuments()`](https://eemeli.org/yaml/#parsing-documents) will produce Document instances that allow for further processing. If you're looking to do something more specific, this section might be for you.

Internally, the process of turning a sequence of characters into Documents relies on three stages, each of which is also exposed to external users. First, the [Lexer](https://eemeli.org/yaml/#lexer) splits the character stream into lexical tokens, i.e. sequences of characters and control codes. Next, the [Parser](https://eemeli.org/yaml/#parser) builds concrete syntax tree representations of each document and directive in the stream. Finally, the [Composer](https://eemeli.org/yaml/#composer) builds a more user-friendly and accessible [Document](https://eemeli.org/yaml/#documents) representation of each document.

Both the Lexer and Parser accept incomplete input, allowing for them and the Composer to be used with e.g. [Node.js streams](https://nodejs.org/api/stream.html) or other systems that handle data in chunks.

## Lexer

    import { Lexer } from 'yaml'

    const tokens = new Lexer().lex('foo: bar\nfee:\n  [24,"42"]\n')
    console.dir(Array.from(tokens))
    > [
        '\x02', '\x1F', 'foo',  ':',
        '',    '\x1F', 'bar',  '\n',
        '\x1F', 'fee',  ':',    '\n',
        '',   '[',    '\x1F', '24',
        ',',    '"42"', ']',    '\n'
      ]

#### `new Lexer()`

#### `lexer.lex(src: string, incomplete?: boolean): Generator<string>`

The API for the lexer is rather minimal, and offers no configuration. If the input stream is chunked, the `lex()` method may be called separately for each chunk if the `incomplete` argument is `true`. At the end of input, `lex()` should be called a final time with `incomplete: false` to ensure that the remaining tokens are emitted.

Internally, the lexer operates a state machine that determines how it parses its input. Initially, the lexer is always in the `stream` state. The lexer constructor and its `lex()` method should never throw an error.

All tokens are identifiable either by their exact value or their first character. In addition to slices of the input stream, a few control characters are additionally used within the output.

| Value | Token | Meaning |
| --- | --- | --- |
| `\x02` | doc-mode | Start of a document within the default stream context. |
| `\x18` | flow-error-end | Unexpected end of a flow collection, e.g. due to an unindent. Should be considered an error. |
| `\x1f` | scalar | The next token after this one is a scalar value, irrespective of its value or first character. |
| `\n`, `\r\n` | newline | In certain cases (such as end of input), an empty string may also be emitted; it should also be considered as a newline. |
| `---` | doc-start | Explicit marker for the start of a document. Will be preceded by a doc-mode token. |
| `...` | doc-end | Explicit marker for the end of a document. |
| `-` | seq-item-ind | Block sequence item indicator, separated by whitespace. |
| `?` | explicit-key-ind | Explicit block map key indicator, separated by whitespace. |
| `:` | map-value-ind | Block map value indicator. |
| `{` | flow-map-start |
| `}` | flow-map-end |
| `[` | flow-seq-start |
| `]` | flow-seq-end |
| `,` | comma | Separator between flow collection items. |
| `\u{FEFF}` | byte-order-mark | Treated as whitespace in stream & content in a document. |

If any of the control characters do show up directly in the input stream, they will be treated normally, and even when bare will be preceded by a SCALAR control token in the output.

All remaining tokens are identifiable by their first character:

| First char | Token | Meaning |
| --- | --- | --- |
| ``, `\t` | space | Only contains space characters if token indicates indentation. Otherwise may contain repeats of either character. |
| `#` | comment | Separated from preceding by whitespace. Does not include the trailing newline. |
| `%` | directive-line | Only produced in a stream context. |
| `*` | alias |
| `&` | anchor |
| `!` | tag |
| `'` | single-quoted-scalar | Should also include `'` as a last character, if input is valid. |
| `"` | double-quoted-scalar | Should also include `"` as a last character, if input is valid. |
| `⎮`, `>` | block-scalar-header | Expected to be followed by optional whitespace & comment, a newline, and then a scalar value. |

## Parser

    import { Parser } from 'yaml'

    for (const token of new Parser().parse('foo: [24,"42"]\n'))
      console.dir(token, { depth: null })

    > {
        type: 'document',
        offset: 0,
        start: [],
        value: {
          type: 'block-map',
          offset: 0,
          indent: 0,
          items: [
            {
              start: [],
              key: { type: 'scalar', offset: 0, indent: 0, source: 'foo' },
              sep: [
                { type: 'map-value-ind', offset: 3, indent: 0, source: ':' },
                { type: 'space', offset: 4, indent: 0, source: '' }
              ],
              value: {
                type: 'flow-collection',
                offset: 5,
                indent: 0,
                start: { type: 'flow-seq-start', offset: 5, indent: 0, source: '[' },
                items: [
                  { type: 'scalar', offset: 6, indent: 0, source: '24' },
                  { type: 'comma', offset: 8, indent: 0, source: ',' },
                  {
                    type: 'double-quoted-scalar',
                    offset: 9,
                    indent: 0,
                    source: '"42"'
                  }
                ],
                end: [
                  { type: 'flow-seq-end', offset: 13, indent: 0, source: ']' },
                  { type: 'newline', offset: 14, indent: 0, source: '\n' }
                ]
              }
            }
          ]
        }
      }

The parser by default uses an internal Lexer instance, and provides a similarly minimal API for producing a [Concrete Syntax Tree](https://en.wikipedia.org/wiki/Concrete_syntax_tree) representation of the input stream.

The tokens emitted by the parser are JavaScript objects, each of which has a `type` value that's one of the following: `directive-line`, `document`, `byte-order-mark`, `space`, `comment`, `newline`. Of these, only `directive-line` and `document` should be considered as content.

The parser does not validate its output, trying instead to produce a most YAML-ish representation of any input. It should never throw errors, but may (rarely) include error tokens in its output.

To validate a CST, you will need to compose it into a `Document`. If the document contains errors, they will be included in the document's `errors` array, and each error will will contain an `offset` within the source string, which you may then use to find the corresponding node in the CST.

#### `new Parser(onNewLine?: (offset: number) => void)`

Create a new parser. If defined, `onNewLine` is called separately with the start position of each new line (in `parse()`, including the start of input).

#### `parser.parse(source: string, incomplete = false): Generator<Token, void>`

Parse `source` as a YAML stream, generating tokens for each directive, document and other structure as it is completely parsed. If `incomplete`, a part of the last line may be left as a buffer for the next call.

Errors are not thrown, but are yielded as `{ type: 'error', offset, message }` tokens.

#### `parser.next(lexToken: string): Generator<Token, void>`

Advance the parser by one lexical token. Used internally by `parser.parse()`; exposed to allow for use with an external lexer.

For debug purposes, if the `LOG_TOKENS` env var is true-ish, all lexical tokens will be pretty-printed using `console.log()` as they are being processed.

### CST Nodes

For a complete description of CST node interfaces, please consult the [cst.ts source](https://github.com/eemeli/yaml/blob/main/src/parse/cst.ts).

Some of the most common node properties include:

| Property | Type | Description |
| --- | --- | --- |
| `type` | `string` | The only node property that's always defined. Identifies the node type. May be used as a TS type guard. |
| `offset` | `number` | The start index within the source string or character stream. |
| `source` | `string` | A raw string representation of the node's value, including all newlines and indentation. |
| `indent` | `number` | The indent level of the current line; mostly just for internal use. |
| `items` | `Item[]` | The contents of a collection; exact shape depends on the collection type. |
| `start`, `sep`, `end` | `SourceToken[]` | Content before, within, and after "actual" values. Includes item and collection indicators, anchors, tags, comments, as well as other things. |

Collection items contain some subset of the following properties:

| Item property | Type | Description |
| --- | --- | --- |
| `start` | `SourceToken[]` | Always defined. Content before the actual value. May include comments that are later assigned to the preceding item. |
| `key` | `Token ⎮ null` | Set for key/value pairs only, so never used in block sequences. |
| `sep` | `SourceToken[]` | Content between the key and the value. If defined, indicates that the `key` logically exists, even if its value is `null`. |
| `value` | `Token ⎮ null` | The value. Normally set, but may be left out for e.g. explicit keys with no matching value. |

### Counting Lines

    import { LineCounter, Parser } from 'yaml'

    const lineCounter = new LineCounter()
    const parser = new Parser(lineCounter.addNewLine))
    const tokens = parser.parse('foo:\n- 24\n- "42"\n')
    Array.from(tokens) // forces iteration

    lineCounter.lineStarts
    > [ 0, 5, 10, 17 ]
    lineCounter.linePos(3)
    > { line: 1, col: 4 }
    lineCounter.linePos(5)
    > { line: 2, col: 1 }

#### `new LineCounter()`

Tracks newlines during parsing in order to provide an efficient API for determining the one-indexed `{ line, col }` position for any offset within the input.

#### `lineCounter.addNewLine(offset: number)`

Adds the starting index of a new line. Should be called in order, or the internal `lineStarts` array will need to be sorted before calling `linePos()`. Bound to the instance, so may be used directly as a callback.

#### `lineCounter.linePos(offset: number): { line: number, col: number }`

Performs a binary search and returns the 1-indexed `{ line, col }` position of `offset`. If `line === 0`, `addNewLine` has never been called or `offset` is before the first known newline.

## Composer

    import { Composer, Parser } from 'yaml'

    const src = 'foo: bar\nfee: [24, "42"]'
    const tokens = new Parser().parse(src)
    const docs = new Composer().compose(tokens)

    Array.from(docs, doc => doc.toJS())
    > [{ foo: 'bar', fee: [24, '42'] }]

#### `new Composer(options?: ParseOptions & DocumentOptions & SchemaOptions)`

Create a new Document composer. Does not include an internal Parser instance, so an external one will be needed. `options` will be used during composition, and passed to the `new Document` constructor.

#### `composer.compose(tokens: Iterable<Token>, forceDoc?: boolean, endOffset?: number): Generator<Document.Parsed>`

Compose tokens into documents. Convenience wrapper combining calls to `composer.next()` and `composer.end()`.

#### `composer.next(token: Token): Generator<Document.Parsed>`

Advance the composed by one CST token.

#### `composer.end(forceDoc?: boolean, offset?: number): Generator<Document.Parsed>`

Always call at end of input to push out any remaining document. If `forceDoc` is true and the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document. `offset` should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.

#### `composer.streamInfo(): { comment, directives, errors, warnings }`

Current stream status information. Mostly useful at the end of input for an empty stream.

## Working with CST Tokens

    import { CST } from 'yaml'

For most use cases, the Document or pure JS interfaces provided by the library are the right tool. Sometimes, though, it's important to keep the original YAML source in as pristine a condition as possible. For those cases, the concrete syntax tree (CST) representation is provided, as it retains every character of the input, including whitespace.

#### `CST.createScalarToken(value: string, context): BlockScalar | FlowScalar`

Create a new scalar token with the value `value`. Values that represent an actual string but may be parsed as a different type should use a `type` other than `'PLAIN'`, as this function does not support any schema operations and won't check for such conflicts.

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| value | `string` |  | The string representation of the value, which will have its content properly indented. **Required.** |
| context.end | `SourceToken[]` |  | Comments and whitespace after the end of the value, or after the block scalar header. If undefined, a newline will be added. |
| context.implicitKey | `boolean` | `false` | Being within an implicit key may affect the resolved type of the token's value. |
| context.indent | `number` |  | The indent level of the token. **Required.** |
| context.inFlow | `boolean` | `false` | Is this scalar within a flow collection? This may affect the resolved type of the token's value. |
| context.offset | `number` | `-1` | The offset position of the token. |
| context.type | `Scalar.Type` |  | The preferred type of the scalar token. If undefined, the previous type of the `token` will be used, defaulting to `'PLAIN'`. |

    const [doc] = new Parser().parse('foo: "bar" #comment')
    const item = doc.value.items[0].value
    > {
        type: 'double-quoted-scalar',
        offset: 5,
        indent: 0,
        source: '"bar"',
        end: [
          { type: 'space', offset: 10, indent: 0, source: '' },
          { type: 'comment', offset: 11, indent: 0, source: '#comment' }
        ]
      }

    CST.resolveAsScalar(item)
    > { value: 'bar', type: 'QUOTE_DOUBLE', comment: 'comment', range: [5, 9, 19] }

#### `CST.isCollection(token?: Token): boolean`

#### `CST.isScalar(token?: Token): boolean`

Custom type guards for detecting CST collections and scalars, in both their block and flow forms.

#### `CST.resolveAsScalar(token?: Token, strict = true, onError?: ComposeErrorHandler)`

If `token` is a CST flow or block scalar, determine its string value and a few other attributes. Otherwise, return `null`.

#### `CST.setScalarValue(token: Token, value: string, context?)`

Set the value of `token` to the given string `value`, overwriting any previous contents and type that it may have.

Best efforts are made to retain any comments previously associated with the `token`, though all contents within a collection's `items` will be overwritten.

Values that represent an actual string but may be parsed as a different type should use a `type` other than `'PLAIN'`, as this function does not support any schema operations and won't check for such conflicts.

| Argument | Type | Default | Description |
| --- | --- | --- | --- |
| token | `Token` |  | Any token. If it does not include an `indent` value, the value will be stringified as if it were an implicit key. **Required.** |
| value | `string` |  | The string representation of the value, which will have its content properly indented. **Required.** |
| context.afterKey | `boolean` | `false` | In most cases, values after a key should have an additional level of indentation. |
| context.implicitKey | `boolean` | `false` | Being within an implicit key may affect the resolved type of the token's value. |
| context.inFlow | `boolean` | `false` | Being within a flow collection may affect the resolved type of the token's value. |
| context.type | `Scalar.Type` |  | The preferred type of the scalar token. If undefined, the previous type of the `token` will be used, defaulting to `'PLAIN'`. |

    function findScalarAtOffset(
      cst: CST.Document,
      offset: number
    ): CST.FlowScalar | CST.BlockScalar | undefined {
      let res: CST.FlowScalar | CST.BlockScalar | undefined = undefined
      CST.visit(cst, ({ key, value }) => {
        for (const token of [key, value])
          if (CST.isScalar(token)) {
            if (token.offset > offset) return CST.visit.BREAK
            if (
              token.offset == offset ||
              (token.offset < offset && token.offset + token.source.length > offset)
            ) {
              res = token
              return CST.visit.BREAK
            }
          }
      })
      return res
    }

#### `CST.stringify(cst: Token | CollectionItem): string`

Stringify a CST document, token, or collection item. Fair warning: This applies no validation whatsoever, and simply concatenates the sources in their logical order.

#### `CST.visit(cst: CST.Document | CST.CollectionItem, visitor: CSTVisitor)`

Apply a visitor to a CST document or item. Effectively, the general-purpose workhorse of navigating the CST.

Walks through the tree (depth-first) starting from `cst` as the root, calling a `visitor` function with two arguments when entering each item:

- `item`: The current item, which includes the following members:
  - `start: SourceToken[]` – Source tokens before the key or value, possibly including its anchor or tag.
  - `key?: Token | null` – Set for pair values. May then be `null`, if the key before the `:` separator is empty.
  - `sep?: SourceToken[]` – Source tokens between the key and the value, which should include the `:` map value indicator if `value` is set.
  - `value?: Token` – The value of a sequence item, or of a map pair.
- `path`: The steps from the root to the current node, as an array of `['key' | 'value', number]` tuples.

The return value of the visitor may be used to control the traversal:

- `undefined` (default): Do nothing and continue
- `CST.visit.SKIP`: Do not visit the children of this token, continue with next sibling
- `CST.visit.BREAK`: Terminate traversal completely
- `CST.visit.REMOVE`: Remove the current item, then continue with the next one
- `number`: Set the index of the next step. This is useful especially if the index of the current token has changed.
- `function`: Define the next visitor for this item. After the original visitor is called on item entry, next visitors are called after handling a non-empty `key` and when exiting the item.

  const [doc] = new Parser().parse('[ foo, bar, baz ]') CST.visit(doc, (item, path) => { if (!CST.isScalar(item.value)) return const scalar = CST.resolveAsScalar(item.value) if (scalar?.value === 'bar') { const parent = CST.visit.parentCollection(doc, path) const idx = path[path.length - 1][1] const { indent } = item.value parent.items.splice(idx, 0, { start: item.start.slice(), value: CST.createScalarToken('bing', { end: [], indent }) }) return idx + 2 } })

  CST.stringify(doc)

  > '[ foo, bing, bar, baz ]'

A couple of utility functions are provided for working with the `path`:

- `CST.visit.itemAtPath(cst, path): CST.CollectionItem | undefined` – Find the item at `path` from `cst` as the root.
- `CST.visit.parentCollection(cst, path): CST.BlockMap | CST.BlockSequence | CST.FlowCollection` – Get the immediate parent collection of the item at `path` from `cst` as the root. Throws an error if the collection is not found, which should never happen if the item itself exists.

# Errors

Nearly all errors and warnings produced by the `yaml` parser functions contain the following fields:

| Member | Type | Description |
| --- | --- | --- |
| code | `string` | An identifier for the error type. |
| linePos | `[LinePos, LinePos] ⎮` `undefined` | If `prettyErrors` is enabled and `offset` is known, the one-indexed human-friendly source location `{ line: number, col: number }`. |
| name | `'YAMLParseError' ⎮` `'YAMLWarning'` |
| message | `string` | A human-readable description of the error |
| pos | `[number, number]` | The position in the source at which this error or warning was encountered. |

A `YAMLParseError` is an error encountered while parsing a source as YAML. They are included in the `doc.errors` array. If that array is not empty when constructing a native representation of a document, the first error will be thrown.

A `YAMLWarning` is not an error, but a spec-mandated warning about unsupported directives or a fallback resolution being used for a node with an unavailable tag. They are included in the `doc.warnings` array.

In rare cases, the library may produce a more generic error. In particular, `TypeError` may occur when parsing invalid input using the `json` schema, and `ReferenceError` when the `maxAliasCount` limit is enountered.

To identify errors for special handling, you should primarily use `code` to differentiate them from each other.

| Code | Description |
| --- | --- |
| `ALIAS_PROPS` | Unlike scalars and collections, alias nodes cannot have an anchor or tag associated with it. |
| `BAD_ALIAS` | An alias identifier must be a non-empty sequence of valid characters. |
| `BAD_COLLECTION_TYPE` | Explicit collection tag used on a collection type it does not support. |
| `BAD_DIRECTIVE` | Only the `%YAML` and `%TAG` directives are supported, and they need to follow the specified structure. |
| `BAD_DQ_ESCAPE` | Double-quotes strings may include `\` escaped content, but that needs to be valid. |
| `BAD_INDENT` | Indentation is important in YAML, and collection items need to all start at the same level. Block scalars are also picky about their leading content. |
| `BAD_PROP_ORDER` | Anchors and tags must be placed after the `?`, `:` and `-` indicators. |
| `BAD_SCALAR_START` | Plain scalars cannot start with a block scalar indicator, or one of the two reserved characters: `@` and ```. To fix, use a block or quoted scalar for the value. |
| `BLOCK_AS_IMPLICIT_KEY` | There's probably something wrong with the indentation, or you're trying to parse something like `a: b: c`, where it's not clear what's the key and what's the value. |
| `BLOCK_IN_FLOW` | YAML scalars and collections both have block and flow styles. Flow is allowed within block, but not the other way around. |
| `DUPLICATE_KEY` | Map keys must be unique. Use the `uniqueKeys` option to disable or customise this check when parsing. |
| `IMPOSSIBLE` | This really should not happen. If you encounter this error code, please file a bug. |
| `KEY_OVER_1024_CHARS` | Due to legacy reasons, implicit keys must have their following `:` indicator after at most 1k characters. |
| `MISSING_CHAR` | Some character or characters are missing here. See the error message for what you need to add. |
| `MULTILINE_IMPLICIT_KEY` | Implicit keys need to be on a single line. Does the input include a plain scalar with a `:` followed by whitespace, which is getting parsed as a map key? |
| `MULTIPLE_ANCHORS` | A node is only allowed to have one anchor. |
| `MULTIPLE_DOCS` | A YAML stream may include multiple documents. If yours does, you'll need to use `parseAllDocuments()` to work with it. |
| `MULTIPLE_TAGS` | A node is only allowed to have one tag. |
| `NON_STRING_KEY` | With the `stringKeys` option, all mapping keys must be strings |
| `TAB_AS_INDENT` | Only spaces are allowed as indentation. |
| `TAG_RESOLVE_FAILED` | Something went wrong when resolving a node's tag with the current schema. |
| `UNEXPECTED_TOKEN` | A token was encountered in a place where it wasn't expected. |

## Silencing Errors and Warnings

Some of the errors encountered during parsing are required by the spec, but are caused by content that may be parsed unambiguously. To ignore these errors, use the `strict: false` option:

- `MULTILINE_IMPLICIT_KEY`: Implicit keys of flow sequence pairs need to be on a single line
- `KEY_OVER_1024_CHARS`: The : indicator must be at most 1024 chars after the start of an implicit block mapping key

For additional control, set the `logLevel` option to `'error'` (default: `'warn'`) to silence all warnings. Setting `logLevel: 'silent'` will ignore parsing errors completely, resulting in output that may well be rather broken.

# Command-line Tool

    npx yaml valid < file.yaml

Available as `npx yaml` or `npm exec yaml`:

    yaml: A command-line YAML processor and inspector

    Reads stdin and writes output to stdout and errors & warnings to stderr.

    Usage:
      yaml          Process a YAML stream, outputting it as YAML
      yaml cst      Parse the CST of a YAML stream
      yaml lex      Parse the lexical tokens of a YAML stream
      yaml valid    Validate a YAML stream, returning 0 on success

    Options:
      --help, -h    Show this message.
      --json, -j    Output JSON.
      --indent 2    Output pretty-printed data, indented by the given number of spaces.
      --merge, -m   Enable support for "<<" merge keys.

    Additional options for bare "yaml" command:
      --doc, -d     Output pretty-printed JS Document objects.
      --single, -1  Require the input to consist of a single YAML document.
      --strict, -s  Stop on errors.
      --visit, -v   Apply a visitor to each document (requires a path to import)
      --yaml 1.1    Set the YAML version. (default: 1.2)

# YAML Syntax

A YAML _schema_ is a combination of a set of tags and a mechanism for resolving non-specific tags, i.e. values that do not have an explicit tag such as `!!int`. The [default schema](https://eemeli.org/yaml/#data-schemas) is the `'core'` schema, which is the recommended one for YAML 1.2. For YAML 1.1 documents the default is `'yaml-1.1'`.

## Tags

    YAML.parse('"42"')
    // '42'

    YAML.parse('!!int "42"')
    // 42

    YAML.parse(`
    %TAG ! tag:example.com,2018:app/
    ---
    !foo 42
    `)
    // YAMLWarning:
    //   The tag tag:example.com,2018:app/foo is unavailable,
    //   falling back to tag:yaml.org,2002:str
    // '42'

The default prefix for YAML tags is `tag:yaml.org,2002:`, for which the shorthand `!!` is used when stringified. Shorthands for other prefixes may also be defined by document-specific directives, e.g. `!e!` or just `!` for `tag:example.com,2018:app/`, but this is not required to use a tag with a different prefix.

During parsing, unresolved tags should not result in errors (though they will be noted as `warnings`), with the tagged value being parsed according to the data type that it would have under automatic tag resolution rules. This should not result in any data loss, allowing such tags to be handled by the calling app.

In order to have `yaml` provide you with automatic parsing and stringification of non-standard data types, it will need to be configured with a suitable tag object. For more information, see [Custom Tags](https://eemeli.org/yaml/#custom-tags).

The YAML 1.0 tag specification is [slightly different](https://eemeli.org/yaml/#changes-from-yaml-1-0-to-1-1) from that used in later versions, and implements prefixing shorthands rather differently.

## Version Differences

This library's parser is based on the 1.2 version of the [YAML spec](http://yaml.org/spec/1.2/spec.html), which is almost completely backwards-compatible with [YAML 1.1](http://yaml.org/spec/1.1/) as well as [YAML 1.0](http://yaml.org/spec/1.0/). Some specific relaxations have been added for backwards compatibility, but if you encounter an issue please [report it](https://github.com/eemeli/yaml/issues).

### Changes from YAML 1.1 to 1.2

    %YAML 1.1
    ---
    true: Yes
    octal: 014
    sexagesimal: 3:25:45
    picture: !!binary |
      R0lGODlhDAAMAIQAAP//9/X
      17unp5WZmZgAAAOfn515eXv
      Pz7Y6OjuDg4J+fn5OTk6enp
      56enmleECcgggoBADs=



    { true: true,
      octal: 12,
      sexagesimal: 12345,
      picture:
       Buffer [Uint8Array] [
         71, 73, 70, 56, 57, 97, 12, 0, 12, 0, 132, 0, 0,
         255, 255, 247, 245, 245, 238, 233, 233, 229, 102,
         102, 102, 0, 0, 0, 231, 231, 231, 94, 94, 94, 243,
         243, 237, 142, 142, 142, 224, 224, 224, 159, 159,
         159, 147, 147, 147, 167, 167, 167, 158, 158, 158,
         105, 94, 16, 39, 32, 130, 10, 1, 0, 59 ] }

The most significant difference between YAML 1.1 and YAML 1.2 is the introduction of the core data schema as the recommended default, replacing the YAML 1.1 type library:

- Only `true` and `false` strings are parsed as booleans (including `True` and `TRUE`); `y`, `yes`, `on`, and their negative counterparts are parsed as strings.
- Underlines `_` cannot be used within numerical values.
- Octal values need a `0o` prefix; e.g. `010` is now parsed with the value 10 rather than 8.
- The binary and sexagesimal integer formats have been dropped.
- The `!!pairs`, `!!omap`, `!!set`, `!!timestamp` and `!!binary` types have been dropped.
- The merge `<<` and value `=` special mapping keys have been removed.

The other major change has been to make sure that YAML 1.2 is a valid superset of JSON. Additionally there are some minor differences between the parsing rules:

- The next-line `\x85`, line-separator `\u2028` and paragraph-separator `\u2029` characters are no longer considered line-break characters. Within scalar values, this means that next-line characters will not be included in the white-space normalisation. Using any of these outside scalar values is likely to result in errors during parsing. For a relatively robust solution, try replacing `\x85` and `\u2028` with `\n` and `\u2029` with `\n\n`.
- Tag shorthands can no longer include any of the characters `,[]{}`, but can include `#`. To work around this, either fix your tag names or use verbatim tags.
- Anchors can no longer include any of the characters `,[]{}`.
- Inside double-quoted strings `\/` is now a valid escape for the `/` character.
- Quoted content can include practically all Unicode characters.
- Documents in streams are now independent of each other, and no longer inherit preceding document directives if they do not define their own.

### Changes from YAML 1.0 to 1.1

    %YAML:1.0
    ---
    date: 2001-01-23
    number: !int '123'
    string: !str 123
    pool: !!ball { number: 8 }
    invoice: !domain.tld,2002/^invoice
      customers: !seq
        - !^customer
          given : Chris
          family : Dumars

The most significant difference between these versions is the complete refactoring of the tag syntax:

- The `%TAG` directive has been added, along with the `!foo!` tag prefix shorthand notation.
- The `^` character no longer enables tag prefixing.
- The private vs. default scoping of `!` and `!!` tag prefixes has been switched around; `!!str` is now a default tag while `!bar` is an application-specific tag.
- Verbatim `!<baz>` tag notation has been added.
- The formal `tag:domain,date/path` format for tag names has been dropped as a requirement.

Additionally, the formal description of the language describing the document structure has been completely refactored between these versions, but the described intent has not changed. Other changes include:

- A `\` escape has been added for the tab character, in addition to the pre-existing `\t`
- The `\^` escape has been removed
- Directives now use a blank space `' '` rather than `:` as the separator between the name and its parameter/value.

`yaml@1` supports parsing and stringifying YAML 1.0 documents, but does not expand tags using the `^` notation. As there is no indication that _anyone_ is still using YAML 1.0, explicit support has been dropped in `yaml@2`.
