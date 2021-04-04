GIT_REF = $(shell git rev-parse --short HEAD)
REGION = au
REGISTRY_ID = 0
DOCKER_REGISTRY = 
PROJECT=graphql-spiker

install:
	@echo ">> Install"
	npm i;

start: 
	@echo ">> Start"
	npm run start

clean: 
	@echo ">> Cleaning"
	rm -rf node_modules

build: 
	@echo ">> Building docker image"
	docker build -f $(shell pwd)/docker/Dockerfile -t $(DOCKER_REGISTRY)$(PROJECT):$(GIT_REF) .

upload:
	@echo ">> Pushing docker image"
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${DOCKER_REGISTRY}
	docker push $(DOCKER_REGISTRY)$(PROJECT):$(GIT_REF)

docker_run:
	@echo ">> Running docker image"
	docker run -p 8000:4001 -p 4000:4000 --detach --name $(PROJECT) $(DOCKER_REGISTRY)$(PROJECT):$(GIT_REF)
