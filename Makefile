up:
	docker compose up --build

down:
	docker compose down

test-api:
	docker compose run --rm -T api pytest

test-web:
	docker compose run --rm -T web npm run test

test-web-watch:
	docker compose run --rm -T web npm run test:watch


lint-api-all:
	docker compose run --rm -T api isort .
	docker compose run --rm -T api black .
	docker compose run --rm -T api sh -c "PYTHONPATH=. pylint --disable=R,C,W1203,E0401 ."

lint-web:
	docker compose run --rm -T web npm run lint 