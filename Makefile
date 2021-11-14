test:
	deno test -A --unstable --no-check --ignore=bench/

fmt:
	deno fmt --ignore=target/,bench/node-sqlite3/
	cargo fmt
