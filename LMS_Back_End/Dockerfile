# --- build jar ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests clean package

# --- run jar ---
FROM eclipse-temurin:24-jre-alpine
WORKDIR /app
# App config via env (set in compose)
ENV SPRING_PROFILES_ACTIVE=prod
COPY --from=build /app/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]


