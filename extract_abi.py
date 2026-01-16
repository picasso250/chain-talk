import json
import os

# Read the ChainTalk.json file
with open("backend/artifacts/contracts/ChainTalk.sol/ChainTalk.json", "r") as f:
    contract_data = json.load(f)

# Extract the ABI
abi = contract_data["abi"]

# Save ABI to abi.json in root directory
with open("abi.json", "w") as f:
    json.dump(abi, f, indent=2)

print("ABI extracted and saved to abi.json")
