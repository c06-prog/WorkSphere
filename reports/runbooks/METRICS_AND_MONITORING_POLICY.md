# Metrics and Monitoring Policy

## 1. Objective
Establish standard practices for system observability, metrics exposition, and endpoint protection across WorkSphere backend environments (Local, CI, Staging, Production).

## 2. Actuator Endpoint Exposure Standard
- Exposed endpoints are strictly limited to operational requirements:
  - `/actuator/health`: Health status and group indicators (`liveness`, `readiness`).
  - `/actuator/info`: Application build and version metadata.
  - `/actuator/prometheus`: OpenMetrics/Prometheus scraper endpoint.
- Prohibited from public exposure:
  - `/actuator/env`, `/actuator/configprops`, `/actuator/beans`, `/actuator/heapdump`, `/actuator/threaddump`, `/actuator/mappings`.
  - These endpoints must return 401 Unauthorized unless authenticated with super-admin privileges.

## 3. Metrics Retention and Collection
- Scraper: Prometheus scraper instances should query backend metrics at internal addresses (e.g., Docker service name `backend:8080/actuator/prometheus`).
- Default Scrape Interval: 15 seconds.
- Metric Families to Track:
  - `jvm_memory_used_bytes`, `jvm_gc_pause_seconds`: JVM Heap and Garbage Collection tracking.
  - `process_uptime_seconds`, `process_cpu_usage`: Process health and resource utilization.
  - `hikaricp_connections_active`, `hikaricp_connections_idle`: Database connection pool health.
  - `http_server_requests_seconds_count`, `http_server_requests_seconds_max`: API latency and traffic volume breakdown by URI, method, and status.

## 4. Security Principles
- Never emit sensitive payload data, credentials, authorization headers, or database passwords in custom metric tags.
- Detailed health information (`show-details`) must be set to `when-authorized` or `never` in production environments.
