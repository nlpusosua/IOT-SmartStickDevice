# Sử dụng Maven để build (nếu bạn chưa build jar) hoặc copy file jar đã build
FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]

## --- Giai đoạn 1: Dùng Maven để Build code Java sang file .jar ---
#FROM maven:3.8.5-openjdk-17 AS build
#WORKDIR /app
#
## Copy file pom.xml và tải thư viện về trước (để tận dụng cache)
#COPY pom.xml .
#RUN mvn dependency:go-offline -B
#
## Copy toàn bộ source code (bao gồm file SecurityConfig bạn vừa sửa)
#COPY src ./src
#
## Chạy lệnh build (tạo ra file .jar mới tinh)
#RUN mvn clean package -DskipTests
#
## --- Giai đoạn 2: Chạy ứng dụng ---
#FROM eclipse-temurin:17-jdk-alpine
#WORKDIR /app
#
## Copy file .jar VỪA MỚI BUILD xong ở giai đoạn 1 sang đây
#COPY --from=build /app/target/*.jar app.jar
#
#ENTRYPOINT ["java","-jar","app.jar"]