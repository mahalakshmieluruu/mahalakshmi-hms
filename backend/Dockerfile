FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget && \
    addgroup -S hmsgroup && adduser -S hmsuser -G hmsgroup && \
    mkdir -p /app/secure-storage/reports && \
    chown -R hmsuser:hmsgroup /app
COPY --from=build /app/target/mahalakshmi-hms-1.0.0.jar app.jar
USER hmsuser
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=25s --retries=5 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
