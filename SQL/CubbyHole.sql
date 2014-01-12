-- phpMyAdmin SQL Dump
-- version 4.0.6
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 12, 2014 at 02:17 AM
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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;

--
-- Dumping data for table `AccessTokens`
--

INSERT INTO `AccessTokens` (`id`, `userID`, `clientID`, `token`) VALUES
(6, 1, 2, '4347zTKBWomirfhgBZ9n7EDXNtmRMFdHf6FurBpyK2GSZ1bMLNO5g6cUOlWJgvjWp1BlvjSYhQD3L5UVDQ07PaaiuNcSqmUic1D282QGdqBvGbIix4wgXytxvpgqShN7bJV2XFxEg6yqJcWFxl9vR0is81mJeSwYYBUoyWWdaXURgjF8MMW8oJcwUtpRSoHCL5WZJ5mKQp1JvgbCF0uwEk1NykCctKjQfWAXO13syYokb3g2EzZ4S1lgedeghtA5');

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=39 ;

--
-- Dumping data for table `AuthorizationCodes`
--

INSERT INTO `AuthorizationCodes` (`id`, `clientID`, `redirectURI`, `userID`, `code`, `timeCreated`) VALUES
(37, 2, 'https://localhost:8443', 1, 'uN5qFljXT55OsieP', 1389485048);

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `Clients`
--

INSERT INTO `Clients` (`id`, `name`, `clientId`, `clientSecret`, `redirect_uri`, `dialog_disabled`, `userID`) VALUES
(1, 'Heavenstar', '8af2ab46-ca25-4339-a93e-a709cd8825c9', 'bb5547f8-5e77-4bf6-b496-570e3b50ea20', 'https://localhost:8444', 0, 0),
(2, 'CubbyHole Website', 'cubbyh_bbda45a6-99d3-4313-bc86-7121d3ea52d3', '23491abc-89fb-4b00-a6b1-2093fd0b0021', 'https://localhost:8443', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` text NOT NULL,
  `social_type` text,
  `social_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_MAIL` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=23 ;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `password`, `email`, `name`, `social_type`, `social_id`) VALUES
(0, '$2a$10$KOuEH0nbB4rw8ABgsDWWtu8faO/WVJCz9avDsV1iYVWMxzah8rjza', 'admin@mail.com', 'admin', NULL, NULL),
(1, '$2a$10$XhtNYNDBS3Y64xCYcKyp7epgE0C5vsFwyz.QuP1HHia6M/7ccQL3G', 'bob@mail.com', 'bob', NULL, NULL),
(2, '$2a$10$y85lQvukdohsvr7d63qQCOXLaNxB1Hcazapgvl8I6vB/xgieD0ThW', 'joe@mail.com', 'joe', NULL, NULL),
(21, '$2a$10$/0TrcUZmJrK2KZnig/fqAO3MGCQnVq4x8Dkt9smEhAigUULaCX2L.', 'test@test.fr', 'test', NULL, NULL);
