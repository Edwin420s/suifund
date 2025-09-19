#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 <PACKAGE_ID>"
    exit 1
fi

PACKAGE_ID=$1

echo "Verifying SuiFund contracts on Sui Explorer..."
sui client verify-source $PACKAGE_ID

if [ $? -ne 0 ]; then
    echo "Verification failed!"
    exit 1
fi

echo "Verification completed successfully!"