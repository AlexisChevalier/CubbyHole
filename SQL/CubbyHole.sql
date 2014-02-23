-- phpMyAdmin SQL Dump
-- version 4.0.6
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 23, 2014 at 02:17 AM
-- Server version: 5.5.33
-- PHP Version: 5.5.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `CubbyHole`
--

-- --------------------------------------------------------

--
-- Table structure for table `AccessTokens`
--

CREATE TABLE `AccessTokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `clientID` int(11) NOT NULL,
  `token` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PREVENT_DUPLICATES_TOKENS_INDEX` (`userID`,`clientID`) COMMENT 'Prevents multipes tokens for an app and an user'
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=56 ;

--
-- Dumping data for table `AccessTokens`
--

INSERT INTO `AccessTokens` (`id`, `userID`, `clientID`, `token`) VALUES
(42, 1, 7, 'WD2CZhlPwGGaJ7kPyR6wv5AXCvjPuFRuckwXEJZDJyQCaGqbuqqXklrM0dlQxo8EfqChZcH46UmovxhyJfW31yjLyr4pydpVlQLiOIthcoiIXgmsrarKH3btsFzK7ighSftnVGVCLE40F6sNijfeCEu1y6PbsK3rU6tZrItJRFMCSjv1lEXn2DiTZCIBTAEL2IgMI8tD2HnLCfVXcHtNyvVF0wkG3CaZzhnhCwFjbzUAX67Zh8eZzPyCw2PiIxMB'),
(50, 23, 7, '0yKf5puyE992da6oOMR7ILFjza6c6tlISbQa686dZyIRmsJOrwsv44N9u38dPgHDvMQLsavpfBxomllmRbJyfgQvVMCw3cZBIJ82DjbNQWUSAsuR0x0c39VIYzxGKJejHbncSL3tjLDfgmdhwjqb9u7nlUaV26pLqS6eAMmVLzgNfUoeihWNbdu4JkrKKF7gZTdnbkk6qcQFL5DFgjloCzpvbq4vTSwinlS1yWTglc37KMWTVniN1MtJI9Iu8jdP'),
(51, 24, 7, 'swK7uCeeFta5KdhA9FFVVaAA4ekCQSQYnmAoH47mFne4rAVeTJcKH1Da4ip36c9vCtfy8OlOj8qlEhPbabx8pvUYmigfnCLetHYj2mECzmaB0eEwgKniMtVUim6AoWn8cawPDd8sxicVvF5EIDkXMujmFyP5Fx2dZuFjt9xSG4FR2pAJI0BBh1nmqHtLbbLVQ9Y4uKbqlpYdYc8iD8VySciIdKvm9unPfE2dQccZH8PDs4COemTWh0cXX10CtEYi'),
(52, 25, 7, 'B35mWQ80n3KlkMQK5gX7M8Om7yRkZa2IJKv1ZFwZ79Mg1aJuKQVwwNEH7JNojCZQqcV3kKiO9mF9wiMpVzBx09QKTGlU1n94km0zGR62ZkBQAPRJFcjgEWzgAjjcnaDL06308Hndj9onXofiTswoaF4rLmAUIC1z1zQy4DEtJxcjVhYbK2V7Yti161mY2MJx7raqwJYxUcytILcPeickk56mAxMunm4DfXh9cP8AqP3PKWCYdmRO5gPWIEz8cQ17'),
(53, 26, 7, 'azLTJuQY2wX0zm7FPXsCGXXmJtZNp9cVJIOvLFXiR6Qir5BxqeF7Rj8o2xr0c6ntM6yFkRBRJYCWhbyW93lYA8FpJDY8QQlmo8ut2Ml6mCVdwiI9IVPtOmDrPKhc1EdCFO3oCzlF41PraLxkUO9D8tVr8mkT9kxfhxEYaw7crp6sf328UeXfNSuo9e6M6cLjM5dlkyntXOUgOTIoHvQ9aqIIbmn2l0EQlCrRFA0MFi1z2xIwgu8LgVQeqLyPWPwE'),
(54, 27, 7, 'NjNDxjc8kmEO7F2lNHvTY1QHCDAmclihTidlTRJyKfS4ReUVj0Vc93Jo7tZLE1gGt6666G4j9tB8HefTMAHGsXwIMVKytkMaGg7j5EpWUzVR9yPZCsA7cWWa8cuHOjOVxFN8HWnJW2Z3tWVa7Nfze13kj1rsC7fIOd5IJlTxtmjYyneL9DHZAc4NvrSYYpbNhGico2iqdbVPbasKqr9EiBlp0nX6HspFAFgUGKEw1ssnKxkBt1m9ibPKh306rB16'),
(55, 28, 7, 't5sscnzIXrqVklmtiUDGvZz4HWdW1dnHGUaUGDhJkHN1U0Ovc1blc3dyNR4TFBzApm4OoJgwa0hwxXYMTwAwT3oOXiyhZLtAJl4DWg1n5UrBApjdUAOoReYsZK3nFDbqCzLwIGU9KbmNF5NfysriBvsXRckXqUFTCYciw1DEMHLT2BqBCyeubmQ0R44ffMo742vM1qI2dwYeaNeQ154F4xGoshQeLxs993LlG0hxbpvYefxc25HVtqGBsfQH3K2f');

-- --------------------------------------------------------

--
-- Table structure for table `AuthorizationCodes`
--

CREATE TABLE `AuthorizationCodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clientID` int(11) NOT NULL,
  `redirectURI` text NOT NULL,
  `userID` int(11) NOT NULL,
  `code` text NOT NULL,
  `timeCreated` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PREVENT_DUPLICATES_CODES_INDEX` (`clientID`,`userID`) COMMENT 'Prevents multipes codes for an app and an user'
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=124 ;

-- --------------------------------------------------------

--
-- Table structure for table `Clients`
--

CREATE TABLE `Clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `clientId` text NOT NULL,
  `clientSecret` text NOT NULL,
  `redirect_uri` text NOT NULL,
  `dialog_disabled` int(11) NOT NULL DEFAULT '0',
  `userID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_NAME` (`name`(500)),
  UNIQUE KEY `UNIQUE_CLIENTID` (`clientId`(500))
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=9 ;

--
-- Dumping data for table `Clients`
--

INSERT INTO `Clients` (`id`, `name`, `clientId`, `clientSecret`, `redirect_uri`, `dialog_disabled`, `userID`) VALUES
(1, 'Heavenstar', '8af2ab46-ca25-4339-a93e-a709cd8825c9', 'bb5547f8-5e77-4bf6-b496-570e3b50ea20', 'https://localhost:8444', 0, 0),
(2, 'CubbyHole Website', 'cubbyh_bbda45a6-99d3-4313-bc86-7121d3ea52d3', '23491abc-89fb-4b00-a6b1-2093fd0b0021', 'https://localhost:8443', 0, 0),
(3, 'Test', 'test_35701cd7-6cdc-4f14-b907-41f28b621f95', '5607d031-f37a-489f-b0f9-2f4a584c3816', 'https://localhost:8443', 0, 1),
(5, 'Test2', 'test2_52519769-0793-4b47-9844-c934bd0cf7e6', '53d08c55-648a-4026-b656-f6db8a4e82e5', 'https://localhost:8443', 0, 1),
(7, 'CubbyHole_Website', 'cubbyh_b1175f3f-9c52-4205-adfd-c9a63f7cbecb', 'df8b08e6-215f-49ac-86fa-1212e7c9e0e6', 'https://localhost:8443/loginCallback', 1, 1),
(8, 'LULULTEST', 'lulult_fb2cc780-d9a2-492a-aaca-db2996e103fb', '208993db-d2da-4192-ad24-490666b6d551', 'https://localhost:8443', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `Payments`
--

CREATE TABLE `Payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `planId` int(11) NOT NULL,
  `paymentId` text NOT NULL,
  `amount` int(11) NOT NULL,
  `saleId` text NOT NULL,
  `paymentTime` int(11) NOT NULL,
  `currency` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `planId` (`planId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Plans`
--

CREATE TABLE `Plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `planNumber` int(11) NOT NULL,
  `name` text NOT NULL,
  `pricePerMonth` int(11) NOT NULL,
  `bandwidthPerDay` int(11) NOT NULL,
  `diskSpace` int(11) NOT NULL,
  `logsHistory` int(11) NOT NULL,
  `support` int(11) NOT NULL,
  `dateAdded` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` text NOT NULL,
  `social_type` text,
  `social_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_MAIL` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=29 ;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `password`, `email`, `name`, `social_type`, `social_id`) VALUES
(0, '$2a$10$KOuEH0nbB4rw8ABgsDWWtu8faO/WVJCz9avDsV1iYVWMxzah8rjza', 'admin@mail.com', 'admin', NULL, NULL),
(1, '$2a$10$XhtNYNDBS3Y64xCYcKyp7epgE0C5vsFwyz.QuP1HHia6M/7ccQL3G', 'bob@mail.com', 'bob', NULL, NULL),
(2, '$2a$10$y85lQvukdohsvr7d63qQCOXLaNxB1Hcazapgvl8I6vB/xgieD0ThW', 'joe@mail.com', 'joe', NULL, NULL),
(21, '$2a$10$/0TrcUZmJrK2KZnig/fqAO3MGCQnVq4x8Dkt9smEhAigUULaCX2L.', 'test@test.fr', 'test', NULL, NULL),
(22, '$2a$10$w9w8k5cPo1tZdO4qzhglcOa0pRXTVKVqWJ8.QejIaMVcgBuVn6Yn2', 'andoine.de.padoue@gmail.com', 'Antoine De Padoue', NULL, NULL),
(28, '$2a$10$Z8en59S30jSZn85lsVn6fOp1g6hRvYwvzqVaD9yV4BF1RJwnSC18O', 'alexis.chevalier.wtf@gmail.com', 'Alexis Chevalier', NULL, NULL);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Payments`
--
ALTER TABLE `Payments`
  ADD CONSTRAINT `PREVENT_PAIMENT_DELETION_ON_PLAN_DELETION` FOREIGN KEY (`planId`) REFERENCES `Plans` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `PREVENT_PAIMENT_DELETION_ON_USER_DELETION` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
