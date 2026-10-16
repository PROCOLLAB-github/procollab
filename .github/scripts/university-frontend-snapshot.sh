#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
test "$(id -un)" = gh_deploy
root=/home/gh_deploy
snapshot=/var/tmp/procollab-prod-university-frontend-20261016
test "$(readlink -f "$root")" = "$root"
printf 'FRONTEND_INDEX_CANDIDATES\n'
find "$root" -maxdepth 3 -name index.html -type f -not -path '*/.ssh/*' -print
test -f "$root/social_platform/index.html"
test ! -e "$snapshot"
available=$(df -PB1 /var/tmp | awk 'NR==2 {print $4}')
size=$(du -sb "$root/social_platform" | awk '{print $1}')
test "$available" -gt "$((size * 2 + 104857600))"
install -d -m 700 "$snapshot"
tar -czf "$snapshot/frontend-before.tar.gz" -C "$root" social_platform
gzip -t "$snapshot/frontend-before.tar.gz"
tar -tzf "$snapshot/frontend-before.tar.gz" > "$snapshot/archive-files.txt"
sha256sum "$root/social_platform/index.html" > "$snapshot/frontend-index-before.sha256"
sha256sum "$snapshot/frontend-before.tar.gz"
chmod 600 "$snapshot"/*
touch "$snapshot/COMPLETE"
printf 'PROD_FRONTEND_PRIVATE_BACKUP_COMPLETE=true\n'
