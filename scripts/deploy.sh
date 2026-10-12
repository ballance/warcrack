#!/usr/bin/env bash
# Deploy index.html to warcrack.bastionforge.com (S3 + CloudFront).
#
# Run with bash, never zsh — matches the convention in the other bastionforge
# deploy scripts.
#
#   ./scripts/deploy.sh              # upload + invalidate
#   DRY_RUN=1 ./scripts/deploy.sh    # show what would happen, change nothing
#
# Bucket and distribution are read from SSM so nothing is hardcoded here; both
# are written by terraform in infra/. Override with BUCKET / DIST_ID if needed.
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
HOSTNAME_="${HOSTNAME_:-warcrack.bastionforge.com}"
BUCKET_PARAM="${BUCKET_PARAM:-/warcrack-web/site-bucket}"
DIST_PARAM="${DIST_PARAM:-/warcrack-web/distribution-id}"
CACHE_CONTROL="${CACHE_CONTROL:-public, max-age=300}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GAME="$ROOT/index.html"

log()  { printf '\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✔ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$*" >&2; }
die()  { printf '\033[1;31m✘ %s\033[0m\n' "$*" >&2; exit 1; }

require_cmds() {
  local missing=()
  for c in "$@"; do command -v "$c" >/dev/null 2>&1 || missing+=("$c"); done
  [ ${#missing[@]} -eq 0 ] || die "missing required commands: ${missing[*]}"
}

require_cmds aws
[ -f "$GAME" ] || die "no index.html at $GAME"

# --- sanity: the artifact must be the self-contained game, not a stub ---
bytes=$(wc -c <"$GAME" | tr -d ' ')
[ "$bytes" -gt 100000 ] || die "index.html is only ${bytes}B — expected the full self-contained game"
grep -q 'EMBERFALL' "$GAME" || die "index.html does not look like the game (no title banner found)"
if grep -qiE '<script[^>]+src=|<link[^>]+href="https?:' "$GAME"; then
  die "index.html references an external asset — it must stay self-contained"
fi
ok "index.html looks self-contained (${bytes} bytes)"

identity="$(aws sts get-caller-identity --query Arn --output text 2>/dev/null)" \
  || die "no working AWS credentials (aws sts get-caller-identity failed)"
log "deploying as $identity"

BUCKET="${BUCKET:-$(aws ssm get-parameter --region "$AWS_REGION" --name "$BUCKET_PARAM" \
  --query Parameter.Value --output text 2>/dev/null)}" \
  || die "could not read $BUCKET_PARAM — has terraform been applied in infra/?"
DIST_ID="${DIST_ID:-$(aws ssm get-parameter --region "$AWS_REGION" --name "$DIST_PARAM" \
  --query Parameter.Value --output text 2>/dev/null)}" \
  || die "could not read $DIST_PARAM — has terraform been applied in infra/?"

log "bucket=$BUCKET distribution=$DIST_ID"

if [ "${DRY_RUN:-0}" = "1" ]; then
  warn "DRY_RUN=1 — would upload $GAME to s3://$BUCKET/index.html and invalidate /*"
  exit 0
fi

log "uploading index.html"
aws s3 cp "$GAME" "s3://$BUCKET/index.html" \
  --region "$AWS_REGION" \
  --content-type "text/html; charset=utf-8" \
  --cache-control "$CACHE_CONTROL" \
  --only-show-errors
ok "uploaded"

log "invalidating CloudFront cache"
inv_id="$(aws cloudfront create-invalidation \
  --distribution-id "$DIST_ID" \
  --paths '/*' \
  --query Invalidation.Id --output text)"
ok "invalidation $inv_id created"

log "waiting for the invalidation to complete"
aws cloudfront wait invalidation-completed \
  --distribution-id "$DIST_ID" --id "$inv_id" 2>/dev/null \
  || warn "stopped waiting — the invalidation is still in flight, which is fine"

code="$(curl -s -o /dev/null -w '%{http_code}' "https://$HOSTNAME_/" || true)"
if [ "$code" = "200" ]; then
  ok "live: https://$HOSTNAME_/ (HTTP $code)"
else
  warn "https://$HOSTNAME_/ returned HTTP ${code:-no response} — DNS or the cert may still be settling"
fi
