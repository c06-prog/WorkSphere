# Metrics and Monitoring Policy

## 1. Objective
Establish standard practices for system observability, metrics exposition, and endpoint protection across WorkSphere backend environments (Local, CI, Staging, Production).

## 2. Scope & Status Boundaries
- `MONITORING_SCOPE = LOCAL_INTERNAL_ONLY`
- `GRAFANA = DEFERRED`
- `ALERTING = DEFERRED`
- `STAGING_SECURITY_POLICY = NOT YET IMPLEMENTED`

## 3. Actuator Endpoint Exposure Standard
- Exposed endpoints are strictly limited to operational requirements:
  - `/actuator/health`: Health status and group indicators (`liveness`, `readiness`).
  - `/actuator/info`: Application build and version metadata.
  - `/actuator/prometheus`: OpenMetrics/Prometheus scraper endpoint.
- Strictly prohibited from public exposure:
  - `/actuator/env`, `/actuator/configprops`, `/actuator/beans`, `/actuator/mappings`, `/actuator/heapdump`, `/actuator/threaddump`, `/actuator/loggers`, `/actuator/shutdown`.
  - These endpoints must return `401 Unauthorized` unless authenticated with administrative credentials.

## 4. Metrics Retention, Collection & Network Safety
- **Internal Only**: The Prometheus metrics endpoint (`/actuator/prometheus`) is designed solely for local and internal network scraping. It is **NOT** Internet-safe and must never be exposed publicly without reverse proxy authentication, API gateway controls, or strict private subnet isolation.
- **Scraper Configuration**: Prometheus scraper instances query backend metrics at internal addresses (e.g., Docker service name `backend:8080/actuator/prometheus`).
- **Scrape Credentials**: No credentials, passwords, or tokens are required or permitted in `prometheus.yml`.
- **Default Scrape Interval**: 15 seconds (job default: 10s).
- **Core Metric Families Tracked**:
  - `jvm_memory_used_bytes`, `jvm_gc_pause_seconds`: JVM Heap and Garbage Collection tracking.
  - `process_uptime_seconds`, `process_cpu_usage`: Process health and resource utilization.
  - `hikaricp_connections_active`, `hikaricp_connections_idle`: Database connection pool health.
  - `http_server_requests_seconds_count`, `http_server_requests_seconds_max`: API latency and traffic volume breakdown by URI, method, and status.

## 5. Security & Sensitive Data Principles
- Never emit sensitive payload data, credentials, authorization headers, or database passwords in custom metric tags or logs.
- Detailed health information (`show-details`) must be set to `when-authorized` or `never` in production environments.
