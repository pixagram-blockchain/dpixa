SHELL := /bin/bash
PATH  := ./node_modules/.bin:$(PATH)

SRC_FILES := $(shell find src -name '*.ts')

all: build docs

# Build lib/ (CommonJS + .d.ts), esm/ (code-split ES modules for bundlers)
# and dist/ (standalone UMD bundles); see scripts/build.mjs. Everything is
# rebuilt from scratch every time so a stale lib/ can't be published again
# (1.5.4 shipped without lib/index-node.js). The script also fails the build
# if any crypto code becomes reachable from the lite entry point.
.PHONY: build lib bundle
build: node_modules
	node scripts/build.mjs
	dts-generator --name dpixa --project . --out dist/dpixa.d.ts
	perl -i -pe"s@'dpixa/src/index'@'dpixa'@g" dist/dpixa.d.ts

# Old target names, kept for muscle memory.
lib bundle: build

# CI gate: lint-only. Tests live in test/ and are intentionally NOT run
# here (see `make test` below). Rationale: the integration tests under
# test/*.ts depend on a live RPC endpoint and are not appropriate for an
# offline publish gate. Pure-unit test files (test/crypto.ts, test/memo.ts,
# test/serializers.ts, test/asset.ts) remain in the tree for local /
# manual execution via `make test`.
.PHONY: ci-test
ci-test: node_modules
	eslint -c .eslintrc.json 'src/**/*.ts'

# Run the full test suite locally. Several files (test/blockchain.ts,
# test/broadcast.ts, test/database.ts, test/hivemind.ts, test/operations.ts,
# test/rc.ts) hit a live Pixa RPC node and will hang or fail without one.
# Override the default endpoint by setting TEST_NODE, e.g.
#   TEST_NODE=https://my-node.example.com make test
# Filter individual tests with `make test grep='<pattern>'`.
.PHONY: test
test: node_modules
	mocha --exit --require ts-node/register -r test/_node.js test/*.ts --grep '$(grep)'

# Subset that doesn't need network. Fast, deterministic, safe to run anywhere.
# test/compat.ts checks byte-for-byte output (keys, signatures, digests,
# memos, RPC request bodies) against test/fixtures/compat.json.
.PHONY: test-unit
test-unit: node_modules
	mocha --exit --require ts-node/register \
		test/crypto.ts test/serializers.ts test/asset.ts test/memo.ts \
		test/misc.ts test/iterator-stream.ts test/fetch.ts test/lite.ts test/compat.ts

.PHONY: coverage
coverage: node_modules
	nyc -r html -r text -e .ts -i ts-node/register mocha --exit --reporter nyan --require ts-node/register test/*.ts

# Lint (eslint replaces the deprecated tslint used previously; the tslint
# parser couldn't handle TS 5.x tuple types and was emitting false-positive
# parse errors on src/chain/account.ts, serializer.ts, operation.ts, etc.).
# --fix applies autofixes for semicolons, quotes, spacing, import order.
.PHONY: lint
lint: node_modules
	eslint -c .eslintrc.json 'src/**/*.ts' --fix

node_modules:
	npm ci

docs: $(SRC_FILES) node_modules
	typedoc --gitRevision master --out docs src --plugin typedoc-material-theme --themeColor '#666666'
	find docs -name "*.html" | xargs perl -i -pe's~$(shell pwd)~.~g'
	echo "Served at <https://pixagram.com/dpixa>" > docs/README.md
	touch docs
	typedoc --gitRevision master --out documentation src --plugin typedoc-plugin-markdown

.PHONY: clean
clean:
	rm -rf lib/ esm/
	rm -f dist/*
	rm -rf docs/

.PHONY: distclean
distclean: clean
	rm -rf node_modules/