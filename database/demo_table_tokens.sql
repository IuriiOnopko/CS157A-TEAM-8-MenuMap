-- TEST DATA! 
-- One working table QR code per restaurant, for trying dine-in ordering.
-- Each code below is stored as its SHA-256 hash. To order at a table, can use:
--   http://localhost:3000/menumap/table/<code>   (npm start)
--   http://localhost:8080/menumap/table/<code>   (Tomcat)
--
--   Harbor Grill       table T1: demo-harbor-grill-t1
--   Golden Bowl        table A1: demo-golden-bowl-a1
--   Verde Table        table P1: demo-verde-table-p1
--   Burger Foundry     table B1: demo-burger-foundry-b1
--   Cedar Kitchen      table D1: demo-cedar-kitchen-d1
--   Sakura Ramen       table R1: demo-sakura-ramen-r1
--   Casa Sol           table C1: demo-casa-sol-c1
--   Spice Route        table S1: demo-spice-route-s1
--   Green Fork         table G1: demo-green-fork-g1
--   Morning Oak Cafe   table M1: demo-morning-oak-cafe-m1

INSERT INTO `MenuMap`.`authorization_token` (`token_id`, `restaurant_id`, `table_code`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`)
VALUES ('ea6c0af2-7de4-4163-b2d7-6fe6367767cb', 1, 'T1', '29fa45f3f0bd099c4084c28cbed78144d9e7d9213d0523b2823c38ba926a4b1c', '2026-10-26 09:00:00', '2027-06-30 23:00:00', NULL);
INSERT INTO `MenuMap`.`authorization_token` (`token_id`, `restaurant_id`, `table_code`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`)
VALUES ('b4c79ba0-4ecf-4415-b9f2-4b7bf666330b', 2, 'A1', '38a0d8d90f00faffa904615e2555d0bc278ea3e9fdb66f980437e6bb3c8c220f', '2026-10-26 09:00:00', '2027-06-30 23:00:00', NULL);
INSERT INTO `MenuMap`.`authorization_token` (`token_id`, `restaurant_id`, `table_code`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`)
VALUES ('a94d1de9-8718-4456-882d-f1f43c06cb52', 3, 'P1', 'b153e238b9f6bc81de61ad7345b929cb21d8829cfeae1e312b79f8f3ff35b96e', '2026-10-26 09:00:00', '2027-06-30 23:00:00', NULL);
INSERT INTO `MenuMap`.`authorization_token` (`token_id`, `restaurant_id`, `table_code`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`)
VALUES ('1543a78c-e5eb-4a0b-b5b2-cefe19e8478a', 4, 'B1', 'fb3a40ffc3fb272e8ee987b121ffd1210da15dcf93449c5c16a534c407408677', '2026-10-26 09:00:00', '2027-06-30 23:00:00', NULL);
INSERT INTO `MenuMap`.`authorization_token` (`token_id`, `restaurant_id`, `table_code`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`)
VALUES ('8b842c93-e4d2-4053-9571-c2557bfde462', 5, 'D1', 'c78353faa10ef3d8df25c291939d2d44e330e1f240a1e4f0203712617fbd826f', '2026-10-26 09:00:00', '2027-06-30 23:00:00', NULL);
INSERT INTO `MenuMap`.`authorization_token` (`token_id`, `restaurant_id`, `table_code`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`)
VALUES ('83e4d801-a8d6-4978-a386-303023a0e2de', 6, 'R1', '18fc26c582361e508ddcfa1c0a13d648d75f1b65b77ef039d692c3acd9eaa207', '2026-10-26 09:00:00', '2027-06-30 23:00:00', NULL);
INSERT INTO `MenuMap`.`authorization_token` (`token_id`, `restaurant_id`, `table_code`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`)
VALUES ('6c80b01a-bf49-4beb-b5d0-0f2f25c0ebfe', 7, 'C1', 'db3e7303f06f63453f6f5074f05dbe30c5d8fdcddb27118eab936c110790679e', '2026-10-26 09:00:00', '2027-06-30 23:00:00', NULL);
INSERT INTO `MenuMap`.`authorization_token` (`token_id`, `restaurant_id`, `table_code`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`)
VALUES ('85069fda-8150-46f2-8161-50969a73c007', 8, 'S1', 'e342f84f176aaec7462993abdf1c74e197287d722f5bb079b9a7b63614b04969', '2026-10-26 09:00:00', '2027-06-30 23:00:00', NULL);
INSERT INTO `MenuMap`.`authorization_token` (`token_id`, `restaurant_id`, `table_code`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`)
VALUES ('70a54ad3-0b1b-41e3-bded-44a46f0a8d2f', 9, 'G1', 'bc1414fe0a59b853c19886d825208e173dd6a6504b9d918cefdb3b9cbeff3578', '2026-10-26 09:00:00', '2027-06-30 23:00:00', NULL);
INSERT INTO `MenuMap`.`authorization_token` (`token_id`, `restaurant_id`, `table_code`, `token_hash`, `issued_at`, `expires_at`, `revoked_at`)
VALUES ('1943f65c-3f7a-4971-8fe4-a25b4db13ec5', 10, 'M1', '5543e55f2b719f8b118c9208367c1fdc23d30b1eeb03de87df391f8e6e6579de', '2026-10-26 09:00:00', '2027-06-30 23:00:00', NULL);
