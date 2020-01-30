#!/bin/bash
# Generoi SDK:n apikuvauksen perusteella.

if [[ -z $EPERUSTEET_SERVICE_DIR ]]
then
  printf "\x1b[1m$EPERUSTEET_SERVICE_DIR\x1b[0m is not set.\n"
  printf "For example, call export \x1b[1m$EPERUSTEET_SERVICE_DIR="
  printf "%s" "$HOME"
  printf "/eperusteet/eperusteet/eperusteet-service\x1b[0m\n"
  exit 1
fi

mkdir -p src/generated
cd src/generated || exit 1
gendir=$(pwd)

specfile="$EPERUSTEET_SERVICE_DIR/target/openapi/eperusteet.spec.json"
cd "$EPERUSTEET_SERVICE_DIR" \
  && mvn clean compile -Pgenerate-openapi \
  && cd "$gendir" \
  && npx openapi-generator generate -c ../../generator.config.json -i "$specfile" -g typescript-axios
