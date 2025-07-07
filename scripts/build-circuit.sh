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

# -----------------------------------------------------------------
#  PTAU generation (local, fast)
# -----------------------------------------------------------------
POW=16
PTAU_NEW="build/pot${POW}_0000.ptau"
PTAU_CONTRIB="build/pot${POW}_contrib.ptau"
PTAU_FINAL="build/pot${POW}_final.ptau"

# clean old ptau
rm -f build/*.ptau

echo "Generating new PTAU (power $POW)…"
npx --yes snarkjs powersoftau new bn128 $POW "$PTAU_NEW" -v
npx --yes snarkjs powersoftau contribute "$PTAU_NEW" "$PTAU_CONTRIB" \
     --name="CI contribution" -v -e="random text"
npx --yes snarkjs powersoftau prepare phase2 "$PTAU_CONTRIB" "$PTAU_FINAL" -v
echo "PTAU generation done."

# Generate proving key
echo "Generating proving key..."
snarkjs groth16 setup build/prov_hash.r1cs "$PTAU_FINAL" build/prov_hash.zkey

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