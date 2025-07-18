#!/bin/sh
#
# Use this script to repair the worktree configuration of lib/wallet-common.
#
# This may be necessary if you set up the submodules in
# ./wallet-frontend/lib/wallet-common and ./wallet-enterprise/lib/wallet-common
# to be worktrees linked to ./lib/wallet-common . See `git help worktree`.
#
# If you run `git submodule update` in wallet-frontend or wallet-enterprise,
# then the submodule command breaks the worktree configuration in
# ./.git/modules/lib/wallet-common/config which causes all subsequent git
# commands in ./lib/wallet-common to fail.
# This script repairs the configuration value so that git commands will again
# work in ./lib/wallet-common .

# Exit on error
set -e

# Echo commands
set -x

sed -i 's#worktree *=.*#worktree = ../../../../lib/wallet-common#' .git/modules/lib/wallet-common/config
