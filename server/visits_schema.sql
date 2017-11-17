-- phpMyAdmin SQL Dump
-- version 4.6.6deb4
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 17, 2017 at 11:16 AM
-- Server version: 5.7.20-0ubuntu0.17.04.1
-- PHP Version: 7.0.22-0ubuntu0.17.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `disasterdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `bazdid`
--

CREATE TABLE `visits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `visit_id` int(11) NOT NULL,
  `visit_name` varchar(60) NOT NULL,
  `ostan` varchar(50) DEFAULT NULL,
  `city` varchar(70) DEFAULT NULL,
  `bakhsh` varchar(70) DEFAULT NULL,
  `abadi` varchar(70) DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `date` int(11) DEFAULT NULL,
  `trusted_person` text,
  `eskan` text,
  `salamat` text,
  `amoozesh` text,
  `qaza` text,
  `miras` text,
  `rosoom` text,
  `keshavarzi` text,
  `haqe_ab` text,
  `tejarat` text,
  `tourism` text,
  `mali` text,
  `barq` text,
  `mokhaberat` text,
  `zirsakht` text,
  `tasfie_ab` text,
  `modiriat` text,
  `marta` text,
  `hemaiat_ejtemaee` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index` (`user_id`,`visit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
