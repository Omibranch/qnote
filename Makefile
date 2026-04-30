.PHONY: mac-build mac-prepare

mac-prepare:
	@echo "Preparing build environment for macOS..."
	@command -v asdf >/dev/null 2>&1 || (echo "Error: asdf is not installed. Install from https://asdf-vm.com" && exit 1)
	@echo "Adding asdf plugins..."
	asdf plugin add nodejs 2>/dev/null || true
	asdf plugin add rust 2>/dev/null || true
	asdf plugin add pnpm 2>/dev/null || true
	@echo "Installing tools from .tool-versions..."
	asdf install
	@echo "Ready to build!"

mac-build:
	@echo "Building qnote for macOS..."
	asdf exec pnpm install
	asdf exec pnpm build
	asdf exec pnpm tauri build
