output "load_balancer_ip" {
  description = "Load Balancer IP Address"
  value       = google_compute_global_address.default.address
}

output "backend_cloud_run_url" {
  description = "Backend Cloud Run URL"
  value       = google_cloud_run_v2_service.backend.uri
}

output "frontend_cloud_run_url" {
  description = "Frontend Cloud Run URL"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.postgres.connection_name
}

output "database_private_ip" {
  description = "Cloud SQL private IP address"
  value       = google_sql_database_instance.postgres.private_ip_address
}

output "assets_bucket_name" {
  description = "Assets bucket name"
  value       = google_storage_bucket.assets.name
}

output "uploads_bucket_name" {
  description = "Uploads bucket name"
  value       = google_storage_bucket.uploads.name
}

output "vpc_network_name" {
  description = "VPC network name"
  value       = google_compute_network.vpc.name
}

output "ssl_certificate_domains" {
  description = "SSL certificate domains"
  value       = google_compute_managed_ssl_certificate.default.managed[0].domains
}
