bench: clean
	deno run -A --unstable --no-check deno_sqlite3.ts
	cd x_sqlite && deno run -A --no-check sqlite.ts
	cd node-sqlite3 && npm i -s && npm start -s

clean:
	-rm **/*.db 
