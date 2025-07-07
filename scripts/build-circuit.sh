#!/bin/bash

set -e

echo "Building ZKP circuit for provenance..."

# Create build directory
mkdir -p build

# Ensure circom binary ─────────────────────────────────────────────
if command -v circom &> /dev/null; then
  CIRCOM="circom"
else
  if [ -f "build/circom" ]; then
    echo "Using cached circom binary"
    CIRCOM="./build/circom"
  else
    VERSION="2.1.5"
    echo "circom not found – downloading binary v$VERSION …"
    URL="https://github.com/iden3/circom/releases/download/v${VERSION}/circom-linux-amd64"
    curl -L "$URL" -o build/circom
    chmod +x build/circom
    CIRCOM="./build/circom"
  fi
fi

# Compile circuit (skip if already built)
if [ -f "build/prov_hash.wasm" ]; then
  echo "Circuit already compiled (build/prov_hash.wasm exists) – skipping…"
else
  echo "Compiling circuit…"
  $CIRCOM circuits/prov_hash.circom \
         --r1cs --wasm --sym \
         -l node_modules \
         -o build/
fi

# Download powers of tau (small ceremony for development)
PTAU_FILE="build/powersOfTau28_hez_final_16.ptau"
if [ -f "$PTAU_FILE" ]; then
  echo "Removing old ptau file…"
  rm -f "$PTAU_FILE"
fi
echo "Downloading powers of tau..."
curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau -o "$PTAU_FILE"

# Generate proving key
echo "Generating proving key..."
snarkjs groth16 setup build/prov_hash.r1cs "$PTAU_FILE" build/prov_hash.zkey

# Export verification key
echo "Exporting verification key..."
snarkjs zkey export verificationkey build/prov_hash.zkey build/prov_hash.vkey.json

# Copy wasm file to correct location
cp build/prov_hash_js/prov_hash.wasm build/

echo "Circuit build complete!"
echo "Files generated:"
echo "  - build/prov_hash.wasm (circuit)"
echo "  - build/prov_hash.zkey (proving key)"
echo "  - build/prov_hash.vkey.json (verification key)"