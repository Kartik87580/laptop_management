-- ============================================================
-- Laptop Repair Management System - Database Schema
-- Database: Neon PostgreSQL
-- ============================================================

-- Drop table if exists (useful for fresh setup)
DROP TABLE IF EXISTS repairs;

-- Create the repairs table
CREATE TABLE repairs (
    id               SERIAL PRIMARY KEY,
    job_id           VARCHAR(20) UNIQUE NOT NULL,
    customer_name    VARCHAR(100) NOT NULL,
    phone            VARCHAR(15) NOT NULL,
    alternate_phone  VARCHAR(15),
    brand            VARCHAR(50) NOT NULL,
    model            VARCHAR(100) NOT NULL,
    serial_number    VARCHAR(100),
    service_tag      VARCHAR(100),
    problem          TEXT NOT NULL,
    accessories      TEXT,                          -- stored as comma-separated string
    technician       VARCHAR(100),
    estimated_amount NUMERIC(10, 2) DEFAULT 0,
    repair_notes     TEXT,
    status           VARCHAR(30) NOT NULL DEFAULT 'Received',
    received_date    DATE NOT NULL,
    received_time    TIME,
    delivery_date    DATE,
    delivery_time    TIME,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster search queries
CREATE INDEX idx_repairs_job_id        ON repairs (job_id);
CREATE INDEX idx_repairs_customer_name ON repairs (customer_name);
CREATE INDEX idx_repairs_phone         ON repairs (phone);
CREATE INDEX idx_repairs_status        ON repairs (status);
CREATE INDEX idx_repairs_brand         ON repairs (brand);

-- ============================================================
-- Sample data (optional – remove before production use)
-- ============================================================
INSERT INTO repairs (
    job_id, customer_name, phone, alternate_phone,
    brand, model, serial_number, service_tag,
    problem, accessories, technician, estimated_amount,
    repair_notes, status, received_date, received_time
) VALUES
(
    'JOB-0001', 'Rahul Sharma', '9876543210', '9123456780',
    'Dell', 'Inspiron 15', 'SN123456', 'TAG789',
    'Laptop not turning on, battery issue suspected',
    'Charger,Bag',
    'Karthik', 1500.00,
    'Battery replacement may be needed',
    'Repairing', '2026-06-20', '10:30:00'
),
(
    'JOB-0002', 'Priya Nair', '9988776655', NULL,
    'HP', 'Pavilion 14', 'SN654321', NULL,
    'Screen cracked, display flickering',
    'Charger',
    'Karthik', 4500.00,
    'Need to order display panel',
    'Waiting for Parts', '2026-06-22', '14:00:00'
),
(
    'JOB-0003', 'Arun Kumar', '9112233445', '9223344556',
    'Lenovo', 'ThinkPad E14', 'SN999888', 'LNV123',
    'Keyboard not working, some keys missing',
    'Mouse',
    'Karthik', 800.00,
    'Keyboard replacement done',
    'Ready', '2026-06-24', '11:00:00'
);
