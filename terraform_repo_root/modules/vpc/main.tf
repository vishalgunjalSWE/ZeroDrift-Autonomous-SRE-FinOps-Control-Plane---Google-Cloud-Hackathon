variable "vpc_cidr" {
  description = "CIDR block for the enterprise VPC"
  type        = string
}

variable "environment" {
  description = "Environment name (prod/staging)"
  type        = string
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "zerodrift-${var.environment}-vpc"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

output "vpc_id" {
  value = aws_vpc.main.id
}
