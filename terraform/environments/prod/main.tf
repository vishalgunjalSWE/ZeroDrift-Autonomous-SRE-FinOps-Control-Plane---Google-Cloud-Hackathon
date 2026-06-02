module "vpc" {
  source      = "../../modules/vpc"
  environment = "prod"
  vpc_cidr    = "10.0.0.0/16"
}

module "eks_cluster" {
  source             = "../../modules/eks"
  cluster_name       = "prod-eks-01"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnets
  
  # DRIFT INJECTED: This is severely overprovisioned for the current traffic load
  node_instance_type = "m5.4xlarge"
  desired_capacity   = 10
}

module "observability" {
  source = "../../modules/observability 1111"
}