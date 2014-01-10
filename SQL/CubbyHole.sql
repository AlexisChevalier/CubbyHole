-- phpMyAdmin SQL Dump
-- version 4.0.6
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 09, 2014 at 12:34 AM
-- Server version: 5.5.33
-- PHP Version: 5.5.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `AccessTokens`
--

INSERT INTO `AccessTokens` (`id`, `userID`, `clientID`, `token`) VALUES
(2, 1, 1, 'BJZURMrBY2lhZw1EHvMXjtgdIFf9aT4bTruwJsDvxxzwWuVnEikOXohHBAe1lx2Ilr3cOdwV691aha8ZB66F6O70uQQ6wuoRDxXb2JId28rcOw7ianS7otGFfsXdxi7jfVOqc9DNGsfhJBmklRqpuqz5jTVQnK3RQukFEhewLAwEgR7zekoBL29MJTrdziUScZAy2dIZC3KjPQfUVbkC7C02KHnOxKw93Aai0R7nmj8gPXaC5Xwd9JWPors5ylD8');

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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=29 ;

-- --------------------------------------------------------

--
-- Table structure for table `Clients`
--

CREATE TABLE `Clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `clientId` text NOT NULL,
  `clientSecret` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `Clients`
--

INSERT INTO `Clients` (`id`, `name`, `clientId`, `clientSecret`) VALUES
(1, 'Heavenstar', '8af2ab46-ca25-4339-a93e-a709cd8825c9', 'bb5547f8-5e77-4bf6-b496-570e3b50ea20');

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `username`, `password`, `email`, `name`) VALUES
(1, 'bob', '$2a$10$XhtNYNDBS3Y64xCYcKyp7epgE0C5vsFwyz.QuP1HHia6M/7ccQL3G', 'bob@mail.com', 'bob'),
(2, 'joe', '$2a$10$y85lQvukdohsvr7d63qQCOXLaNxB1Hcazapgvl8I6vB/xgieD0ThW', 'joe@mail.com', 'joe');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
