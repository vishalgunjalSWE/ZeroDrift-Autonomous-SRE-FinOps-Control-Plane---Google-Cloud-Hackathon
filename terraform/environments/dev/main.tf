module "vpc" {
  source      = "../../modules/vpc"
  environment = "dev"
  vpc_cidr    = "10.1.0.0/16"
}

module "eks_cluster" {
  source             = "../../modules/eks"
  cluster_name       = "dev-eks-01"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnets
  
  node_instance_type = "t3.medium"
  desired_capacity   = 2
}