-- phpMyAdmin SQL Dump
-- version 4.0.6
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Mar 04, 2014 at 12:28 AM
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
  UNIQUE KEY `PREVENT_DUPLICATES_TOKENS_INDEX` (`userID`,`clientID`) COMMENT 'Prevents multipes tokens for an app and an user',
  KEY `clientID` (`clientID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=116 ;

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

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
(7, 'CubbyHole Website', 'cubbyh_b1175f3f-9c52-4205-adfd-c9a63f7cbecb', 'df8b08e6-215f-49ac-86fa-1212e7c9e0e6', 'https://localhost:8443/loginCallback', 1, 1),
(9, 'CubbyHole Developer Center', 'cubbyh_28af8ca9-368e-4ce1-8586-e2690ead096f', 'd923c923-efa9-44bd-8980-eb541660b67e', 'https://localhost:8445/loginCallback', 0, 1);

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
  KEY `planId` (`planId`),
  KEY `planId_2` (`planId`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `Payments`
--

INSERT INTO `Payments` (`id`, `userId`, `planId`, `paymentId`, `amount`, `saleId`, `paymentTime`, `currency`) VALUES
(1, 1, 2, '87498494684', 5, '6564646451654', 1393366785, 'EUR'),
(2, 1, 3, '87498494684', 5, '6564646451654', 1390774785, 'EUR');

-- --------------------------------------------------------

--
-- Table structure for table `Plans`
--

CREATE TABLE `Plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `planNumber` int(11) NOT NULL,
  `name` text NOT NULL,
  `pricePerMonth` int(11) NOT NULL,
  `bandwidthPerDay` text NOT NULL,
  `diskSpace` text NOT NULL,
  `logsHistory` text NOT NULL,
  `support` text NOT NULL,
  `dateAdded` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `Plans`
--

INSERT INTO `Plans` (`id`, `planNumber`, `name`, `pricePerMonth`, `bandwidthPerDay`, `diskSpace`, `logsHistory`, `support`, `dateAdded`) VALUES
(1, 1, 'Free', 0, 'b_500m', 'd_250m', 'l_0', 's_t', 1393276022),
(2, 2, 'Basic', 5, 'b_2g', 'd_1g', 'l_1w', 's_tm', 1393276022),
(3, 3, 'Premium', 20, 'b_15g', 'd_6g', 'l_6m', 's_tp', 1393276022),
(4, 4, 'Enterprise', 50, 'b_u', 'd_u', 'l_1y', 's_tp', 1393276022);

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
  `social_id` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_MAIL` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=55 ;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `password`, `email`, `name`, `social_type`, `social_id`) VALUES
(0, '$2a$10$KOuEH0nbB4rw8ABgsDWWtu8faO/WVJCz9avDsV1iYVWMxzah8rjza', 'admin@mail.com', 'admin', NULL, NULL),
(1, '$2a$10$qUq0NHXqei7QCF42gXdH7.FZHbgriukTE008Zyw7I27zv/HlOz5J2', 'bob@mail1.com', 'bobyd', NULL, NULL),
(53, '$2a$10$8i5y5ZuSklcri0GQxiCrme8l0Dm0dGJgCFulOaDiR4AlSUNbq8zsy', 'clear_sky@hotmail.fr', 'Alexis Chevalier', 'FACEBOOK', '1556201368'),
(54, '$2a$10$LHXtk3mP/cOeUrIMEmVE/uPy182V21aEvTvAyptiw0SkCIU4ZrUlK', 'alexis.chevalier.wtf@gmail.com', 'LOL', NULL, NULL);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `AccessTokens`
--
ALTER TABLE `AccessTokens`
  ADD CONSTRAINT `ACCESS_TOKEN_IS_OWNED_BY_A_CLIENT` FOREIGN KEY (`clientID`) REFERENCES `Clients` (`id`);

--
-- Constraints for table `Payments`
--
ALTER TABLE `Payments`
  ADD CONSTRAINT `PREVENT_PAIMENT_DELETION_ON_PLAN_DELETION` FOREIGN KEY (`planId`) REFERENCES `Plans` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `PREVENT_PAIMENT_DELETION_ON_USER_DELETION` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
