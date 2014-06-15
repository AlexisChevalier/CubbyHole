-- phpMyAdmin SQL Dump
-- version 4.0.6
-- http://www.phpmyadmin.net
--
-- Client: localhost
-- Généré le: Sam 14 Juin 2014 à 21:39
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
  KEY `clientID` (`clientID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=160 ;


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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

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
(9, 'CubbyHole Developer Center', 'cubbyh_28af8ca9-368e-4ce1-8586-e2690ead096f', 'd923c923-efa9-44bd-8980-eb541660b67e', 'https://localhost:8445/loginCallback', 0, 1)

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
(1, 'Free', 0, 1073741824, 52428800, 262144, 'The free plan is perfect if you want to try our solution or synchronize some small files over two or three devices', 1),
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
  `isAdmin` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQUE_MAIL` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=77 ;

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `AccessTokens`
--
ALTER TABLE `AccessTokens`
  ADD CONSTRAINT `ACCESS_TOKEN_IS_OWNED_BY_A_CLIENT` FOREIGN KEY (`clientID`) REFERENCES `Clients` (`id`);

--
-- Contraintes pour la table `Payments`
--
ALTER TABLE `Payments`
  ADD CONSTRAINT `PREVENT_PAIMENT_DELETION_ON_PLAN_DELETION` FOREIGN KEY (`planId`) REFERENCES `Plans` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `PREVENT_PAIMENT_DELETION_ON_USER_DELETION` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
