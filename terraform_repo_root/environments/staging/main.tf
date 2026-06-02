# Staging Infrastructure
# Ephemeral, used for CI/CD integration tests

module "vpc" {
  source      = "../../modules/vpc"
  vpc_cidr    = "10.1.0.0/16"
  environment = "staging"
}

module "eks" {
  source        = "../../modules/eks"
  cluster_name  = "staging-eks-cluster"
  vpc_id        = module.vpc.vpc_id
  desired_nodes = 2
}

module "rds" {
  source            = "../../modules/rds"
  db_name           = "zerodrift_staging_db"
  vpc_id            = module.vpc.vpc_id
  db_instance_class = "db.t3.medium"
}
