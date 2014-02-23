-- phpMyAdmin SQL Dump
-- version 4.0.6
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 23, 2014 at 11:24 PM
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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=110 ;

--
-- Dumping data for table `AccessTokens`
--

INSERT INTO `AccessTokens` (`id`, `userID`, `clientID`, `token`) VALUES
(42, 1, 7, 'VwndUUBwhw6zsx7SDsFP9ED9441SSegSf6aBxUO2Qjld2c2dly86K4LG6dENo4lxlPDoZRhX8EgyXvsHcG1La9coiVvRTQWM1sKRX3YRGaquSyVTlWAcZMZV482PZMg8TZNjOQsUq6trYFonUx7f55l5fSK9eDOXYJRYdx2NWWvk3Ys7zNk9WaoE5MozKmBQ6LyvD94AdLSf6Yk1AXOMBXd4IG1GSMzDl4Eb4Y80bm4pzXEKq1qVmQCPYHdNOQik'),
(62, 45, 7, 'mJNDXZ24YKLt36m8jgNFK89KcVlJ2VDKoEEHsqlPsR6xhdjIQXRy3lTosIzaTGTTptouTxUToC6ms0ugwzzdvEPZmX6cOgZjN2g4RT7l06qfE0yRBrkxqhFlhrRgqkLUXjkx8WYZOW742n1rjor844BPcGbKtTO9opVM3A15iSq0kSe2ZHVAQr7KkkoOGLYf9sQD3yCrjChzNJwsO7DFlEzLmL1voJwLCw36KSdF2d3gXLcYyp2gvh3MFE2rQVP0'),
(65, 46, 7, 'qriDxCL81jDxPOK5zwKN4km7q9v8nVQ0IMA0p1JNpeQ1Eh9rHqzujKcGrOwGNEaUsVnIcmeiKlYp6iUl2lmoYZNzhTILXkSsWEEfjjLFr7dln65LTxgbjtrbfhWsegja3ITNcC5LBKSUzSv2cpru1apKEIvei9Uf17oMCVebJwc64yPwpd9u0rQfAZXwxhZn5sCZCAyQh40u8ucrNST3tMlyUf2ROCoszMXtGFW0atVYDEoAQ2IqAZwsbFUWp70l'),
(70, 48, 7, 'TmpRWSKqPF6bJKh4nqp54KrJ6zWli1lVcoySmmrvAFatSOzkl0yqoInSWDhYqtDSUP5nH1krVJRsgsrhpAx2Rs5Tqs5PHSS1OJj7G9lcVNw9VJlLAn9y08whFJPPWf7K1MXRN7nR9mKxqkG2MXyi3OyKxy2aZTlFeRZITMVRsvVjmT6Vfuevb8RFxbL3VelPzAiFDuXmhmKVQY6hlsMdUJMMawTGjq7wbQUWNYFMzeMJ64v3rlVwWiAV6xyzVkZ0'),
(99, 51, 7, 'lhmesJDmsqrOCkjSDvkqJXpNKRQ63aBjP4X77jxIrbDgoKaEbMGJcrxGvZ0RZ7wXwlY6iEH8BkLcSyGhrV6VVDJxLcfTeA7QuWZuQBNcOfP7cj4x29eggxKYHA1FV4dpdY3aVIxavyUZDaFau5SICjtJz7Ar1fvFkvknI1izv6ftWLPG9hWTjdd57S7SgOb4TTyD7RcvMAjzFBXmbClYzIGbRPaeLsxrrVuyn1cfxMLUvTacQGTLllk9i488U0rE'),
(108, 52, 7, 'Uo6QOBwYue4fKEfHDZqHnBU3Cd2d97J5Npse4Yul13jubGVcSNVaHPXpuUHb63WlEqbdAPeYyOBGpCcK9B5OoRUXiTJcvDU60Osxr5LZclcJUXIFj1125yTaE5mI2rOjhGM0ajKqU32B9f3lzeU25OLexQ9Hl5aBv0Q8x1D3ISwDEeFMfOb8jf3RcUInrOMUaCjJBdhrwBvStJe8qjivwYuhdkiZ9flrxFa5IK8an7blXNyMM3rHQKoUjBBF34NL'),
(109, 53, 7, 'XKWg86crIQu1SfN8cRjVFY3js4EiTAjWG3IunD9xnWNr1zq1V0frOEwBQ413pfmbgFL3FcTv1F7ZgX1NcbetRWkAgAx5CG8fx4jgmUhpMAOXe1iVdkbEVX1p3sB9i81a3Q3vieGf1JCeWW3EJprHlNklLHVsRDQq1UWDDTQd175SOs7MQNfHiNwIL4fKuVL4adZ9PeTfwEBXNISOEVbvAD5xGoql2c9277bZFaCQIBgEhgqkxqy5E1Sb06cRWWFH');

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=251 ;

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
  `social_id` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_MAIL` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=54 ;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `password`, `email`, `name`, `social_type`, `social_id`) VALUES
(0, '$2a$10$KOuEH0nbB4rw8ABgsDWWtu8faO/WVJCz9avDsV1iYVWMxzah8rjza', 'admin@mail.com', 'admin', NULL, NULL),
(1, '$2a$10$qUq0NHXqei7QCF42gXdH7.FZHbgriukTE008Zyw7I27zv/HlOz5J2', 'bob@mail1.com', 'bobyd', NULL, NULL),
(53, '$2a$10$8i5y5ZuSklcri0GQxiCrme8l0Dm0dGJgCFulOaDiR4AlSUNbq8zsy', 'clear_sky@hotmail.fr', 'Alexis Chevalier', 'FACEBOOK', '1556201368');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Payments`
--
ALTER TABLE `Payments`
  ADD CONSTRAINT `PREVENT_PAIMENT_DELETION_ON_PLAN_DELETION` FOREIGN KEY (`planId`) REFERENCES `Plans` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `PREVENT_PAIMENT_DELETION_ON_USER_DELETION` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
