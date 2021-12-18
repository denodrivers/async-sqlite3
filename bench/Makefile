bench: clean
	deno run -A --unstable --no-check deno_sqlite3.ts
	cd x_sqlite3 && deno run -A --no-check --unstable sqlite3.ts
	cd node-sqlite3 && npm i -s && npm start -s
	cd better-sqlite3 && npm i -s && npm start -s
	cd python-sqlite3 && pip3 install -q -q -r requirements.txt && python3 main.py
	cd x_sqlite && deno run -A --no-check sqlite.ts
	
clean:
	-rm **/*.db
	-rm *.db
	-rm -rf ~/.cache/deno/plug
