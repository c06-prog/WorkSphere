# ==============================================================================
# WorkSphere Backend - Multi-stage Dockerfile
# Target: Java 21 LTS Spring Boot Executable JAR
# Non-root runtime with healthcheck support
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Package (Maven JDK 21)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /workspace

# Step 1: Copy Maven Wrapper, POM, and build configs first for layer caching
COPY mvnw ./
COPY .mvn ./.mvn
COPY pom.xml ./
COPY checkstyle.xml ./

# Normalize line endings and ensure execution permission for wrapper
RUN sed -i 's/\r$//' ./mvnw && chmod +x ./mvnw

# Step 2: Download dependencies offline layer
RUN ./mvnw dependency:go-offline -B

# Step 3: Copy full source and build application JAR (skipping unit/integration tests)
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Runtime Environment (JRE 21)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre AS runner

# Security: Create non-root group and user (UID/GID 10001)
RUN groupadd -g 10001 worksphere && \
    useradd -u 10001 -g worksphere -s /bin/false -m -d /app worksphere

WORKDIR /app

# Create writable upload directory and set ownership to non-root user
RUN mkdir -p /app/uploads && \
    chown -R worksphere:worksphere /app

# Copy executable Spring Boot JAR from builder stage
COPY --from=builder --chown=worksphere:worksphere /workspace/target/backend-0.0.1-SNAPSHOT.jar /app/app.jar

# Switch to non-root user
USER worksphere

# Expose standard application port
EXPOSE 8080

# Environment defaults (non-sensitive only)
ENV SERVER_PORT=8080 \
    WORKSPHERE_STORAGE_PATH=/app/uploads \
    JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Built-in Container Healthcheck using curl (available in Ubuntu-based Temurin JRE)
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://127.0.0.1:8080/actuator/health || exit 1

# Deterministic exec-form entrypoint
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
