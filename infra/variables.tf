variable "hostname" {
  description = "Fully-qualified custom domain the game is served from."
  type        = string
  default     = "warcrack.bastionforge.com"
}

variable "bucket_name" {
  description = "S3 bucket holding the game. Globally unique; only CloudFront reads it."
  type        = string
  default     = "warcrack-web-site"
}

variable "github_repo" {
  description = "owner/name of the repo allowed to assume the deploy role."
  type        = string
  default     = "ballance/warcrack"
}
