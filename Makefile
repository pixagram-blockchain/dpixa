
SHELL := /bin/bash
PATH  := ./node_modules/.bin:$(PATH)

SRC_FILES := $(shell find src -name '*.ts')

define VERSION_TEMPLATE
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = '$(shell node -p 'require("./package.json").version')';
endef

all: lib bundle docs

export VERSION_TEMPLATE
lib: $(SRC_FILES) node_modules
	tsc -p tsconfig.json --outDir lib && \
	echo "$$VERSION_TEMPLATE" > lib/version.js
	touch lib

dist/%.js: lib
	browserify $(filter-out $<,$^) --debug --full-paths \
		--standalone dpixa --plugin tsify \
		--transform [ babelify --extensions .ts ] \
		| derequire > $@
	terser $@ \
		--source-map "content=inline,url=$(notdir $@).map,filename=$@.map" \
		--compress "dead_code,collapse_vars,reduce_vars,keep_infinity,drop_console,passes=2" \
		--output $@ || rm $@

dist/dpixa.js: src/index-browser.ts

dist/dpixa.d.ts: $(SRC_FILES) node_modules
	dts-generator --name dpixa --project . --out dist/dpixa.d.ts
	perl -i -pe"s@'dpixa/index'@'dpixa'@g" dist/dpixa.d.ts

dist/%.gz: dist/dpixa.js
	gzip -9 -f -c $(basename $@) > $(basename $@).gz

bundle: dist/dpixa.js.gz dist/dpixa.d.ts

.PHONY: coverage
coverage: node_modules
	nyc -r html -r text -e .ts -i ts-node/register mocha --exit --reporter nyan --require ts-node/register test/*.ts

.PHONY: test
test: node_modules
	mocha --exit --require ts-node/register -r test/_node.js test/*.ts --grep '$(grep)'

.PHONY: ci-test
ci-test: node_modules
	eslint -c .eslintrc.json src/**/*.ts
	nyc -r lcov -e .ts -i ts-node/register mocha --exit --reporter tap --require ts-node/register test/*.ts

.PHONY: browser-test
browser-test: dist/dpixa.js
	BUILD_NUMBER="$$(git rev-parse --short HEAD)-$$(date +%s)" \
		karma start test/_karma-sauce.js

.PHONY: browser-test-local
browser-test-local: dist/dpixa.js
	karma start test/_karma.js

.PHONY: lint
lint: node_modules
	tslint -p tsconfig.json -c tslint.json -t stylish --fix

node_modules:
	yarn install --non-interactive --frozen-lockfile

docs: $(SRC_FILES) node_modules
	typedoc --gitRevision master --out docs src --plugin typedoc-material-theme
	find docs -name "*.html" | xargs perl -i -pe's~$(shell pwd)~.~g'
	echo "Served at <https://pixagram-blockchain.github.io/dpixa>" > docs/README.md
	touch docs

.PHONY: clean
clean:
	rm -rf lib/
	rm -f dist/*
	rm -rf docs/

.PHONY: distclean
distclean: clean
	rm -rf node_modules/
