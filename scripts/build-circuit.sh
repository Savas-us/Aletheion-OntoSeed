#!/bin/bash

set -e

echo "Building ZKP circuit for provenance..."

# Create build directory
mkdir -p build

# Check if circom is installed
if ! command -v circom &> /dev/null; then
    echo "Error: circom not found. Please install circom:"
    echo "npm install -g circom"
    exit 1
fi

# Compile circuit
echo "Compiling circuit..."
circom circuits/prov_hash.circom --r1cs --wasm --sym -o build/

# Download powers of tau (small ceremony for development)
PTAU_FILE="build/powersOfTau28_hez_final_16.ptau"
if [ ! -f "$PTAU_FILE" ]; then
    echo "Downloading powers of tau..."
    curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_16.ptau -o "$PTAU_FILE"
fi

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