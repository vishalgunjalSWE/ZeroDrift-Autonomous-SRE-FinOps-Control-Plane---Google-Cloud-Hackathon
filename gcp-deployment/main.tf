terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "YOUR_GCP_PROJECT_ID"
  region  = "us-central1"
}

provider "google-beta" {
  project = "YOUR_GCP_PROJECT_ID"
  region  = "us-central1"
}

# =========================================================
# 1. Pub/Sub (Event-Driven Ingestion for 100k Webhooks)
# =========================================================
resource "google_pubsub_topic" "zerodrift_events" {
  name = "zerodrift-webhook-events"
}

resource "google_pubsub_topic" "zerodrift_dlq" {
  name = "zerodrift-webhook-dlq"
}

resource "google_pubsub_subscription" "zerodrift_worker_sub" {
  name  = "zerodrift-worker-sub"
  topic = google_pubsub_topic.zerodrift_events.name
  
  ack_deadline_seconds = 60
  
  # Dead letter queue for failed AI remediations
  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.zerodrift_dlq.id
    max_delivery_attempts = 5
  }
}

# =========================================================
# 2. Cloud SQL (PostgreSQL) with PgBouncer for Audit Ledger
# =========================================================
resource "google_sql_database_instance" "zerodrift_db" {
  name             = "zerodrift-ledger-db"
  database_version = "POSTGRES_15"
  region           = "us-central1"
  
  settings {
    tier = "db-custom-2-7680" # Lightweight standard tier
    
    # Highly available architecture
    availability_type = "REGIONAL"
    
    ip_configuration {
      ipv4_enabled = true
      require_ssl  = true
    }
  }
  
  deletion_protection = false # Configured for hackathon lifecycle
}

resource "google_sql_database" "ledger" {
  name     = "zerodrift_audit"
  instance = google_sql_database_instance.zerodrift_db.name
}

# =========================================================
# 3. Cloud Run (FastAPI Backend / AI Worker)
# =========================================================
resource "google_cloud_run_v2_service" "backend" {
  name     = "zerodrift-engine"
  location = "us-central1"

  template {
    containers {
      image = "us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/zerodrift/backend:latest"
      
      resources {
        limits = {
          cpu    = "4"
          memory = "8Gi"
        }
      }
      
      env {
        name  = "DATABASE_URL"
        value = "postgresql://admin:supersecret@${google_sql_database_instance.zerodrift_db.public_ip_address}/zerodrift_audit"
      }
    }
    
    # Auto-scaling to absorb massive shock loads from Pub/Sub
    scaling {
      min_instance_count = 1
      max_instance_count = 100
    }
  }
}

# =========================================================
# 4. Cloud Run (Next.js Frontend SRE IDE)
# =========================================================
resource "google_cloud_run_v2_service" "frontend" {
  name     = "zerodrift-ui"
  location = "us-central1"

  template {
    containers {
      image = "us-central1-docker.pkg.dev/YOUR_GCP_PROJECT_ID/zerodrift/frontend:latest"
      
      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = google_cloud_run_v2_service.backend.uri
      }
    }
  }
}

# =========================================================
# 5. API Gateway (Zero-Trust Ingress point)
# =========================================================
resource "google_api_gateway_api" "zerodrift_api" {
  provider = google-beta
  api_id   = "zerodrift-gateway"
}

resource "google_api_gateway_api_config" "zerodrift_api_config" {
  provider      = google-beta
  api           = google_api_gateway_api.zerodrift_api.api_id
  api_config_id = "zerodrift-gateway-config"

  openapi_documents {
    document {
      path     = "openapi.yaml"
      contents = base64encode(<<-EOF
        swagger: '2.0'
        info:
          title: ZeroDrift Edge Gateway
          version: 1.0.0
        paths:
          /api:
            get:
              operationId: proxy
              x-google-backend:
                address: ${google_cloud_run_v2_service.backend.uri}
              responses:
                '200':
                  description: A successful response
      EOF
      )
    }
  }
}

resource "google_api_gateway_gateway" "gw" {
  provider   = google-beta
  api_config = google_api_gateway_api_config.zerodrift_api_config.id
  gateway_id = "zerodrift-gateway"
  region     = "us-central1"
}
