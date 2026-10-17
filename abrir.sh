#!/usr/bin/env bash
# Arranca la presentación en local (auto-build + navegador).
cd "$(dirname "$0")" || exit 1
exec node serve.mjs "$@"
