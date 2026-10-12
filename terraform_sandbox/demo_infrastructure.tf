# ZeroDrift Optimized Demo Patch (SIMULATION TARGET)
provider "aws" {
  region = "us-east-1"
}

provider "google" {
  project = "zerodrift-prod"
  region  = "us-central1"
}

resource "aws_instance" "web_frontend" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"

  tags = {
    Name        = "ZeroDrift-Demo-Frontend"
    Environment = "production"
    ManagedBy   = "ZeroDrift-Simulation"
  }
}

resource "aws_ebs_volume" "analytics_storage" {
  availability_zone = "us-east-1a"
  size              = 500
  type              = "gp3"
}

resource "google_compute_instance" "analytics_worker" {
  name         = "analytics-worker-prod"
  machine_type = "e2-medium"
  zone         = "us-central1-a"
}