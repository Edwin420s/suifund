#!/bin/bash

echo "Verifying SuiFund contracts on Sui Explorer..."
sui client verify-source <PACKAGE_ID>

echo "Verification completed!"