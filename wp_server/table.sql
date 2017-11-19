crisis_raw_submission | CREATE TABLE `crisis_raw_submission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(60) NOT NULL,
  `vid` varchar(45) NOT NULL,
  `timestamp` int(11) NOT NULL,
  `hash` varchar(32) NOT NULL,
  `raw_submission` longtext NOT NULL,
  `fresh` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8
