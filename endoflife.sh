#!/bin/bash

# Fetch the list of available products
curl -s https://endoflife.date/api/all.json -o available_products.json

# Extract dependencies from package.json
jq -r '.dependencies, .devDependencies | to_entries[] | [.key, .value] | @csv' package.json | \
while IFS=, read -r package version; do
  # Remove surrounding quotes from package and version
  package=$(echo "$package" | tr -d '"')
  version=$(echo "$version" | tr -d '"')

  # Strip any version control characters like "^", "~" from the version
  clean_version=$(echo "$version" | sed 's/[~^]//g')

  # Normalize package names for known products
  case "$package" in
    "@types/node") base_product_name="nodejs" ;;  # Normalize Node.js
    "@vue/cli-service") base_product_name="vue" ;;  # Example normalization for Vue
    *) base_product_name="$package" ;;  # Default case
  esac

  # Check if the product exists in the available products list
  product_exists=$(jq -r --arg package "$base_product_name" 'index($package)' available_products.json)

  # Initialize EOL information
  eol_status=""

  # If the product exists, fetch its EOL data
  if [[ "$product_exists" ]]; then
    eol_data=$(curl -s "https://endoflife.date/api/${base_product_name}.json")
    
    # Check if eol_data is valid and extract relevant details
    if [[ $(echo "$eol_data" | jq 'type') == '"array"' ]]; then
      # Iterate over the cycles in the product's EOL data to find a match for the version
      for cycle_data in $(echo "$eol_data" | jq -c '.[]'); do
        # Extract fields from the current cycle
        latest=$(echo "$cycle_data" | jq -r '.latest')
        eol=$(echo "$cycle_data" | jq -r '.eol')

        # If the latest version in the cycle matches the dependency version, print the EOL status
        if [[ "$latest" == "$clean_version" ]]; then
          eol_status="$eol"
          echo "| $package | $version | $eol_status |"
          break
        fi
      done
    else
      # Product found but no valid EOL data
      echo "| $package | $version | |"
    fi
  else
    # Product not found, no EOL status
    echo "| $package | $version | |"
  fi
done | \
awk 'BEGIN { print "|| Package || Version || EOL Status ||"; } { print }'
