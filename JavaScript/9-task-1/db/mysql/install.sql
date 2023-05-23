DROP DATABASE IF EXISTS example;
DROP USER IF EXISTS marcus;
CREATE USER 'marcus'@'localhost' IDENTIFIED BY 'password';
CREATE DATABASE example OWNER marcus;
GRANT ALL PRIVILEGES ON example.* TO marcus

