FROM --platform=linux/amd64 openjdk:8-jdk-alpine
VOLUME /tmp
COPY target/springboot-application-aws.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]