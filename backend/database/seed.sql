-- ============================================================
-- MediTrack Database Initial Seed Data
-- Database: meditrack_db
-- ============================================================

USE meditrack_db;

-- Clear existing data in reverse order of foreign key dependency
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE email_notifications;
TRUNCATE TABLE sale_items;
TRUNCATE TABLE sales;
TRUNCATE TABLE medicines;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Initial Users
-- Default Demo User password is: "MediTrack2026!"
-- BCrypt hash for "MediTrack2026!" with 10 rounds:
-- $2a$10$7Z8v6nNq3qK.J0yZ7q7Y4uJ8v6nNq3qK.J0yZ7q7Y4uJ8v6nNq3qK (we will also seed via script)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('alex', 'demo@meditrack.app', '$2a$10$A6Pz69gYp27w/wMvPZ9z.e8w9u7/tF00z61A9vJ6y2F5V9xK7.aKi', 'Alex Morgan', 'admin'),
('john_staff', 'staff@meditrack.app', '$2a$10$A6Pz69gYp27w/wMvPZ9z.e8w9u7/tF00z61A9vJ6y2F5V9xK7.aKi', 'John Doe', 'staff');

-- 2. Insert Suppliers
INSERT INTO suppliers (id, name, contact_person, email, phone, address) VALUES
(1, 'PharmaCare Distro Ltd', 'Sarah Jenkins', 'contact@pharmacare.com', '+1-800-555-0199', '100 Medical Park Blvd, Suite 400, Chicago, IL'),
(2, 'BioMed Supplies Corp', 'Marcus Vance', 'orders@biomedsupplies.com', '+1-800-555-0244', '450 Tech Health Way, Boston, MA'),
(3, 'Apex Health Wholesale', 'Elena Rostova', 'sales@apexhealth.com', '+1-800-555-0311', '72 Life Science Lane, San Diego, CA');

-- 3. Insert Sample Medicines
-- Note: Includes low stock items (quantity <= min_stock_level), expiring items (expiry in 30-60 days), and normal stock.
INSERT INTO medicines (name, generic_name, category, batch_number, stock_quantity, min_stock_level, expiry_date, unit_price, supplier_id, location, notes) VALUES
-- Normal Stock Items
('Amoxicillin 500mg', 'Amoxicillin Trihydrate', 'Antibiotic', 'BATCH-2026-001', 450, 50, '2027-08-15', 12.50, 1, 'Shelf A1', 'Store in a cool dry place'),
('Paracetamol 500mg', 'Acetaminophen', 'Analgesic', 'BATCH-2026-002', 1200, 100, '2028-03-20', 4.20, 2, 'Shelf B2', 'Standard pain relief'),
('Ibuprofen 400mg', 'Ibuprofen', 'NSAID / Analgesic', 'BATCH-2026-003', 600, 80, '2027-11-10', 6.80, 1, 'Shelf B3', 'For pain and inflammation'),
('Metformin 850mg', 'Metformin Hydrochloride', 'Antidiabetic', 'BATCH-2026-004', 350, 40, '2027-05-30', 15.00, 3, 'Shelf C1', 'Diabetes management'),
('Atorvastatin 20mg', 'Atorvastatin Calcium', 'Cardiovascular', 'BATCH-2026-005', 280, 30, '2027-12-01', 22.40, 2, 'Shelf C4', 'Cholesterol medication'),
('Omeprazole 20mg', 'Omeprazole', 'Gastrointestinal', 'BATCH-2026-006', 500, 60, '2028-01-15', 18.00, 1, 'Shelf D2', 'Acid reflux treatment'),

-- Low Stock Items (quantity <= min_stock_level)
('Azithromycin 250mg', 'Azithromycin', 'Antibiotic', 'BATCH-2026-007', 8, 25, '2027-04-10', 24.50, 1, 'Shelf A3', 'CRITICAL LOW STOCK'),
('Insulin Glargine 100U/ml', 'Insulin Glargine', 'Antidiabetic', 'BATCH-2026-008', 5, 20, '2026-12-25', 65.00, 2, 'Fridge R1', 'Keep refrigerated 2-8°C. Low stock!'),
('Albuterol Inhaler 90mcg', 'Albuterol Sulfate', 'Respiratory', 'BATCH-2026-009', 4, 15, '2027-02-18', 35.00, 3, 'Shelf E1', 'Reorder needed immediately'),

-- Expiring Soon Items (Expiry within near future / 30-90 days)
('Ciprofloxacin 500mg', 'Ciprofloxacin HCl', 'Antibiotic', 'BATCH-2025-088', 120, 30, '2026-10-15', 14.20, 1, 'Shelf A2', 'Expiring within 30 days!'),
('Cetirizine 10mg', 'Cetirizine Hydrochloride', 'Antihistamine', 'BATCH-2025-092', 95, 20, '2026-10-30', 8.50, 2, 'Shelf F1', 'Expiring soon'),
('Vitamin D3 50000IU', 'Cholecalciferol', 'Vitamins', 'BATCH-2025-099', 45, 15, '2026-11-15', 19.99, 3, 'Shelf V2', 'Expiring within 60 days'),

-- Already Expired Item (for testing expiry filters)
('Doxycycline 100mg', 'Doxycycline Hyclate', 'Antibiotic', 'BATCH-2024-045', 30, 20, '2026-08-01', 11.00, 1, 'Quarantine Bin Q1', 'EXPIRED - Do not dispense');
