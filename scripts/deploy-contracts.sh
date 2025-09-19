#!/bin/bash

echo "Building SuiFund contracts..."
sui move build

echo "Publishing contracts to Sui network..."
sui client publish --gas-budget 100000000

echo "Contracts deployed successfully!"
echo "Update the contract address in src/utils/constants.js"