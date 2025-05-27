up:
	docker-compose up --build

down:
	docker-compose down

test-api:
	docker-compose run --rm api pytest

test-web:
	docker-compose run --rm web npm run test

lint-api:
	docker-compose run --rm api flake8

lint-web:
	docker-compose run --rm web npm run lint 