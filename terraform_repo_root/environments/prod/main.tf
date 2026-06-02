# Production Infrastructure
# Managed by Enterprise DevOps Team

module "vpc" {
  source      = "../../modules/vpc"
  vpc_cidr    = "10.0.0.0/16"
  environment = "prod"
}

module "eks" {
  source        = "../../modules/eks"
  cluster_name  = "prod-eks-cluster"
  vpc_id        = module.vpc.vpc_id
  desired_nodes = 5
}

module "rds" {
  source            = "../../modules/rds"
  db_name           = "zerodrift_prod_db"
  vpc_id            = module.vpc.vpc_id
  
  # INTENTIONAL CLOUD WASTE / DRIFT CONFIGURATION:
  # This instance is massively over-provisioned.
  # ZeroDrift AST parser should identify this parameter
  # and the Gemini reasoning engine should flag this as 
  # excessive FinOps waste given the metrics.
  db_instance_class = "db.r5.12xlarge" 
}
