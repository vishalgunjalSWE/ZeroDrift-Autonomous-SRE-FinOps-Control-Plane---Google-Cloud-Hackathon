variable "db_instance_class" { type = string }
variable "db_name" { type = string }
variable "vpc_id" { type = string }

resource "aws_db_instance" "main" {
  allocated_storage    = 500
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = var.db_instance_class
  db_name              = var.db_name
  username             = "admin"
  password             = "supersecret"
  skip_final_snapshot  = true
  
  tags = {
    Name = var.db_name
    Criticality = "Tier-1"
  }
}
