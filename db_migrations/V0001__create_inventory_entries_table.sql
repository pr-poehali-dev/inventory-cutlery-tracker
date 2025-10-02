CREATE TABLE IF NOT EXISTS t_p23128842_inventory_cutlery_tr.inventory_entries (
    id SERIAL PRIMARY KEY,
    venue VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    forks INTEGER NOT NULL DEFAULT 0,
    knives INTEGER NOT NULL DEFAULT 0,
    steak_knives INTEGER NOT NULL DEFAULT 0,
    spoons INTEGER NOT NULL DEFAULT 0,
    dessert_spoons INTEGER NOT NULL DEFAULT 0,
    ice_cooler INTEGER NOT NULL DEFAULT 0,
    plates INTEGER NOT NULL DEFAULT 0,
    sugar_tongs INTEGER NOT NULL DEFAULT 0,
    ice_tongs INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_venue_date ON t_p23128842_inventory_cutlery_tr.inventory_entries(venue, entry_date DESC);

INSERT INTO t_p23128842_inventory_cutlery_tr.inventory_entries 
(venue, entry_date, forks, knives, steak_knives, spoons, dessert_spoons, ice_cooler, plates, sugar_tongs, ice_tongs)
VALUES 
('PORT', '2025-10-01', 120, 110, 48, 115, 95, 3, 140, 6, 4),
('PORT', '2025-10-02', 118, 108, 47, 112, 93, 3, 138, 6, 4),
('PORT', '2025-09-30', 122, 112, 48, 116, 96, 3, 142, 6, 4),
('PORT', '2025-09-29', 119, 109, 46, 113, 94, 3, 139, 6, 4),
('Диккенс', '2025-10-01', 95, 88, 35, 92, 78, 2, 110, 4, 3),
('Диккенс', '2025-10-02', 93, 86, 34, 90, 76, 2, 108, 4, 3),
('Диккенс', '2025-09-30', 97, 90, 36, 94, 80, 2, 112, 4, 3),
('Диккенс', '2025-09-29', 94, 87, 35, 91, 77, 2, 109, 4, 3);