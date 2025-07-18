#!/bin/sh
#
# Set up the submodules in ./wallet-frontend/lib/wallet-common and
# ./wallet-enterprise/lib/wallet-common to be worktrees linked to
# ./lib/wallet-common . See `git help worktree`. This links all three worktrees
# to the same underlying git repository so they'll all share the same branches
# and remotes, but a different branch (or detached commit) may be checked out
# independently in each worktree.
#
# Note that if you run `git submodule update` in wallet-frontend or
# wallet-enterprise, then you'll need to run ./repair-wallet-common-worktree.sh
# to repair a configuration setting that the submodule command breaks.

# Exit on error
set -e

# Echo commands
set -x

git submodule update --init --recursive -- lib/wallet-common

# Not --recursive because we don't want wallet-enterprise/lib/wallet-common to be initialized yet
git submodule update --init -- wallet-enterprise
git -C lib/wallet-common worktree add -b wallet-enterprise ../../wallet-enterprise/lib/wallet-common

# Not --recursive because we don't want wallet-frontend/lib/wallet-common to be initialized yet
git submodule update --init -- wallet-frontend
git -C lib/wallet-common worktree add -b wallet-frontend ../../wallet-frontend/lib/wallet-common
