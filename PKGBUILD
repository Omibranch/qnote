# Maintainer: Omi <pprrottonn@gmail.com>
pkgname=qnote
pkgver=0.1.1
pkgrel=1
pkgdesc="Minimal Tauri desktop note editor with Markdown support, PDF export, and file history"
arch=('x86_64')
url="https://github.com/Omixxxxxxx/qnote"
license=('MIT')
depends=('gtk3' 'webkit2gtk-4.1' 'xdg-utils')
makedepends=('rust' 'cargo' 'nodejs' 'pnpm' 'base-devel')
source=("$pkgname-$pkgver.tar.gz::https://github.com/Omixxxxxxx/qnote/archive/refs/tags/v$pkgver.tar.gz")
sha256sums=('SKIP')

build() {
    cd "$pkgname-$pkgver"
    export RUSTUP_TOOLCHAIN=stable
    export CARGO_TARGET_DIR="target"
    pnpm install --frozen-lockfile
    pnpm tauri build --bundles none
}

package() {
    cd "$pkgname-$pkgver"
    install -Dm755 "src-tauri/target/release/$pkgname" "$pkgdir/usr/bin/$pkgname"
    install -Dm644 "src-tauri/icons/icon.png" "$pkgdir/usr/share/pixmaps/$pkgname.png"

    # Desktop entry
    install -dm755 "$pkgdir/usr/share/applications"
    cat > "$pkgdir/usr/share/applications/$pkgname.desktop" << EOF
[Desktop Entry]
Name=qnote
Comment=Minimal note editor with Markdown support
Exec=$pkgname
Icon=$pkgname
Type=Application
Categories=Office;TextEditor;
Keywords=notes;markdown;editor;text;
EOF

    install -Dm644 LICENSE "$pkgdir/usr/share/licenses/$pkgname/LICENSE" 2>/dev/null || true
}
