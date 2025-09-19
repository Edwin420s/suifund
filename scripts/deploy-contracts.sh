#!/bin/bash

echo "Building SuiFund contracts..."
sui move build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo "Publishing contracts to Sui network..."
sui client publish --gas-budget 100000000

if [ $? -ne 0 ]; then
    echo "Publish failed!"
    exit 1
fi

echo "Contracts deployed successfully!"
echo "Update the contract address in your frontend configuration"