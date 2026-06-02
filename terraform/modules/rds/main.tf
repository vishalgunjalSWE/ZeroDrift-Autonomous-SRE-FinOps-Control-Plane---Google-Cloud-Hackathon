resource "aws_db_subnet_group" "main" {
  name       = "${var.db_name}-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "postgres" {
  identifier           = var.db_name
  engine               = "postgres"
  engine_version       = "14.7"
  instance_class       = var.instance_class
  allocated_storage    = 500
  db_subnet_group_name = aws_db_subnet_group.main.name
  skip_final_snapshot  = true
}