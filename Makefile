run-proxy:
	@echo "Running proxy"
	@chmod +x ./infra/start_proxy.sh
	@./infra/start_proxy.sh

run:
	@echo "Running frontend"
	@pnpm run dev --host 0.0.0.0 --port 23000

run-story:
	@echo "Running storybook"
	@pnpm run storybook --host 0.0.0.0 --port 23001

build-frontend:
	@echo "Building frontend"
	@pnpm run build

build-storybook:
	@echo "Building storybook"
	@pnpm run build-storybook

build: build-frontend build-storybook
