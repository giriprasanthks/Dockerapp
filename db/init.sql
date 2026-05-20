CREATE DATABASE IF NOT EXISTS gardendb;
USE gardendb;

-- Plants catalogue
CREATE TABLE IF NOT EXISTS plants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    sunlight VARCHAR(50),
    watering VARCHAR(50),
    soil_type VARCHAR(100),
    season VARCHAR(50),
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Garden plots owned by users
CREATE TABLE IF NOT EXISTS garden_plots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plot_name VARCHAR(100) NOT NULL,
    size_sqft FLOAT,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Plants added to garden plots
CREATE TABLE IF NOT EXISTS plot_plants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plot_id INT NOT NULL,
    plant_id INT NOT NULL,
    planted_date DATE,
    quantity INT DEFAULT 1,
    notes TEXT,
    status ENUM('planted','growing','harvested','removed') DEFAULT 'planted',
    FOREIGN KEY (plot_id) REFERENCES garden_plots(id) ON DELETE CASCADE,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
);

-- Care tasks / reminders
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plot_id INT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plot_id) REFERENCES garden_plots(id) ON DELETE SET NULL
);

-- Seed data – plant catalogue
INSERT INTO plants (name, category, description, sunlight, watering, soil_type, season, image_url) VALUES
('Rose',        'Flower',    'Classic fragrant flower, perfect for borders.',       'Full Sun',    'Moderate',   'Well-drained loamy',   'Spring/Summer', '/static/images/rose.png'),
('Tomato',      'Vegetable', 'Easy to grow fruiting vegetable for warm seasons.',   'Full Sun',    'Regular',    'Rich, well-drained',   'Summer',        '/static/images/tomato.png'),
('Basil',       'Herb',      'Aromatic herb great for cooking and companion planting.','Full Sun', 'Regular',    'Moist, well-drained',  'Summer',        '/static/images/basil.png'),
('Lavender',    'Flower',    'Drought-tolerant purple flower with calming scent.',  'Full Sun',    'Low',        'Sandy, well-drained',  'Spring/Summer', '/static/images/lavender.png'),
('Spinach',     'Vegetable', 'Cool-season leafy green packed with nutrients.',      'Partial Shade','Regular',   'Fertile, moist',       'Spring/Fall',   '/static/images/spinach.png'),
('Mint',        'Herb',      'Fast-growing herb best kept in containers.',          'Partial Sun', 'Regular',    'Moist, rich',          'Spring-Fall',   '/static/images/mint.png'),
('Sunflower',   'Flower',    'Tall, cheerful annual that attracts pollinators.',    'Full Sun',    'Moderate',   'Well-drained',         'Summer',        '/static/images/sunflower.png'),
('Carrot',      'Vegetable', 'Root vegetable that prefers deep, loose soil.',       'Full Sun',    'Regular',    'Deep, loose, sandy',   'Spring/Fall',   '/static/images/carrot.png');
