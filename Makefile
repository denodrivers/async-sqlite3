test:
	deno test -A --unstable --no-check -j 1 --ignore=bench/

fmt:
	deno fmt --ignore=target/,bench/node-sqlite3/
	cargo fmt
