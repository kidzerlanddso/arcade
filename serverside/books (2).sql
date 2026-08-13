CREATE TABLE `books` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `genre` varchar(100) NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `stock` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `books` VALUES (NULL, 'The Silent Patient', 'Alex Michaelides', 'Thriller', 29.99, 20);
INSERT INTO `books` VALUES (NULL, 'Educated', 'Tara Westover', 'Memoir', 24.50, 12);
INSERT INTO `books` VALUES (NULL, 'Project Hail Mary', 'Andy Weir', 'Science Fiction', 35.00, 15);
INSERT INTO `books` VALUES (NULL, 'Atomic Habits', 'James Clear', 'Self-help', 21.95, 30);
INSERT INTO `books` VALUES (NULL, 'The Hobbit', 'J.R.R. Tolkien', 'Fantasy', 18.75, 25);
INSERT INTO `books` VALUES (NULL, 'Where the Crawdads Sing', 'Delia Owens', 'Fiction', 27.00, 22);
INSERT INTO `books` VALUES (NULL, 'The Midnight Library', 'Matt Haig', 'Fantasy', 26.50, 18);
INSERT INTO `books` VALUES (NULL, 'Circe', 'Madeline Miller', 'Fantasy', 24.95, 14);
INSERT INTO `books` VALUES (NULL, 'Becoming', 'Michelle Obama', 'Memoir', 29.99, 20);
INSERT INTO `books` VALUES (NULL, 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'History', 35.00, 12);
INSERT INTO `books` VALUES (NULL, 'The Power of Now', 'Eckhart Tolle', 'Self-help', 19.50, 25);
INSERT INTO `books` VALUES (NULL, 'Pride and Prejudice', 'Jane Austen', 'Classic', 14.99, 30);
INSERT INTO `books` VALUES (NULL, '1984', 'George Orwell', 'Classic', 16.50, 28);
INSERT INTO `books` VALUES (NULL, 'To Kill a Mockingbird', 'Harper Lee', 'Classic', 18.75, 22);
INSERT INTO `books` VALUES (NULL, 'Charlotte’s Web', 'E.B. White', 'Children', 12.50, 40);
INSERT INTO `books` VALUES (NULL, 'Harry Potter and the Sorcerer’s Stone', 'J.K. Rowling', 'Fantasy', 29.95, 35);
INSERT INTO `books` VALUES (NULL, 'The Very Hungry Caterpillar', 'Eric Carle', 'Children', 10.99, 50);
INSERT INTO `books` VALUES (NULL, 'The Lean Startup', 'Eric Ries', 'Business', 25.00, 15);
INSERT INTO `books` VALUES (NULL, 'Deep Work', 'Cal Newport', 'Productivity', 23.75, 18);
INSERT INTO `books` VALUES (NULL, 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Psychology', 28.50, 20);

