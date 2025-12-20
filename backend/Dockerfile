# Sử dụng Maven để build (nếu bạn chưa build jar) hoặc copy file jar đã build
FROM openjdk:17-jdk-alpine
VOLUME /tmp
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]