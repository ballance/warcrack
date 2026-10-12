terraform {
  backend "s3" {
    bucket         = "ballance-terraform-state"
    key            = "services/warcrack-web.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
