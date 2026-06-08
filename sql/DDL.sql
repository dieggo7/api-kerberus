-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema corrida_db
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `corrida_db` ;

-- -----------------------------------------------------
-- Schema corrida_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `corrida_db` DEFAULT CHARACTER SET utf8 ;
USE `corrida_db` ;

-- -----------------------------------------------------
-- Table `corrida_db`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `corrida_db`.`users` ;

CREATE TABLE IF NOT EXISTS `corrida_db`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `corrida_db`.`corredores`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `corrida_db`.`corredores` ;

CREATE TABLE IF NOT EXISTS `corrida_db`.`corredores` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `turma` VARCHAR(255) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `corrida_db`.`voltas`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `corrida_db`.`corridas` ;

CREATE TABLE IF NOT EXISTS `corrida_db`.`corridas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tempo` DECIMAL(10,2) NULL,
  `voltas` INT NOT NULL, 
  `corredores_id` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_voltas_corredores_idx` (`corredores_id` ASC) VISIBLE,
  CONSTRAINT `fk_voltas_corredores`
    FOREIGN KEY (`corredores_id`)
    REFERENCES `corrida_db`.`corredores` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
