provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Service   = "warcrack-web"
      ManagedBy = "terraform"
      Owner     = "ballance"
    }
  }
}
