# =============================================================================
# Emberfall (warcrack) — static hosting for a single self-contained index.html.
#
# Same shape as the other bastionforge static sites: a private S3 bucket that
# only CloudFront may read via OAC, an ACM cert validated through Route53, and
# A/AAAA aliases on the apex hosted zone. The game is one HTML file with no
# build step and no hashed assets, so there is a single cache behavior rather
# than the split default//assets/* pair the Vite-built sites need.
# =============================================================================

# =============================================================================
# S3 bucket — private, encrypted, versioned. Only CloudFront OAC may read it.
# Versioning gives a free rollback: every deploy keeps the previous index.html.
# =============================================================================

resource "aws_s3_bucket" "site" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# Keep old versions from piling up forever — 90 days of rollback is plenty for
# a static game, and noncurrent versions are the only thing that grows here.
resource "aws_s3_bucket_lifecycle_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    id     = "expire-noncurrent-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 90
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# =============================================================================
# Route53 — look up the existing hosted zone for the parent domain.
# =============================================================================

data "aws_route53_zone" "main" {
  name         = "bastionforge.com"
  private_zone = false
}

# =============================================================================
# ACM cert (DNS-validated via Route53). Must be in us-east-1 for CloudFront —
# the whole stack already lives there, so no provider alias is needed.
# =============================================================================

resource "aws_acm_certificate" "site" {
  domain_name       = var.hostname
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.site.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  allow_overwrite = true
  zone_id         = data.aws_route53_zone.main.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
}

resource "aws_acm_certificate_validation" "site" {
  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}

# =============================================================================
# CloudFront — Origin Access Control + distribution.
# =============================================================================

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${aws_s3_bucket.site.bucket}-oac"
  description                       = "OAC for ${var.hostname}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# AWS-managed policy IDs (stable, documented).
# Source: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html
locals {
  cache_policy_caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.hostname]
  price_class         = "PriceClass_100"
  comment             = "Emberfall static game — ${var.hostname}"

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "s3-${aws_s3_bucket.site.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  # One behavior for the whole site: the game is a single ~215KB HTML file, so
  # caching it at the edge is what makes the first paint fast (CloudFront
  # compresses it to roughly a quarter of that on the wire). CachingOptimized
  # honours the origin's Cache-Control, which the deploy script sets to a short
  # max-age; the deploy also invalidates, so a new build is live immediately.
  default_cache_behavior {
    target_origin_id       = "s3-${aws_s3_bucket.site.id}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = local.cache_policy_caching_optimized
    compress               = true
  }

  # There is exactly one page, so any other path should still land on the game
  # rather than an S3 XML error document.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# =============================================================================
# Bucket policy — only CloudFront (this distribution) may read objects.
# =============================================================================

data "aws_iam_policy_document" "site" {
  statement {
    sid       = "AllowCloudFrontOACRead"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.site.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site.json
}

# =============================================================================
# Route53 — alias records pointing the custom domain at CloudFront.
# =============================================================================

resource "aws_route53_record" "site" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.hostname
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "site_aaaa" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.hostname
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

# =============================================================================
# SSM parameters — let the deploy script find the bucket and distribution
# without reading terraform state.
# =============================================================================

resource "aws_ssm_parameter" "site_bucket" {
  name  = "/warcrack-web/site-bucket"
  type  = "String"
  value = aws_s3_bucket.site.id
}

resource "aws_ssm_parameter" "distribution_id" {
  name  = "/warcrack-web/distribution-id"
  type  = "String"
  value = aws_cloudfront_distribution.site.id
}
