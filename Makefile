up:
	docker-compose up --build

down:
	docker-compose down

test-api:
	docker-compose run --rm api pytest

test-web:
	docker-compose run --rm web npm run test

lint-api:
	docker-compose run --rm api sh -c "PYTHONPATH=. pylint --disable=R,C,W1203,E0401 ."

lint-api-format:
	docker-compose run --rm api black .

lint-api-isort:
	docker-compose run --rm api isort .

lint-api-all:
	docker-compose run --rm api isort .
	docker-compose run --rm api black .
	docker-compose run --rm api sh -c "PYTHONPATH=. pylint --disable=R,C,W1203,E0401 ."

lint-web:
	docker-compose run --rm web npm run lint 