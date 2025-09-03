FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY LMS_Back_End/pom.xml ./pom.xml
RUN mvn -q -DskipTests dependency:go-offline
COPY LMS_Back_End/src ./src
RUN mvn -q -DskipTests clean package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS=""
COPY --from=build /app/target/*.jar /app/app.jar
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar --server.port=${PORT:-8080}"]
