-- FILE DATA IS FOR TEST PURPOSES ONLY! 
-- password-hashes are invalid, coordinates and tokens are AI generated
 

-- MySQL dump 10.13  Distrib 8.0.46, for macos15 (arm64)
--
-- Host: localhost    Database: MenuMap
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `MenuMap`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `MenuMap` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `MenuMap`;

--
-- Table structure for table `administrator`
--

DROP TABLE IF EXISTS `administrator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrator` (
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrator`
--

LOCK TABLES `administrator` WRITE;
/*!40000 ALTER TABLE `administrator` DISABLE KEYS */;
INSERT INTO `administrator` VALUES (1),(2),(3),(4),(5),(16),(17),(18),(19),(20);
/*!40000 ALTER TABLE `administrator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `allergen`
--

DROP TABLE IF EXISTS `allergen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `allergen` (
  `allergen_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`allergen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `allergen`
--

LOCK TABLES `allergen` WRITE;
/*!40000 ALTER TABLE `allergen` DISABLE KEYS */;
INSERT INTO `allergen` VALUES (1,'Fish','Fish and fish-derived products.'),(2,'Soy','Soybeans and soy-derived products.'),(3,'Gluten','Gluten-containing grains such as wheat.'),(4,'Milk','Milk and milk-derived products.'),(5,'Sesame','Sesame seeds and sesame-derived products.'),(6,'Egg','Eggs and egg-derived products.'),(7,'Shellfish','Crustacean shellfish and shellfish-derived products.'),(8,'Peanut','Peanuts and peanut-derived products.'),(9,'Tree Nuts','Almonds, walnuts, and other tree nuts.'),(10,'Mustard','Mustard seeds and mustard-derived products.');
/*!40000 ALTER TABLE `allergen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_event`
--

DROP TABLE IF EXISTS `audit_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_event` (
  `audit_id` bigint NOT NULL,
  `action_type` enum('ASSIGN_RESTAURANT','UPDATE_MENU_ITEM','CHANGE_ORDER_STATUS','RESTRICT_CUSTOMER','SUSPEND_RESTAURANT','CREATE_AUTHORIZATION_TOKEN') NOT NULL,
  `occurred_at` timestamp NOT NULL,
  `details` json DEFAULT NULL,
  PRIMARY KEY (`audit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_event`
--

LOCK TABLES `audit_event` WRITE;
/*!40000 ALTER TABLE `audit_event` DISABLE KEYS */;
INSERT INTO `audit_event` VALUES (1,'ASSIGN_RESTAURANT','2026-09-20 17:00:00','{\"owner_id\": 6, \"restaurant_id\": 1}'),(2,'UPDATE_MENU_ITEM','2026-09-21 18:15:00','{\"field\": \"price\", \"item_id\": 1, \"restaurant_id\": 2}'),(3,'CHANGE_ORDER_STATUS','2026-10-01 19:35:00','{\"order_id\": 3, \"new_status\": \"PREPARING\", \"restaurant_id\": 3}'),(4,'RESTRICT_CUSTOMER','2026-09-26 00:30:00','{\"customer_id\": 13, \"restaurant_id\": 4}'),(5,'SUSPEND_RESTAURANT','2026-09-28 15:45:00','{\"reason\": \"administrative review\", \"restaurant_id\": 5}'),(6,'ASSIGN_RESTAURANT','2026-09-29 16:00:00','{\"owner_id\": 21, \"restaurant_id\": 6}'),(7,'UPDATE_MENU_ITEM','2026-09-29 17:15:00','{\"field\": \"availability\", \"item_id\": 1, \"restaurant_id\": 7}'),(8,'CHANGE_ORDER_STATUS','2026-10-01 21:05:00','{\"order_id\": 8, \"new_status\": \"PREPARING\", \"restaurant_id\": 8}'),(9,'RESTRICT_CUSTOMER','2026-09-30 23:30:00','{\"customer_id\": 29, \"restaurant_id\": 9}'),(10,'CREATE_AUTHORIZATION_TOKEN','2026-10-01 17:45:00','{\"table_code\": \"M1\", \"restaurant_id\": 10}');
/*!40000 ALTER TABLE `audit_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_participant`
--

DROP TABLE IF EXISTS `audit_participant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_participant` (
  `audit_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `participant_role` enum('ACTOR','TARGET','OTHER') NOT NULL,
  PRIMARY KEY (`audit_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_participant`
--

LOCK TABLES `audit_participant` WRITE;
/*!40000 ALTER TABLE `audit_participant` DISABLE KEYS */;
INSERT INTO `audit_participant` VALUES (1,1,'ACTOR'),(2,7,'ACTOR'),(3,8,'ACTOR'),(4,9,'ACTOR'),(5,5,'ACTOR'),(6,16,'ACTOR'),(7,22,'ACTOR'),(8,23,'ACTOR'),(9,24,'ACTOR'),(10,20,'ACTOR');
/*!40000 ALTER TABLE `audit_participant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_restaurant`
--

DROP TABLE IF EXISTS `audit_restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_restaurant` (
  `audit_id` bigint NOT NULL,
  `restaurant_id` bigint NOT NULL,
  PRIMARY KEY (`audit_id`,`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_restaurant`
--

LOCK TABLES `audit_restaurant` WRITE;
/*!40000 ALTER TABLE `audit_restaurant` DISABLE KEYS */;
INSERT INTO `audit_restaurant` VALUES (1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(8,8),(9,9),(10,10);
/*!40000 ALTER TABLE `audit_restaurant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authorization_token`
--

DROP TABLE IF EXISTS `authorization_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authorization_token` (
  `token_id` char(36) NOT NULL,
  `restaurant_id` bigint NOT NULL,
  `table_code` varchar(30) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `issued_at` timestamp NOT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`token_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authorization_token`
--

LOCK TABLES `authorization_token` WRITE;
/*!40000 ALTER TABLE `authorization_token` DISABLE KEYS */;
INSERT INTO `authorization_token` VALUES ('11111111-1111-4111-8111-111111111111',1,'T1','296608495a227cd5451fce8bbacf694686089c9169409fca4ce0a12791732776','2026-10-01 17:00:00','2026-10-01 21:00:00',NULL),('22222222-2222-4222-8222-222222222222',2,'A1','9d3e8c99af68baf16d8d83d18ef0a30a2562051f47c859065c6d1db020691932','2026-10-01 17:05:00','2026-10-01 21:05:00',NULL),('33333333-3333-4333-8333-333333333333',3,'P1','7643de7d31f1d50972835029648619a94b24de124f502e6adcc0c65fdf8df8f0','2026-10-01 17:10:00','2026-10-01 21:10:00',NULL),('44444444-4444-4444-8444-444444444444',4,'B1','aaec2c07451bac42fe9bbc2bb67132154283ee47ecab2242496fc488e047ff18','2026-10-01 17:15:00','2026-10-01 21:15:00','2026-10-01 17:45:00'),('55555555-5555-4555-8555-555555555555',5,'D1','236d367c0877cb68a1143932235403595c07d227d3ae6876cf030e2a23f4f312','2026-10-01 17:20:00','2026-10-01 21:20:00',NULL),('66666666-6666-4666-8666-666666666666',6,'R1','34d8726adf3f679c00b13b1bfbbfbb2b115042f136d6920d9eefe4a881b23777','2026-10-01 17:25:00','2026-10-01 21:25:00',NULL),('77777777-7777-4777-8777-777777777777',7,'C1','f6bb2060a3ee9b3373b6293af7d2996476e66e56ea474280f1d4b3a3a4db6ca9','2026-10-01 17:30:00','2026-10-01 21:30:00',NULL),('88888888-8888-4888-8888-888888888888',8,'S1','e5cf21f6b7e79585630005fb3d8284e4f4cdb9d51262b449b3b1c4e8e368707b','2026-10-01 17:35:00','2026-10-01 21:35:00',NULL),('99999999-9999-4999-8999-999999999999',9,'G1','56129b9a87b94bcc7fca636bc542c3c2ae748d14c37aaaa4bf5fe9372abadd6b','2026-10-01 17:40:00','2026-10-01 21:40:00','2026-10-01 18:10:00'),('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',10,'M1','900f581f1ca4e0c6c7ca416e0ac0aa295587c7effcda0dc923d7928c476b7ceb','2026-10-01 17:45:00','2026-10-01 21:45:00',NULL);
/*!40000 ALTER TABLE `authorization_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `business_owner`
--

DROP TABLE IF EXISTS `business_owner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_owner` (
  `user_id` bigint NOT NULL,
  `created_by_admin_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_owner`
--

LOCK TABLES `business_owner` WRITE;
/*!40000 ALTER TABLE `business_owner` DISABLE KEYS */;
INSERT INTO `business_owner` VALUES (6,1),(7,2),(8,3),(9,4),(10,5),(21,16),(22,17),(23,18),(24,19),(25,20);
/*!40000 ALTER TABLE `business_owner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cuisine`
--

DROP TABLE IF EXISTS `cuisine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuisine` (
  `cuisine_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`cuisine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cuisine`
--

LOCK TABLES `cuisine` WRITE;
/*!40000 ALTER TABLE `cuisine` DISABLE KEYS */;
INSERT INTO `cuisine` VALUES (1,'Seafood'),(2,'Asian'),(3,'Italian'),(4,'American'),(5,'Mediterranean'),(6,'Japanese'),(7,'Mexican'),(8,'Indian'),(9,'Vegetarian'),(10,'Cafe');
/*!40000 ALTER TABLE `cuisine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (11),(12),(13),(14),(15),(26),(27),(28),(29),(30);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_order`
--

DROP TABLE IF EXISTS `customer_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_order` (
  `order_id` bigint NOT NULL,
  `restaurant_id` bigint NOT NULL,
  `customer_id` bigint DEFAULT NULL,
  `token_id` char(36) DEFAULT NULL,
  `table_code` varchar(30) DEFAULT NULL,
  `order_method` enum('DINE_IN','PICKUP') NOT NULL,
  `submitted_at` timestamp NOT NULL,
  `current_status` enum('SUBMITTED','PREPARING','READY','COMPLETED','CANCELED') NOT NULL DEFAULT 'SUBMITTED',
  `subtotal_amount` decimal(12,2) NOT NULL,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL,
  `cancellation_reason` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_order`
--

LOCK TABLES `customer_order` WRITE;
/*!40000 ALTER TABLE `customer_order` DISABLE KEYS */;
INSERT INTO `customer_order` VALUES (1,1,11,'11111111-1111-4111-8111-111111111111','T1','DINE_IN','2026-10-01 18:05:00','COMPLETED',25.00,2.19,27.19,NULL),(2,2,12,NULL,NULL,'PICKUP','2026-10-01 18:20:00','READY',14.00,1.23,15.23,NULL),(3,3,NULL,'33333333-3333-4333-8333-333333333333','P1','DINE_IN','2026-10-01 19:30:00','PREPARING',13.25,1.16,14.41,NULL),(4,4,14,NULL,NULL,'PICKUP','2026-10-01 20:10:00','CANCELED',32.00,2.80,34.80,'Customer requested cancellation.'),(5,5,15,'55555555-5555-4555-8555-555555555555','D1','DINE_IN','2026-10-01 20:45:00','SUBMITTED',32.25,2.82,35.07,NULL),(6,6,26,'66666666-6666-4666-8666-666666666666','R1','DINE_IN','2026-10-01 21:00:00','COMPLETED',15.50,1.36,16.86,NULL),(7,7,27,NULL,NULL,'PICKUP','2026-10-01 21:15:00','READY',27.00,2.36,29.36,NULL),(8,8,NULL,'88888888-8888-4888-8888-888888888888','S1','DINE_IN','2026-10-01 21:30:00','PREPARING',14.25,1.25,15.50,NULL),(9,9,29,NULL,NULL,'PICKUP','2026-10-01 21:45:00','CANCELED',24.00,2.10,26.10,'Customer requested cancellation.'),(10,10,30,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','M1','DINE_IN','2026-10-01 22:00:00','SUBMITTED',34.50,3.02,37.52,NULL);
/*!40000 ALTER TABLE `customer_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dietary_classification`
--

DROP TABLE IF EXISTS `dietary_classification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dietary_classification` (
  `classification_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`classification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dietary_classification`
--

LOCK TABLES `dietary_classification` WRITE;
/*!40000 ALTER TABLE `dietary_classification` DISABLE KEYS */;
INSERT INTO `dietary_classification` VALUES (1,'Gluten-Free','Prepared without gluten-containing ingredients.'),(2,'Vegan','Contains no animal-derived ingredients.'),(3,'Vegetarian','Contains no meat or fish.'),(4,'High-Protein','Provides a comparatively high amount of protein.'),(5,'Dairy-Free','Contains no milk-derived ingredients.'),(6,'Low-Sodium','Prepared with reduced sodium compared with standard recipes.'),(7,'Keto-Friendly','Designed for a low-carbohydrate eating pattern.'),(8,'Halal','Prepared using ingredients that meet halal dietary requirements.'),(9,'Kosher','Prepared using ingredients that meet kosher dietary requirements.'),(10,'Nut-Free','Prepared without peanuts or tree nuts.');
/*!40000 ALTER TABLE `dietary_classification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredient`
--

DROP TABLE IF EXISTS `ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredient` (
  `ingredient_id` int NOT NULL,
  `name` varchar(120) NOT NULL,
  `calories_per_unit` decimal(10,2) NOT NULL,
  `base_unit` varchar(30) NOT NULL,
  PRIMARY KEY (`ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredient`
--

LOCK TABLES `ingredient` WRITE;
/*!40000 ALTER TABLE `ingredient` DISABLE KEYS */;
INSERT INTO `ingredient` VALUES (1,'Salmon Fillet',208.00,'100 g'),(2,'Firm Tofu',144.00,'100 g'),(3,'Wheat Noodles',138.00,'100 g'),(4,'Cheddar Cheese',403.00,'100 g'),(5,'Tahini',595.00,'100 g'),(6,'Egg Noodles',138.00,'100 g'),(7,'Shrimp',99.00,'100 g'),(8,'Peanut Sauce',350.00,'100 g'),(9,'Sliced Almonds',579.00,'100 g'),(10,'Dijon Mustard',66.00,'100 g');
/*!40000 ALTER TABLE `ingredient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredient_allergen`
--

DROP TABLE IF EXISTS `ingredient_allergen`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredient_allergen` (
  `ingredient_id` int NOT NULL,
  `allergen_id` int NOT NULL,
  PRIMARY KEY (`ingredient_id`,`allergen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredient_allergen`
--

LOCK TABLES `ingredient_allergen` WRITE;
/*!40000 ALTER TABLE `ingredient_allergen` DISABLE KEYS */;
INSERT INTO `ingredient_allergen` VALUES (1,1),(2,2),(3,3),(4,4),(5,5),(6,6),(7,7),(8,8),(9,9),(10,10);
/*!40000 ALTER TABLE `ingredient_allergen` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_dietary_classification`
--

DROP TABLE IF EXISTS `item_dietary_classification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_dietary_classification` (
  `restaurant_id` bigint NOT NULL,
  `category_id` int NOT NULL,
  `item_id` int NOT NULL,
  `classification_id` int NOT NULL,
  PRIMARY KEY (`restaurant_id`,`category_id`,`item_id`,`classification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_dietary_classification`
--

LOCK TABLES `item_dietary_classification` WRITE;
/*!40000 ALTER TABLE `item_dietary_classification` DISABLE KEYS */;
INSERT INTO `item_dietary_classification` VALUES (1,1,1,1),(2,1,1,2),(3,1,1,3),(4,1,1,4),(5,1,1,5),(6,1,1,6),(7,1,1,7),(8,1,1,8),(9,1,1,9),(10,1,1,10);
/*!40000 ALTER TABLE `item_dietary_classification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_category`
--

DROP TABLE IF EXISTS `menu_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_category` (
  `restaurant_id` bigint NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_order` smallint NOT NULL DEFAULT '0',
  `description` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`restaurant_id`,`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_category`
--

LOCK TABLES `menu_category` WRITE;
/*!40000 ALTER TABLE `menu_category` DISABLE KEYS */;
INSERT INTO `menu_category` VALUES (1,1,'Entrees',1,'Main seafood dishes and bowls.',1),(2,1,'Bowls',1,'Rice and noodle bowls.',1),(3,1,'Pasta',1,'Fresh pasta dishes.',1),(4,1,'Burgers',1,'House burgers and sandwiches.',1),(5,1,'Starters',1,'Shareable Mediterranean starters.',1),(6,1,'Ramen',1,'Noodle soups and ramen specialties.',1),(7,1,'Tacos',1,'Tacos served with fresh salsa.',1),(8,1,'Curries',1,'Regional curries and rice dishes.',1),(9,1,'Salads',1,'Seasonal salads and grain bowls.',1),(10,1,'Breakfast',1,'Breakfast sandwiches and plates.',1);
/*!40000 ALTER TABLE `menu_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_item`
--

DROP TABLE IF EXISTS `menu_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_item` (
  `restaurant_id` bigint NOT NULL,
  `category_id` int NOT NULL,
  `item_id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  PRIMARY KEY (`restaurant_id`,`category_id`,`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_item`
--

LOCK TABLES `menu_item` WRITE;
/*!40000 ALTER TABLE `menu_item` DISABLE KEYS */;
INSERT INTO `menu_item` VALUES (1,1,1,'Salmon Rice Bowl','Grilled salmon, rice, greens, and citrus sauce.',12.50,1,'2026-05-01 16:00:00','2026-09-29 16:00:00'),(2,1,1,'Tofu Noodle Bowl','Crispy tofu, rice noodles, vegetables, and broth.',14.00,1,'2026-05-02 16:00:00','2026-09-29 16:05:00'),(3,1,1,'Pasta Primavera','Wheat pasta with seasonal vegetables and herbs.',13.25,1,'2026-05-03 16:00:00','2026-09-29 16:10:00'),(4,1,1,'Classic Cheeseburger','Beef patty, cheddar cheese, lettuce, and tomato.',16.00,1,'2026-05-04 16:00:00','2026-09-29 16:15:00'),(5,1,1,'Hummus Plate','Hummus, tahini, vegetables, olives, and pita.',10.75,1,'2026-05-05 16:00:00','2026-09-29 16:20:00'),(6,1,1,'Miso Ramen','Miso broth, egg noodles, vegetables, and scallions.',15.50,1,'2026-05-06 16:00:00','2026-09-29 16:25:00'),(7,1,1,'Shrimp Tacos','Grilled shrimp, cabbage, salsa, and corn tortillas.',13.50,1,'2026-05-07 16:00:00','2026-09-29 16:30:00'),(8,1,1,'Peanut Curry','Vegetables simmered in a creamy peanut curry sauce.',14.25,1,'2026-05-08 16:00:00','2026-09-29 16:35:00'),(9,1,1,'Almond Kale Salad','Kale, roasted vegetables, almonds, and citrus dressing.',12.00,1,'2026-05-09 16:00:00','2026-09-29 16:40:00'),(10,1,1,'Breakfast Sandwich','Egg, cheese, greens, and Dijon mustard on a roll.',11.50,1,'2026-05-10 16:00:00','2026-09-29 16:45:00');
/*!40000 ALTER TABLE `menu_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_item_ingredient`
--

DROP TABLE IF EXISTS `menu_item_ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_item_ingredient` (
  `restaurant_id` bigint NOT NULL,
  `category_id` int NOT NULL,
  `item_id` int NOT NULL,
  `ingredient_id` int NOT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `unit` varchar(30) NOT NULL,
  `is_optional` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`restaurant_id`,`category_id`,`item_id`,`ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_item_ingredient`
--

LOCK TABLES `menu_item_ingredient` WRITE;
/*!40000 ALTER TABLE `menu_item_ingredient` DISABLE KEYS */;
INSERT INTO `menu_item_ingredient` VALUES (1,1,1,1,150.000,'g',0),(2,1,1,2,180.000,'g',0),(3,1,1,3,200.000,'g',0),(4,1,1,4,40.000,'g',0),(5,1,1,5,30.000,'g',1),(6,1,1,6,180.000,'g',0),(7,1,1,7,120.000,'g',0),(8,1,1,8,75.000,'g',0),(9,1,1,9,25.000,'g',1),(10,1,1,10,15.000,'g',1);
/*!40000 ALTER TABLE `menu_item_ingredient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nutrition_fact`
--

DROP TABLE IF EXISTS `nutrition_fact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nutrition_fact` (
  `restaurant_id` bigint NOT NULL,
  `category_id` int NOT NULL,
  `item_id` int NOT NULL,
  `serving_size` varchar(80) NOT NULL,
  `calories` decimal(10,2) NOT NULL,
  `protein_g` decimal(10,2) NOT NULL,
  `carbohydrates_g` decimal(10,2) NOT NULL,
  `fat_g` decimal(10,2) NOT NULL,
  `sodium_mg` decimal(10,2) NOT NULL,
  PRIMARY KEY (`restaurant_id`,`category_id`,`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nutrition_fact`
--

LOCK TABLES `nutrition_fact` WRITE;
/*!40000 ALTER TABLE `nutrition_fact` DISABLE KEYS */;
INSERT INTO `nutrition_fact` VALUES (1,1,1,'420 g',610.00,38.00,64.00,22.00,780.00),(2,1,1,'450 g',540.00,24.00,72.00,17.00,920.00),(3,1,1,'400 g',590.00,18.00,86.00,19.00,740.00),(4,1,1,'360 g',780.00,42.00,48.00,45.00,1250.00),(5,1,1,'330 g',480.00,16.00,52.00,24.00,690.00),(6,1,1,'520 g',720.00,32.00,88.00,28.00,1450.00),(7,1,1,'340 g',520.00,28.00,54.00,22.00,980.00),(8,1,1,'430 g',650.00,21.00,76.00,30.00,1050.00),(9,1,1,'310 g',430.00,14.00,38.00,27.00,480.00),(10,1,1,'290 g',610.00,26.00,49.00,34.00,1120.00);
/*!40000 ALTER TABLE `nutrition_fact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_line`
--

DROP TABLE IF EXISTS `order_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_line` (
  `order_id` bigint NOT NULL,
  `line_num` smallint NOT NULL,
  `restaurant_id` bigint NOT NULL,
  `category_id` int NOT NULL,
  `item_id` int NOT NULL,
  `item_name_at_order` varchar(150) NOT NULL,
  `unit_price_at_order` decimal(10,2) NOT NULL,
  `quantity` smallint NOT NULL,
  PRIMARY KEY (`order_id`,`line_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_line`
--

LOCK TABLES `order_line` WRITE;
/*!40000 ALTER TABLE `order_line` DISABLE KEYS */;
INSERT INTO `order_line` VALUES (1,1,1,1,1,'Salmon Rice Bowl',12.50,2),(2,1,2,1,1,'Tofu Noodle Bowl',14.00,1),(3,1,3,1,1,'Pasta Primavera',13.25,1),(4,1,4,1,1,'Classic Cheeseburger',16.00,2),(5,1,5,1,1,'Hummus Plate',10.75,3),(6,1,6,1,1,'Miso Ramen',15.50,1),(7,1,7,1,1,'Shrimp Tacos',13.50,2),(8,1,8,1,1,'Peanut Curry',14.25,1),(9,1,9,1,1,'Almond Kale Salad',12.00,2),(10,1,10,1,1,'Breakfast Sandwich',11.50,3);
/*!40000 ALTER TABLE `order_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owns_restaurant`
--

DROP TABLE IF EXISTS `owns_restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owns_restaurant` (
  `restaurant_id` bigint NOT NULL,
  `business_owner_id` bigint NOT NULL,
  `assigned_by_admin_id` bigint NOT NULL,
  `assigned_at` timestamp NOT NULL,
  PRIMARY KEY (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owns_restaurant`
--

LOCK TABLES `owns_restaurant` WRITE;
/*!40000 ALTER TABLE `owns_restaurant` DISABLE KEYS */;
INSERT INTO `owns_restaurant` VALUES (1,6,1,'2026-04-01 17:00:00'),(2,7,2,'2026-04-02 17:00:00'),(3,8,3,'2026-04-03 17:00:00'),(4,9,4,'2026-04-04 17:00:00'),(5,10,5,'2026-04-05 17:00:00'),(6,21,16,'2026-04-06 17:00:00'),(7,22,17,'2026-04-07 17:00:00'),(8,23,18,'2026-04-08 17:00:00'),(9,24,19,'2026-04-09 17:00:00'),(10,25,20,'2026-04-10 17:00:00');
/*!40000 ALTER TABLE `owns_restaurant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant`
--

DROP TABLE IF EXISTS `restaurant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant` (
  `restaurant_id` bigint NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text,
  `phone` varchar(30) DEFAULT NULL,
  `street_address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` char(2) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `coordinates` point NOT NULL,
  `price_level` tinyint DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_open` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  PRIMARY KEY (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant`
--

LOCK TABLES `restaurant` WRITE;
/*!40000 ALTER TABLE `restaurant` DISABLE KEYS */;
INSERT INTO `restaurant` VALUES (1,'Harbor Grill','Seafood bowls and grilled specialties.','+1-408-555-1001','101 Market St','San Jose','CA','95113',0x000000000101000000789CA223B9785EC0ECC039234AAB4240,3,1,1,'2026-04-01 16:00:00','2026-09-28 16:00:00'),(2,'Golden Bowl','Asian-inspired noodle and rice bowls.','+1-408-555-1002','2200 El Camino','Santa Clara','CA','95050',0x000000000101000000E9482EFF217D5EC0BEC1172653AD4240,2,1,1,'2026-04-02 16:00:00','2026-09-28 16:05:00'),(3,'Verde Table','Fresh Italian and vegetable-forward food.','+1-408-555-1003','10800 Stevens Creek Blvd','Cupertino','CA','95014',0x00000000010100000099BB96900F825EC0D34D621058A94240,2,1,1,'2026-04-03 16:00:00','2026-09-28 16:10:00'),(4,'Burger Foundry','Burgers, fries, and house-made sauces.','+1-408-555-1004','75 E Campbell Ave','Campbell','CA','95008',0x0000000001010000001B9E5E29CB7C5EC0A2B437F8C2A44240,2,1,1,'2026-04-04 16:00:00','2026-09-28 16:15:00'),(5,'Cedar Kitchen','Mediterranean plates and fresh breads.','+1-408-555-1005','300 W Washington Ave','Sunnyvale','CA','94086',0x00000000010100000011363CBD52825EC0E561A1D634AF4240,2,1,0,'2026-04-05 16:00:00','2026-09-28 16:20:00'),(6,'Sakura Ramen','Japanese ramen, small plates, and tea.','+1-408-555-1006','250 S B St','San Mateo','CA','94401',0x00000000010100000046B6F3FDD4945EC0F2D24D6210C84240,2,1,1,'2026-04-06 16:00:00','2026-09-28 16:25:00'),(7,'Casa Sol','Mexican tacos, bowls, and house salsas.','+1-408-555-1007','3900 Mowry Ave','Fremont','CA','94538',0x000000000101000000D734EF38457F5EC091ED7C3F35C64240,2,1,1,'2026-04-07 16:00:00','2026-09-28 16:30:00'),(8,'Spice Route','Regional Indian curries and breads.','+1-408-555-1008','80 N Milpitas Blvd','Milpitas','CA','95035',0x000000000101000000D3DEE00B93795EC0C8073D9B55B74240,2,1,1,'2026-04-08 16:00:00','2026-09-28 16:35:00'),(9,'Green Fork','Seasonal salads and plant-forward meals.','+1-408-555-1009','425 University Ave','Palo Alto','CA','94301',0x000000000101000000FED478E926895EC01B0DE02D90B84240,2,1,0,'2026-04-09 16:00:00','2026-09-28 16:40:00'),(10,'Morning Oak Cafe','Breakfast plates, coffee, and baked goods.','+1-408-555-1010','650 Castro St','Mountain View','CA','94041',0x0000000001010000009A081B9E5E855EC0287E8CB96BB14240,2,1,1,'2026-04-10 16:00:00','2026-09-28 16:45:00');
/*!40000 ALTER TABLE `restaurant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_cuisine`
--

DROP TABLE IF EXISTS `restaurant_cuisine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_cuisine` (
  `restaurant_id` bigint NOT NULL,
  `cuisine_id` int NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`restaurant_id`,`cuisine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_cuisine`
--

LOCK TABLES `restaurant_cuisine` WRITE;
/*!40000 ALTER TABLE `restaurant_cuisine` DISABLE KEYS */;
INSERT INTO `restaurant_cuisine` VALUES (1,1,1),(2,2,1),(3,3,1),(4,4,1),(5,5,1),(6,6,1),(7,7,1),(8,8,1),(9,9,1),(10,10,1);
/*!40000 ALTER TABLE `restaurant_cuisine` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_customer_restriction`
--

DROP TABLE IF EXISTS `restaurant_customer_restriction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_customer_restriction` (
  `restaurant_id` bigint NOT NULL,
  `customer_id` bigint NOT NULL,
  `reason` varchar(500) NOT NULL,
  `starts_at` timestamp NOT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`restaurant_id`,`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_customer_restriction`
--

LOCK TABLES `restaurant_customer_restriction` WRITE;
/*!40000 ALTER TABLE `restaurant_customer_restriction` DISABLE KEYS */;
INSERT INTO `restaurant_customer_restriction` VALUES (1,15,'Repeated unclaimed pickup orders.','2026-06-01 16:00:00','2026-07-01 16:00:00',0),(2,11,'Chargeback investigation.','2026-09-15 17:00:00','2026-10-15 17:00:00',1),(3,12,'Abusive communication with staff.','2026-09-20 19:00:00',NULL,1),(4,13,'Temporary restriction after disputed order.','2026-08-01 15:00:00','2026-09-01 15:00:00',0),(5,14,'Multiple fraudulent order attempts.','2026-09-28 21:00:00',NULL,1),(6,26,'Repeated no-show dine-in reservations.','2026-09-01 16:00:00','2026-10-01 16:00:00',0),(7,27,'Chargeback under review.','2026-10-01 17:00:00','2026-11-01 18:00:00',1),(8,28,'Harassment of restaurant staff.','2026-09-25 19:00:00',NULL,1),(9,29,'Temporary restriction following property damage.','2026-09-10 15:00:00','2026-12-10 16:00:00',1),(10,30,'Multiple fraudulent payment attempts.','2026-09-30 21:00:00',NULL,1);
/*!40000 ALTER TABLE `restaurant_customer_restriction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_hours`
--

DROP TABLE IF EXISTS `restaurant_hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_hours` (
  `restaurant_id` bigint NOT NULL,
  `weekday` enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') NOT NULL,
  `opens_at` time DEFAULT NULL,
  `closes_at` time DEFAULT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`restaurant_id`,`weekday`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_hours`
--

LOCK TABLES `restaurant_hours` WRITE;
/*!40000 ALTER TABLE `restaurant_hours` DISABLE KEYS */;
INSERT INTO `restaurant_hours` VALUES (1,'MONDAY','11:00:00','22:00:00',0),(2,'TUESDAY','10:30:00','21:30:00',0),(3,'WEDNESDAY','11:00:00','21:00:00',0),(4,'THURSDAY','11:30:00','23:00:00',0),(5,'SUNDAY',NULL,NULL,1),(6,'MONDAY','11:00:00','22:00:00',0),(7,'TUESDAY','10:00:00','21:00:00',0),(8,'WEDNESDAY','11:30:00','22:00:00',0),(9,'THURSDAY','10:00:00','20:00:00',0),(10,'SUNDAY','08:00:00','15:00:00',0);
/*!40000 ALTER TABLE `restaurant_hours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_hours_exception`
--

DROP TABLE IF EXISTS `restaurant_hours_exception`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_hours_exception` (
  `restaurant_id` bigint NOT NULL,
  `exception_date` date NOT NULL,
  `opens_at` time DEFAULT NULL,
  `closes_at` time DEFAULT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`restaurant_id`,`exception_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_hours_exception`
--

LOCK TABLES `restaurant_hours_exception` WRITE;
/*!40000 ALTER TABLE `restaurant_hours_exception` DISABLE KEYS */;
INSERT INTO `restaurant_hours_exception` VALUES (1,'2026-11-26',NULL,NULL,1),(2,'2026-12-24','10:00:00','16:00:00',0),(3,'2026-12-25',NULL,NULL,1),(4,'2026-12-31','11:30:00','20:00:00',0),(5,'2027-01-01','12:00:00','20:00:00',0),(6,'2026-11-27','12:00:00','20:00:00',0),(7,'2026-12-25',NULL,NULL,1),(8,'2026-11-26','12:00:00','18:00:00',0),(9,'2026-12-24','10:00:00','15:00:00',0),(10,'2027-01-01',NULL,NULL,1);
/*!40000 ALTER TABLE `restaurant_hours_exception` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_table`
--

DROP TABLE IF EXISTS `restaurant_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_table` (
  `restaurant_id` bigint NOT NULL,
  `table_code` varchar(30) NOT NULL,
  `capacity` smallint DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`restaurant_id`,`table_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_table`
--

LOCK TABLES `restaurant_table` WRITE;
/*!40000 ALTER TABLE `restaurant_table` DISABLE KEYS */;
INSERT INTO `restaurant_table` VALUES (1,'T1',4,1),(2,'A1',2,1),(3,'P1',4,1),(4,'B1',6,1),(5,'D1',4,1),(6,'R1',4,1),(7,'C1',4,1),(8,'S1',6,1),(9,'G1',2,1),(10,'M1',4,1);
/*!40000 ALTER TABLE `restaurant_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_account`
--

DROP TABLE IF EXISTS `user_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_account` (
  `user_id` bigint NOT NULL,
  `email` varchar(254) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone_number` varchar(30) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `account_type` enum('CUSTOMER','BUSINESS_OWNER','ADMINISTRATOR') NOT NULL,
  `account_status` enum('ACTIVE','SUSPENDED','DELETED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_account`
--

LOCK TABLES `user_account` WRITE;
/*!40000 ALTER TABLE `user_account` DISABLE KEYS */;
INSERT INTO `user_account` VALUES (1,'ava.admin@menumap.test','demo_hash_admin_01','+1-408-555-0101','Ava Patel','ADMINISTRATOR','ACTIVE','2026-01-05 17:00:00','2026-09-20 17:00:00'),(2,'liam.admin@menumap.test','demo_hash_admin_02','+1-408-555-0102','Liam Chen','ADMINISTRATOR','ACTIVE','2026-01-06 17:00:00','2026-09-21 17:00:00'),(3,'sofia.admin@menumap.test','demo_hash_admin_03','+1-408-555-0103','Sofia Ramirez','ADMINISTRATOR','ACTIVE','2026-01-07 17:00:00','2026-09-22 17:00:00'),(4,'noah.admin@menumap.test','demo_hash_admin_04','+1-408-555-0104','Noah Williams','ADMINISTRATOR','ACTIVE','2026-01-08 17:00:00','2026-09-23 17:00:00'),(5,'mia.admin@menumap.test','demo_hash_admin_05','+1-408-555-0105','Mia Thompson','ADMINISTRATOR','ACTIVE','2026-01-09 17:00:00','2026-09-24 17:00:00'),(6,'ethan.owner@menumap.test','demo_hash_owner_01','+1-408-555-0201','Ethan Brooks','BUSINESS_OWNER','ACTIVE','2026-02-01 17:00:00','2026-09-25 17:00:00'),(7,'olivia.owner@menumap.test','demo_hash_owner_02','+1-408-555-0202','Olivia Kim','BUSINESS_OWNER','ACTIVE','2026-02-02 17:00:00','2026-09-25 17:05:00'),(8,'lucas.owner@menumap.test','demo_hash_owner_03','+1-408-555-0203','Lucas Garcia','BUSINESS_OWNER','ACTIVE','2026-02-03 17:00:00','2026-09-25 17:10:00'),(9,'emma.owner@menumap.test','demo_hash_owner_04','+1-408-555-0204','Emma Johnson','BUSINESS_OWNER','ACTIVE','2026-02-04 17:00:00','2026-09-25 17:15:00'),(10,'mateo.owner@menumap.test','demo_hash_owner_05','+1-408-555-0205','Mateo Davis','BUSINESS_OWNER','ACTIVE','2026-02-05 17:00:00','2026-09-25 17:20:00'),(11,'zoe.customer@example.test','demo_hash_customer_01','+1-408-555-0301','Zoe Martin','CUSTOMER','ACTIVE','2026-03-01 20:00:00','2026-09-26 15:00:00'),(12,'leo.customer@example.test','demo_hash_customer_02','+1-408-555-0302','Leo Nguyen','CUSTOMER','ACTIVE','2026-03-02 20:00:00','2026-09-26 15:05:00'),(13,'nora.customer@example.test','demo_hash_customer_03','+1-408-555-0303','Nora Wilson','CUSTOMER','ACTIVE','2026-03-03 20:00:00','2026-09-26 15:10:00'),(14,'jack.customer@example.test','demo_hash_customer_04','+1-408-555-0304','Jack Brown','CUSTOMER','ACTIVE','2026-03-04 20:00:00','2026-09-26 15:15:00'),(15,'lily.customer@example.test','demo_hash_customer_05','+1-408-555-0305','Lily Anderson','CUSTOMER','ACTIVE','2026-03-05 20:00:00','2026-09-26 15:20:00'),(16,'maya.admin@menumap.test','demo_hash_admin_06','+1-408-555-0106','Maya Singh','ADMINISTRATOR','ACTIVE','2026-01-10 17:00:00','2026-09-24 17:05:00'),(17,'daniel.admin@menumap.test','demo_hash_admin_07','+1-408-555-0107','Daniel Kim','ADMINISTRATOR','ACTIVE','2026-01-11 17:00:00','2026-09-24 17:10:00'),(18,'isabella.admin@menumap.test','demo_hash_admin_08','+1-408-555-0108','Isabella Lopez','ADMINISTRATOR','ACTIVE','2026-01-12 17:00:00','2026-09-24 17:15:00'),(19,'henry.admin@menumap.test','demo_hash_admin_09','+1-408-555-0109','Henry Davis','ADMINISTRATOR','ACTIVE','2026-01-13 17:00:00','2026-09-24 17:20:00'),(20,'grace.admin@menumap.test','demo_hash_admin_10','+1-408-555-0110','Grace Wilson','ADMINISTRATOR','ACTIVE','2026-01-14 17:00:00','2026-09-24 17:25:00'),(21,'kenji.owner@menumap.test','demo_hash_owner_06','+1-408-555-0206','Kenji Tanaka','BUSINESS_OWNER','ACTIVE','2026-02-06 17:00:00','2026-09-25 17:25:00'),(22,'camila.owner@menumap.test','demo_hash_owner_07','+1-408-555-0207','Camila Torres','BUSINESS_OWNER','ACTIVE','2026-02-07 17:00:00','2026-09-25 17:30:00'),(23,'arjun.owner@menumap.test','demo_hash_owner_08','+1-408-555-0208','Arjun Mehta','BUSINESS_OWNER','ACTIVE','2026-02-08 17:00:00','2026-09-25 17:35:00'),(24,'chloe.owner@menumap.test','demo_hash_owner_09','+1-408-555-0209','Chloe Green','BUSINESS_OWNER','ACTIVE','2026-02-09 17:00:00','2026-09-25 17:40:00'),(25,'ben.owner@menumap.test','demo_hash_owner_10','+1-408-555-0210','Benjamin Reed','BUSINESS_OWNER','ACTIVE','2026-02-10 17:00:00','2026-09-25 17:45:00'),(26,'elena.customer@example.test','demo_hash_customer_06','+1-408-555-0306','Elena Petrova','CUSTOMER','ACTIVE','2026-03-06 20:00:00','2026-09-26 15:25:00'),(27,'marcus.customer@example.test','demo_hash_customer_07','+1-408-555-0307','Marcus Lee','CUSTOMER','ACTIVE','2026-03-07 20:00:00','2026-09-26 15:30:00'),(28,'priya.customer@example.test','demo_hash_customer_08','+1-408-555-0308','Priya Shah','CUSTOMER','ACTIVE','2026-03-08 19:00:00','2026-09-26 15:35:00'),(29,'owen.customer@example.test','demo_hash_customer_09','+1-408-555-0309','Owen Miller','CUSTOMER','ACTIVE','2026-03-09 19:00:00','2026-09-26 15:40:00'),(30,'sophia.customer@example.test','demo_hash_customer_10','+1-408-555-0310','Sophia Clark','CUSTOMER','ACTIVE','2026-03-10 19:00:00','2026-09-26 15:45:00');
/*!40000 ALTER TABLE `user_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'MenuMap'
--

--
-- Dumping routines for database 'MenuMap'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26 13:01:37
