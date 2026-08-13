-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 13, 2026 at 09:16 PM
-- Server version: 8.4.7
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rshs`
--

-- --------------------------------------------------------

--
-- Table structure for table `country`
--

DROP TABLE IF EXISTS `country`;
CREATE TABLE IF NOT EXISTS `country` (
  `Code` char(3) NOT NULL DEFAULT '',
  `Name` char(52) NOT NULL DEFAULT '',
  `Continent` enum('Asia','Europe','North America','Africa','Oceania','Antarctica','South America') NOT NULL DEFAULT 'Asia',
  PRIMARY KEY (`Code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `country`
--

INSERT INTO `country` (`Code`, `Name`, `Continent`) VALUES
('ABW', 'Aruba', 'North America'),
('AFG', 'Afghanistan', 'Asia'),
('AGO', 'Angola', 'Africa'),
('AIA', 'Anguilla', 'North America'),
('ALB', 'Albania', 'Europe'),
('AND', 'Andorra', 'Europe'),
('ANT', 'Netherlands Antilles', 'North America'),
('ARE', 'United Arab Emirates', 'Asia'),
('ARG', 'Argentina', 'South America'),
('ARM', 'Armenia', 'Asia'),
('ASM', 'American Samoa', 'Oceania'),
('ATA', 'Antarctica', 'Antarctica'),
('ATF', 'French Southern territories', 'Antarctica'),
('ATG', 'Antigua and Barbuda', 'North America'),
('AUS', 'Australia', 'Oceania'),
('AUT', 'Austria', 'Europe'),
('AZE', 'Azerbaijan', 'Asia'),
('BDI', 'Burundi', 'Africa'),
('BEL', 'Belgium', 'Europe'),
('BEN', 'Benin', 'Africa'),
('BFA', 'Burkina Faso', 'Africa'),
('BGD', 'Bangladesh', 'Asia'),
('BGR', 'Bulgaria', 'Europe'),
('BHR', 'Bahrain', 'Asia'),
('BHS', 'Bahamas', 'North America'),
('BIH', 'Bosnia and Herzegovina', 'Europe'),
('BLR', 'Belarus', 'Europe'),
('BLZ', 'Belize', 'North America'),
('BMU', 'Bermuda', 'North America'),
('BOL', 'Bolivia', 'South America'),
('BRA', 'Brazil', 'South America'),
('BRB', 'Barbados', 'North America'),
('BRN', 'Brunei', 'Asia'),
('BTN', 'Bhutan', 'Asia'),
('BVT', 'Bouvet Island', 'Antarctica'),
('BWA', 'Botswana', 'Africa'),
('CAF', 'Central African Republic', 'Africa'),
('CAN', 'Canada', 'North America'),
('CCK', 'Cocos (Keeling) Islands', 'Oceania'),
('CHE', 'Switzerland', 'Europe'),
('CHL', 'Chile', 'South America'),
('CHN', 'China', 'Asia'),
('CIV', 'Côte d’Ivoire', 'Africa'),
('CMR', 'Cameroon', 'Africa'),
('COD', 'Congo, The Democratic Republic of the', 'Africa'),
('COG', 'Congo', 'Africa'),
('COK', 'Cook Islands', 'Oceania'),
('COL', 'Colombia', 'South America'),
('COM', 'Comoros', 'Africa'),
('CPV', 'Cape Verde', 'Africa'),
('CRI', 'Costa Rica', 'North America'),
('CUB', 'Cuba', 'North America'),
('CXR', 'Christmas Island', 'Oceania'),
('CYM', 'Cayman Islands', 'North America'),
('CYP', 'Cyprus', 'Asia'),
('CZE', 'Czech Republic', 'Europe'),
('DEU', 'Germany', 'Europe'),
('DJI', 'Djibouti', 'Africa'),
('DMA', 'Dominica', 'North America'),
('DNK', 'Denmark', 'Europe'),
('DOM', 'Dominican Republic', 'North America'),
('DZA', 'Algeria', 'Africa'),
('ECU', 'Ecuador', 'South America'),
('EGY', 'Egypt', 'Africa'),
('ERI', 'Eritrea', 'Africa'),
('ESH', 'Western Sahara', 'Africa'),
('ESP', 'Spain', 'Europe'),
('EST', 'Estonia', 'Europe'),
('ETH', 'Ethiopia', 'Africa'),
('FIN', 'Finland', 'Europe'),
('FJI', 'Fiji Islands', 'Oceania'),
('FLK', 'Falkland Islands', 'South America'),
('FRA', 'France', 'Europe'),
('FRO', 'Faroe Islands', 'Europe'),
('FSM', 'Micronesia, Federated States of', 'Oceania'),
('GAB', 'Gabon', 'Africa'),
('GBR', 'United Kingdom', 'Europe'),
('GEO', 'Georgia', 'Asia'),
('GHA', 'Ghana', 'Africa'),
('GIB', 'Gibraltar', 'Europe'),
('GIN', 'Guinea', 'Africa'),
('GLP', 'Guadeloupe', 'North America'),
('GMB', 'Gambia', 'Africa'),
('GNB', 'Guinea-Bissau', 'Africa'),
('GNQ', 'Equatorial Guinea', 'Africa'),
('GRC', 'Greece', 'Europe'),
('GRD', 'Grenada', 'North America'),
('GRL', 'Greenland', 'North America'),
('GTM', 'Guatemala', 'North America'),
('GUF', 'French Guiana', 'South America'),
('GUM', 'Guam', 'Oceania'),
('GUY', 'Guyana', 'South America'),
('HKG', 'Hong Kong', 'Asia'),
('HMD', 'Heard Island and McDonald Islands', 'Antarctica'),
('HND', 'Honduras', 'North America'),
('HRV', 'Croatia', 'Europe'),
('HTI', 'Haiti', 'North America'),
('HUN', 'Hungary', 'Europe'),
('IDN', 'Indonesia', 'Asia'),
('IND', 'India', 'Asia'),
('IOT', 'British Indian Ocean Territory', 'Africa'),
('IRL', 'Ireland', 'Europe'),
('IRN', 'Iran', 'Asia'),
('IRQ', 'Iraq', 'Asia'),
('ISL', 'Iceland', 'Europe'),
('ISR', 'Israel', 'Asia'),
('ITA', 'Italy', 'Europe'),
('JAM', 'Jamaica', 'North America'),
('JOR', 'Jordan', 'Asia'),
('JPN', 'Japan', 'Asia'),
('KAZ', 'Kazakstan', 'Asia'),
('KEN', 'Kenya', 'Africa'),
('KGZ', 'Kyrgyzstan', 'Asia'),
('KHM', 'Cambodia', 'Asia'),
('KIR', 'Kiribati', 'Oceania'),
('KNA', 'Saint Kitts and Nevis', 'North America'),
('KOR', 'South Korea', 'Asia'),
('KWT', 'Kuwait', 'Asia'),
('LAO', 'Laos', 'Asia'),
('LBN', 'Lebanon', 'Asia'),
('LBR', 'Liberia', 'Africa'),
('LBY', 'Libyan Arab Jamahiriya', 'Africa'),
('LCA', 'Saint Lucia', 'North America'),
('LIE', 'Liechtenstein', 'Europe'),
('LKA', 'Sri Lanka', 'Asia'),
('LSO', 'Lesotho', 'Africa'),
('LTU', 'Lithuania', 'Europe'),
('LUX', 'Luxembourg', 'Europe'),
('LVA', 'Latvia', 'Europe'),
('MAC', 'Macao', 'Asia'),
('MAR', 'Morocco', 'Africa'),
('MCO', 'Monaco', 'Europe'),
('MDA', 'Moldova', 'Europe'),
('MDG', 'Madagascar', 'Africa'),
('MDV', 'Maldives', 'Asia'),
('MEX', 'Mexico', 'North America'),
('MHL', 'Marshall Islands', 'Oceania'),
('MKD', 'Macedonia', 'Europe'),
('MLI', 'Mali', 'Africa'),
('MLT', 'Malta', 'Europe'),
('MMR', 'Myanmar', 'Asia'),
('MNG', 'Mongolia', 'Asia'),
('MNP', 'Northern Mariana Islands', 'Oceania'),
('MOZ', 'Mozambique', 'Africa'),
('MRT', 'Mauritania', 'Africa'),
('MSR', 'Montserrat', 'North America'),
('MTQ', 'Martinique', 'North America'),
('MUS', 'Mauritius', 'Africa'),
('MWI', 'Malawi', 'Africa'),
('MYS', 'Malaysia', 'Asia'),
('MYT', 'Mayotte', 'Africa'),
('NAM', 'Namibia', 'Africa'),
('NCL', 'New Caledonia', 'Oceania'),
('NER', 'Niger', 'Africa'),
('NFK', 'Norfolk Island', 'Oceania'),
('NGA', 'Nigeria', 'Africa'),
('NIC', 'Nicaragua', 'North America'),
('NIU', 'Niue', 'Oceania'),
('NLD', 'Netherlands', 'Europe'),
('NOR', 'Norway', 'Europe'),
('NPL', 'Nepal', 'Asia'),
('NRU', 'Nauru', 'Oceania'),
('NZL', 'New Zealand', 'Oceania'),
('OMN', 'Oman', 'Asia'),
('PAK', 'Pakistan', 'Asia'),
('PAN', 'Panama', 'North America'),
('PCN', 'Pitcairn', 'Oceania'),
('PER', 'Peru', 'South America'),
('PHL', 'Philippines', 'Asia'),
('PLW', 'Palau', 'Oceania'),
('PNG', 'Papua New Guinea', 'Oceania'),
('POL', 'Poland', 'Europe'),
('PRI', 'Puerto Rico', 'North America'),
('PRK', 'North Korea', 'Asia'),
('PRT', 'Portugal', 'Europe'),
('PRY', 'Paraguay', 'South America'),
('PSE', 'Palestine', 'Asia'),
('PYF', 'French Polynesia', 'Oceania'),
('QAT', 'Qatar', 'Asia'),
('REU', 'Réunion', 'Africa'),
('ROM', 'Romania', 'Europe'),
('RUS', 'Russian Federation', 'Europe'),
('RWA', 'Rwanda', 'Africa'),
('SAU', 'Saudi Arabia', 'Asia'),
('SDN', 'Sudan', 'Africa'),
('SEN', 'Senegal', 'Africa'),
('SGP', 'Singapore', 'Asia'),
('SGS', 'South Georgia and the South Sandwich Islands', 'Antarctica'),
('SHN', 'Saint Helena', 'Africa'),
('SJM', 'Svalbard and Jan Mayen', 'Europe'),
('SLB', 'Solomon Islands', 'Oceania'),
('SLE', 'Sierra Leone', 'Africa'),
('SLV', 'El Salvador', 'North America'),
('SMR', 'San Marino', 'Europe'),
('SOM', 'Somalia', 'Africa'),
('SPM', 'Saint Pierre and Miquelon', 'North America'),
('STP', 'Sao Tome and Principe', 'Africa'),
('SUR', 'Suriname', 'South America'),
('SVK', 'Slovakia', 'Europe'),
('SVN', 'Slovenia', 'Europe'),
('SWE', 'Sweden', 'Europe'),
('SWZ', 'Swaziland', 'Africa'),
('SYC', 'Seychelles', 'Africa'),
('SYR', 'Syria', 'Asia'),
('TCA', 'Turks and Caicos Islands', 'North America'),
('TCD', 'Chad', 'Africa'),
('TGO', 'Togo', 'Africa'),
('THA', 'Thailand', 'Asia'),
('TJK', 'Tajikistan', 'Asia'),
('TKL', 'Tokelau', 'Oceania'),
('TKM', 'Turkmenistan', 'Asia'),
('TMP', 'East Timor', 'Asia'),
('TON', 'Tonga', 'Oceania'),
('TTO', 'Trinidad and Tobago', 'North America'),
('TUN', 'Tunisia', 'Africa'),
('TUR', 'Turkey', 'Asia'),
('TUV', 'Tuvalu', 'Oceania'),
('TWN', 'Taiwan', 'Asia'),
('TZA', 'Tanzania', 'Africa'),
('UGA', 'Uganda', 'Africa'),
('UKR', 'Ukraine', 'Europe'),
('UMI', 'United States Minor Outlying Islands', 'Oceania'),
('URY', 'Uruguay', 'South America'),
('USA', 'United States', 'North America'),
('UZB', 'Uzbekistan', 'Asia'),
('VAT', 'Holy See (Vatican City State)', 'Europe'),
('VCT', 'Saint Vincent and the Grenadines', 'North America'),
('VEN', 'Venezuela', 'South America'),
('VGB', 'Virgin Islands, British', 'North America'),
('VIR', 'Virgin Islands, U.S.', 'North America'),
('VNM', 'Vietnam', 'Asia'),
('VUT', 'Vanuatu', 'Oceania'),
('WLF', 'Wallis and Futuna', 'Oceania'),
('WSM', 'Samoa', 'Oceania'),
('YEM', 'Yemen', 'Asia'),
('YUG', 'Yugoslavia', 'Europe'),
('ZAF', 'South Africa', 'Africa'),
('ZMB', 'Zambia', 'Africa'),
('ZWE', 'Zimbabwe', 'Africa');

-- --------------------------------------------------------

--
-- Table structure for table `profile`
--

DROP TABLE IF EXISTS `profile`;
CREATE TABLE IF NOT EXISTS `profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_city` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Hamilton',
  `current_country` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'New Zealand',
  `year` int NOT NULL,
  `student_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `profile`
--

INSERT INTO `profile` (`id`, `firstname`, `lastname`, `email`, `current_city`, `current_country`, `year`, `student_id`, `user_id`) VALUES
(8, 'Lamine', 'Yamal', '', 'Hamilton', 'New Zealand', 2015, 876498897, 22),
(2, 'Mike B', 'Allister', 'mike.b@rshs.ac.nz', 'Hamilton', 'New Zealand', 2024, 200145, 14),
(3, 'David', 'Cameron', 'dave.b@rshs.ac.nz', 'Hamilton', 'New Zealand', 2023, 240145, 12),
(4, 'jimmy', 'carter', 'dave.b@rshs.ac.nz', 'Hamilton', 'New Zealand', 2022, 240165, 17),
(5, 'Batista', 'Dave', 'dave.b@rshs.ac.nz', 'Hamilton', 'New Zealand', 2019, 240877, 18),
(6, 'Ferran', 'Torres', 'f.torres@rshs.ac.nz', 'Hamilton', 'New Zealand', 2018, 98768, 20),
(7, 'John', 'Terry', 'j.terry@rshs.ac.nz', 'Hamilton', 'New Zealand', 2010, 1221232, 21);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `approved_date` date NOT NULL,
  `admin` int NOT NULL DEFAULT '0',
  `connect` int NOT NULL DEFAULT '0',
  `active` int NOT NULL DEFAULT '2',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `approved_date`, `admin`, `connect`, `active`) VALUES
(5, 'testuser', '$2b$10$/0.KdnKJCNqsszGlu3vnD.b0mmIgmYOMYEfWeq3mnI5iUFd7qUMzO', '0000-00-00', 0, 0, 0),
(12, 'User', '$2b$10$q0BGj72K9EnzJtwgTI62Qe16aI8sSnKC7nWpJATDhVFht.5xtYxNq', '0000-00-00', 0, 0, 0),
(13, 'azar', '$2b$10$4q.U/6wGFocMUru0OVOSp.Ho3DojSJrNmL4r1MnE95v7yZ1NACmfy', '0000-00-00', 1, 0, 1),
(14, 'Tim', '$2b$10$aXkOoyzAzK7w5f/sjsfNh.H5c7LwpgdpptrmWoY4LStwfcBkHX/HO', '0000-00-00', 1, 0, 1),
(15, 'john', '$2b$10$yVs2.sLIIt8/rrR/LZCtbeJCD6flNIFAFiGSBKOzflzCRdJuA8y8C', '0000-00-00', 0, 0, 0),
(16, 'timbok', '$2b$10$VT9KlsGy0zENKt8/nrVSM.b8SRuNDw7hZROPhcm7ebXMXWrscw1Um', '0000-00-00', 0, 0, 0),
(17, 'jimmy', '$2b$10$80ovHu9nxtsJRnkTZosrOOq.kuKz4VL7mEq2O/Y7lPL90xVnCkeiy', '0000-00-00', 0, 0, 1),
(18, 'batista', '$2b$10$jJUuUhSM4NFGP0OxrKviue2OQoTv0DWOBxcp.20jKWH/FnX/du322', '0000-00-00', 0, 0, 0),
(19, 'testing', '$2b$10$B0I4OowBDA9lK2BmX465ve4l7f8ADvLq800uCMMAlVsrnQKoWcoZa', '0000-00-00', 0, 0, 0),
(20, 'Ferran', '$2b$10$/uO5e02cjaa8EAwjhmBX9eBDgV3rJKY6OlxFQPsrx.NE28v6xR9f.', '0000-00-00', 0, 0, 2),
(21, 'terry', '$2b$10$UPnO9wS1cibHJM3Ng76N7eztSHuFngg.OJOUOF2iH1fMVvk/4.OEi', '0000-00-00', 0, 0, 1),
(22, 'bob', '$2b$10$vI1/uDKy.SHXidjZMWI6fu.bOy0T1RsVLIxm2dCvK0.kWwqTBM9Vy', '0000-00-00', 0, 0, 1);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
