variable "cluster_name" { type = string }
variable "vpc_id" { type = string }
variable "desired_nodes" { 
  type = number 
  default = 3
}

resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = "arn:aws:iam::123456789012:role/eks-cluster-role"

  vpc_config {
    subnet_ids = ["subnet-abcde123", "subnet-fghij456"]
  }
}

resource "aws_eks_node_group" "workers" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.cluster_name}-workers"
  node_role_arn   = "arn:aws:iam::123456789012:role/eks-node-role"
  subnet_ids      = ["subnet-abcde123", "subnet-fghij456"]

  scaling_config {
    desired_size = var.desired_nodes
    max_size     = 10
    min_size     = 2
  }
}
