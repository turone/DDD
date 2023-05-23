CREATE TABLE `users` ( `id` BIGINT AUTO_INCREMENT, `login` VARCHAR(255) NOT NULL, `password` VARCHAR(255) NOT NULL, PRIMARY KEY (`id`), UNIQUE INDEX akUsersLogin (`login`) );

CREATE TABLE `session` (  `id` BIGINT AUTO_INCREMENT,  `user` BIGINT NOT NULL,  `token` VARCHAR(64) NOT NULL,  `ip` VARCHAR(45) NOT NULL,  `data` TEXT,  PRIMARY KEY (`id`),  UNIQUE INDEX akSession (`token`),  FOREIGN KEY (`user`) REFERENCES `users` (`id`) ON DELETE CASCADE);

CREATE TABLE `country` (
  `id` BIGINT AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX akCountry (`name`)
);

CREATE TABLE `city` (
  `id` BIGINT AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `country` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX akCity (`name`),
  FOREIGN KEY (`country`) REFERENCES `country` (`id`) ON DELETE CASCADE
);
