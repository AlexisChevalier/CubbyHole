-- phpMyAdmin SQL Dump
-- version 4.0.6
-- http://www.phpmyadmin.net
--
-- Client: localhost
-- Généré le: Lun 16 Juin 2014 à 03:12
-- Version du serveur: 5.5.33
-- Version de PHP: 5.5.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Base de données: `CubbyHole`
--

-- --------------------------------------------------------

--
-- Structure de la table `AccessTokens`
--

CREATE TABLE `AccessTokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `clientID` int(11) NOT NULL,
  `token` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PREVENT_DUPLICATES_TOKENS_INDEX` (`userID`,`clientID`) COMMENT 'Prevents multipes tokens for an app and an user',
  KEY `clientID` (`clientID`),
  KEY `userID` (`userID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=203 ;

--
-- Contenu de la table `AccessTokens`
--

INSERT INTO `AccessTokens` (`id`, `userID`, `clientID`, `token`) VALUES
(195, 85, 7, '1eGkNFtZKOrP01i5WoPOfy74u609yVyVH23J2wwBMssf5hNBk3LSSjFSWnhC7vvWYHY5tyEjRDnym10zt4iFfgm1NKq2oGg28WWw5xZhy9dp1jRRdInmRnVSkU8YmdJZPzVH5nT32I2pqB8H5GNBqYSehOfkPMevEoI53pjsQX968rKBppULFuLIrYo76AcSHfGQVS1lVWETwVAa6xLuarNzqqCRkWwICWqrI6J2E9SX13Muorix4zc3NxZwAH3G');

-- --------------------------------------------------------

--
-- Structure de la table `AuthorizationCodes`
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

-- --------------------------------------------------------

--
-- Structure de la table `Clients`
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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=11 ;

--
-- Contenu de la table `Clients`
--

INSERT INTO `Clients` (`id`, `name`, `clientId`, `clientSecret`, `redirect_uri`, `dialog_disabled`, `userID`) VALUES
(7, 'CubbyHole Website', 'cubbyh_b1175f3f-9c52-4205-adfd-c9a63f7cbecb', 'df8b08e6-215f-49ac-86fa-1212e7c9e0e6', 'https://localhost:8443/loginCallback', 1, 1),
(9, 'CubbyHole Developer Center', 'cubbyh_28af8ca9-368e-4ce1-8586-e2690ead096f', 'd923c923-efa9-44bd-8980-eb541660b67e', 'https://localhost:8445/loginCallback', 0, 1),
(10, 'lol', 'lol_95e865a6-1df3-4920-90e0-1c5955bd7c67', '159ed2b7-a785-4187-8834-60b220195607', 'lol', 0, 68);

-- --------------------------------------------------------

--
-- Structure de la table `Payments`
--

CREATE TABLE `Payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `planId` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `paymentTime` bigint(11) NOT NULL,
  `currency` text NOT NULL,
  `paypal_payerId` varchar(250) DEFAULT NULL,
  `paypal_state` varchar(250) NOT NULL,
  `paypal_paymentId` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `planId` (`planId`),
  KEY `planId_2` (`planId`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- Structure de la table `Plans`
--

CREATE TABLE `Plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `pricePerMonth` int(11) NOT NULL,
  `bandwidthPerDay` bigint(20) NOT NULL,
  `diskSpace` bigint(20) NOT NULL,
  `bandwidthSpeed` bigint(20) NOT NULL,
  `description` longtext NOT NULL,
  `available` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

--
-- Contenu de la table `Plans`
--

INSERT INTO `Plans` (`id`, `name`, `pricePerMonth`, `bandwidthPerDay`, `diskSpace`, `bandwidthSpeed`, `description`, `available`) VALUES
(1, 'Free', 0, 524288000, 52428800, 262144, 'The free plan is perfect if you want to try our solution or synchronize some small files over two or three devices', 1),
(2, 'Basic', 5, 2684354560, 10737418240, 524288, 'The basic plan will help you to synchronize all your important files over all your devices and share them with some of your friends', 1),
(3, 'Premium', 20, 8053063680, 26843545600, 1048576, 'With the premium plan, you can share your awesome pictures with your family or save your backups online', 1),
(4, 'Enterprise', 50, 32212254720, 107374182400, 5242880, 'The enterprise plan is perfect for your company, with the unlimited storage and bandwidth, you can work without any problems on our system ! In case of errors, you can contact us or find the problem using the history logs !', 1);

-- --------------------------------------------------------

--
-- Structure de la table `Users`
--

CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` text NOT NULL,
  `social_type` text,
  `social_id` text,
  `isAdmin` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_MAIL` (`email`),
  KEY `id` (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=86 ;

--
-- Contenu de la table `Users`
--

INSERT INTO `Users` (`id`, `password`, `email`, `name`, `social_type`, `social_id`, `isAdmin`) VALUES
(0, '$2a$10$KOuEH0nbB4rw8ABgsDWWtu8faO/WVJCz9avDsV1iYVWMxzah8rjza', 'admin@mail.com', 'admin', NULL, NULL, 0),
(1, '$2a$10$qUq0NHXqei7QCF42gXdH7.FZHbgriukTE008Zyw7I27zv/HlOz5J2', 'bob@mail1.com', 'bobyd', NULL, NULL, 0),
(54, '$2a$10$V5rYFeNOGd.ZtjL0wz/cUOFIrdI3PT4TRVZaJHTOTePF2qTn7z03a', 'alexis.chevalier.wtf@gmail.com', 'LOL', NULL, NULL, 0),
(56, '$2a$10$WgooIdG8UHetqHl2.YKivOSuYCVaq9MVUcQCVBIkEEKPeFWHXRvqa', 'lol@mail.fr', 'SUP BRO', NULL, NULL, 0),
(57, '$2a$10$d9eeJn5KXU6PTBRTJsSGpuCxAhBg/Krxd/UfX5MkGhk.sLvVaZFI2', 'lolilol@mul.com', 'sdojdsfji', NULL, NULL, 0),
(58, '$2a$10$uoFKrcFb8/Mox9/jGOED2OY.maKL5fgS/4Hb0WgcAvxEEsQZT4lPK', 'lilililil@mail.com', 'sdfopsdfmsdflk', NULL, NULL, 0),
(60, '$2a$10$xfPGdsqEwrPCFGKQbFXyGOz0EUDYCgnLHxeC9E4mPRBgr1RCH.CQq', 'sdfopsdfmsdflko@luuuul.fr', 'sdfopsdfmsdflko', NULL, NULL, 0),
(63, '$2a$10$eBbmrT8VRqAHgjxoONslBOCOaK68H800BevbVm.mX/.t0mO4Zrq42', 'lolwut@mail.cru', 'LOL WUT', NULL, NULL, 0),
(64, '$2a$10$ND.A3rikyIpP.KMMPCGlLOQ3U6zRde.2cPOVO5THimEHaEB2LIZN6', 'fjgjzepokgpzeokgpozk@fjzergpij.fr', 'meojqjgpqodmqkgmlkqfgoz', NULL, NULL, 0),
(65, '$2a$10$rX3tlHBhg7xL5wzJV7DBFOz9WyyMXxUMQ4gl4u7P6fupK3klo6d6q', 'sdfosfsopfpozefopk@poksdfpok.fr', 'zeofjpzfjzpeofkpzoekf', NULL, NULL, 0),
(76, '$2a$10$xDIXR6F3cqTCcMQdiGNjDumdJ9AWLOSok4u4741KvH801ETUm5aKC', 'alexis.chevalier1@gmail.com', 'Alexis Chevalier', 'GOOGLE', '103110585205049566726', 0),
(85, '$2a$10$HGRbgYr5FIbmVwZ.otmB/O2aHTkcDg4xru5429djhBFZmp2FGnbK.', 'clear_sky@hotmail.fr', 'Alexis Chevalier', 'FACEBOOK', '1556201368', NULL);

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `AccessTokens`
--
ALTER TABLE `AccessTokens`
  ADD CONSTRAINT `ACCESS_TOKEN_IS_OWNED_BY_AN_USER` FOREIGN KEY (`userID`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ACCESS_TOKEN_IS_OWNED_BY_A_CLIENT` FOREIGN KEY (`clientID`) REFERENCES `Clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `Payments`
--
ALTER TABLE `Payments`
  ADD CONSTRAINT `PREVENT_PAIMENT_DELETION_ON_PLAN_DELETION` FOREIGN KEY (`planId`) REFERENCES `Plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `PREVENT_PAIMENT_DELETION_ON_USER_DELETION` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
