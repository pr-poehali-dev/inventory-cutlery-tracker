ALTER TABLE t_p23128842_inventory_cutlery_tr.inventory_entries 
ADD COLUMN IF NOT EXISTS responsible_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS responsible_date DATE;