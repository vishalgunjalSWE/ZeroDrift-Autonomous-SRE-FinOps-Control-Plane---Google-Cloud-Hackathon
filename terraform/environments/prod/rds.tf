module "rds_primary" {
  source         = "../../modules/rds"
  db_name        = "prod-postgres-main"
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnets
  
  # DRIFT INJECTED: Overprovisioned DB instance
  instance_class = "db.r5.12xlarge"
}