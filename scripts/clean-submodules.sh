#!/bin/bash

# Remove .gitmodules file if it exists
rm -f .gitmodules

# Remove any submodule entries from .git/config
git config --file .git/config --remove-section submodule.web 2>/dev/null || true

# Clean up submodule directories
rm -rf .git/modules/web

# Clean up any submodule cache
git rm --cached web 2>/dev/null || true

# Reset the web directory if it was removed
git checkout -- web 2>/dev/null || true 