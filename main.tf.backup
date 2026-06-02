provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web_frontend" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.2xlarge"
  tags = {
    Name = "Wasteful-Frontend"
  }
}

resource "aws_ebs_volume" "legacy_storage" {
  availability_zone = "us-east-1a"
  size              = 500
  type              = "gp2"
}

provider "google" {
  project = "zerodrift-enterprise"
  region  = "us-central1"
}

resource "google_compute_instance" "data_processor" {
  name         = "legacy-data-proc"
  machine_type = "n1-standard-8"
  zone         = "us-central1-a"
  
  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }
  
  network_interface {
    network = "default"
  }
}
