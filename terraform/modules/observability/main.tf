resource "aws_grafana_workspace" "ops" {
  name                     = "sre-observability"
  account_access_type      = "CURRENT_ACCOUNT"
  authentication_providers = ["AWS_SSO"]
  permission_type          = "SERVICE_MANAGED"
}