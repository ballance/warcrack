# Deploying Emberfall to warcrack.bastionforge.com

Static hosting, same shape as the other bastionforge sites: a **private S3
bucket** that only **CloudFront** can read (OAC), an **ACM** cert validated
through **Route 53**, and A/AAAA aliases on the `bastionforge.com` hosted zone
in account `807135474710`.

The bucket is private on purpose. S3's own website endpoint cannot serve HTTPS
on a custom domain, so CloudFront is what makes `https://warcrack.bastionforge.com`
possible — the hosting is still just "a file in S3".

## What gets created

| Resource | Name |
| --- | --- |
| S3 bucket | `warcrack-web-site` (private, encrypted, versioned, 90-day version expiry) |
| CloudFront | one distribution, `PriceClass_100`, compression on, OAC to the bucket |
| ACM cert | `warcrack.bastionforge.com`, DNS-validated |
| Route 53 | `warcrack` A + AAAA aliases → CloudFront |
| SSM | `/warcrack-web/site-bucket`, `/warcrack-web/distribution-id` |

Terraform state: `s3://ballance-terraform-state/services/warcrack-web.tfstate`,
locked with the `terraform-state-lock` DynamoDB table.

Rough cost at hobby traffic: cents per month — Route 53 queries plus a few
hundred CloudFront requests. ACM certs and the hosted zone are already paid for.

## Prerequisites

```bash
brew install awscli terraform     # neither is currently on this machine
aws configure                     # or: aws configure sso / export AWS_PROFILE=...
aws sts get-caller-identity       # must report account 807135474710
```

## First deploy

```bash
cd infra
terraform init
terraform plan        # expect ~16 resources to add, 0 to change, 0 to destroy
terraform apply
```

`apply` blocks on `aws_acm_certificate_validation` while the DNS challenge
resolves, then on the CloudFront distribution reaching `Deployed`. Ten to
twenty minutes for the first run is normal; nothing is wrong.

Then push the game:

```bash
cd ..
./scripts/deploy.sh
```

## Routine deploys

```bash
./scripts/deploy.sh            # upload + invalidate + verify
DRY_RUN=1 ./scripts/deploy.sh  # preflight only, changes nothing
```

The script refuses to ship a file that is not the self-contained game: it
checks the size, looks for the title banner, and fails if `index.html` ever
grows an external `<script src>` or remote stylesheet. It reads the bucket and
distribution from SSM, uploads with `Cache-Control: public, max-age=300`,
invalidates `/*`, waits for the invalidation, and curls the live URL.

## Caching

One cache behavior for the whole site, using the managed **CachingOptimized**
policy. This differs deliberately from the Vite-built sites in `datum`, which
leave `index.html` uncached because it points at content-hashed assets — here
there are no assets, just one ~215 KB HTML file, so edge-caching it is what
makes the first paint quick (CloudFront compresses it to roughly 50 KB). The
short `max-age` plus the deploy-time invalidation means a new build is live
immediately anyway.

## Rollback

Bucket versioning is on, so the previous build is always one command away:

```bash
BUCKET=warcrack-web-site
aws s3api list-object-versions --bucket $BUCKET --prefix index.html \
  --query 'Versions[].{v:VersionId,when:LastModified}' --output table

aws s3api copy-object --bucket $BUCKET --key index.html \
  --copy-source "$BUCKET/index.html?versionId=<PREVIOUS_VERSION_ID>" \
  --content-type "text/html; charset=utf-8" --cache-control "public, max-age=300" \
  --metadata-directive REPLACE

aws cloudfront create-invalidation \
  --distribution-id "$(aws ssm get-parameter --name /warcrack-web/distribution-id \
    --query Parameter.Value --output text)" --paths '/*'
```

## Teardown

```bash
cd infra
terraform destroy
```

The bucket is versioned, so `destroy` fails until the object versions are
removed: `aws s3 rm s3://warcrack-web-site --recursive` clears current objects,
then delete the noncurrent versions (or wait out the 90-day lifecycle rule)
before re-running.

## Not included

No GitHub Actions workflow or OIDC deploy role — this directory is not a git
repo yet. If it becomes one, copy the `gha_web*` role and the
`.github/workflows/web-deploy.yml` job from `datum`; the SSM parameter names
above are the same ones that workflow expects.
