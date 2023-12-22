run-proxy:
	@echo "Running proxy"
	@chmod +x ./infra/start_proxy.sh
	@./infra/start_proxy.sh

run:
	@echo "Running frontend"
	@pnpm run dev --host --port 23000
