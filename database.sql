-- MedBook Database Schema
CREATE DATABASE IF NOT EXISTS medbook_db;
USE medbook_db;

-- Users table (patients)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    experience_years INT,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INT DEFAULT 0,
    consultation_fee DECIMAL(10,2),
    image_url VARCHAR(255)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Specialties table
CREATE TABLE IF NOT EXISTS specialties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon_class VARCHAR(50)
);

-- Insert sample data
INSERT INTO specialties (name, description, icon_class) VALUES
('Cardiology', 'Heart and cardiovascular system specialists', 'fas fa-heartbeat'),
('Dentistry', 'Oral health and dental care specialists', 'fas fa-tooth'),
('Neurology', 'Nervous system and brain specialists', 'fas fa-brain'),
('Pediatrics', 'Child healthcare specialists', 'fas fa-baby'),
('Ophthalmology', 'Eye care and vision specialists', 'fas fa-eye'),
('Orthopedics', 'Bone and joint specialists', 'fas fa-bone'),
('Pulmonology', 'Lung and respiratory system specialists', 'fas fa-lungs'),
('Allergy & Immunology', 'Allergy and immune system specialists', 'fas fa-allergies');

-- Insert sample doctors
INSERT INTO doctors (name, specialty, location, rating, total_reviews, experience_years, consultation_fee) VALUES
('Dr. Sarah Johnson', 'Cardiology', 'New York, NY', 4.5, 128, 12, 200.00),
('Dr. Michael Chen', 'Dermatology', 'Los Angeles, CA', 5.0, 94, 8, 180.00),
('Dr. Emily Rodriguez', 'Pediatrics', 'Chicago, IL', 4.0, 156, 15, 150.00),
('Dr. James Wilson', 'Neurology', 'Houston, TX', 4.5, 87, 10, 220.00),
('Dr. Lisa Brown', 'Orthopedics', 'Miami, FL', 4.2, 65, 7, 190.00),
('Dr. Robert Davis', 'Ophthalmology', 'Phoenix, AZ', 4.8, 112, 20, 210.00);