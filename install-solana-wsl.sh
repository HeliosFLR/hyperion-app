#!/bin/bash
set -e

echo "Installing Solana CLI..."
curl -sSfL https://release.anza.xyz/stable/install | sh

echo "Adding to PATH..."
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc

echo "Solana version:"
solana --version

echo "Installing Anchor CLI..."
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install 0.30.1
avm use 0.30.1

echo "Anchor version:"
anchor --version

echo "Done! Solana and Anchor installed in WSL."
