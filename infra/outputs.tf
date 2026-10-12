output "site_bucket" {
  description = "S3 bucket holding the game."
  value       = aws_s3_bucket.site.bucket
}

output "distribution_id" {
  description = "CloudFront distribution ID — used by the deploy script to invalidate."
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain" {
  description = "CloudFront domain, handy for testing before DNS propagates."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "game_url" {
  description = "Public URL the game is served from."
  value       = "https://${var.hostname}"
}

output "deploy_role_arn" {
  description = "Role GitHub Actions assumes — paste into .github/workflows/deploy.yml."
  value       = aws_iam_role.gha.arn
}
