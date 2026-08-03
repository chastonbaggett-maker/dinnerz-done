-- Sample seed data for Dinnerz Done

INSERT INTO menu_items (id, name, description, base_price_cents, image_url, sort_order) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Herb Roasted Chicken', 'Half chicken with seasonal vegetables and mashed potatoes', 1800, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=400&fit=crop&q=80', 1),
  ('a1000000-0000-4000-8000-000000000002', 'Beef Pot Roast', 'Slow-braised beef with carrots, onions, and gravy', 2000, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=400&fit=crop&q=80', 2),
  ('a1000000-0000-4000-8000-000000000003', 'Vegetable Lasagna', 'Layers of pasta, ricotta, and roasted vegetables', 1600, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=400&fit=crop&q=80', 3),
  ('a1000000-0000-4000-8000-000000000004', 'Salmon with Lemon Dill', 'Pan-seared salmon, rice pilaf, and green beans', 2200, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop&q=80', 4),
  ('a1000000-0000-4000-8000-000000000005', 'BBQ Pulled Pork', 'Slow-smoked pulled pork with coleslaw and cornbread', 1900, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop&q=80', 5),
  ('a1000000-0000-4000-8000-000000000006', 'Mediterranean Quinoa Bowl', 'Quinoa, chickpeas, feta, olives, and roasted vegetables', 1700, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop&q=80', 6),
  ('a1000000-0000-4000-8000-000000000007', 'Turkey Meatloaf', 'Homestyle meatloaf with mashed potatoes and green beans', 1800, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&q=80', 7),
  ('a1000000-0000-4000-8000-000000000008', 'Shrimp Scampi Pasta', 'Garlic butter shrimp over linguine with parsley', 2100, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop&q=80', 8),
  ('a1000000-0000-4000-8000-000000000009', 'Chicken Parmesan', 'Breaded chicken cutlet with marinara and mozzarella, served with pasta', 1900, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop&q=80', 9),
  ('a1000000-0000-4000-8000-000000000010', 'Stuffed Bell Peppers', 'Bell peppers filled with ground beef, rice, and tomato sauce', 1700, 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=400&fit=crop&q=80', 10),
  ('a1000000-0000-4000-8000-000000000011', 'Fish Tacos', 'Crispy cod tacos with cabbage slaw and lime crema', 1800, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop&q=80', 11),
  ('a1000000-0000-4000-8000-000000000012', 'Shepherd''s Pie', 'Ground lamb and vegetables topped with creamy mashed potatoes', 1900, 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=400&fit=crop&q=80', 12);

INSERT INTO customization_groups (id, menu_item_id, name, type, min_selections, max_selections, required, sort_order) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'Side', 'single_choice', 1, 1, true, 1),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'Extra sauce', 'quantity', 0, 3, false, 2),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'Special instructions', 'text', 0, 1, false, 3),
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000002', 'Add-ons', 'multi_choice', 0, 3, false, 1);

INSERT INTO customization_options (group_id, name, price_modifier_cents, sort_order) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'Mashed potatoes', 0, 1),
  ('b1000000-0000-4000-8000-000000000001', 'Roasted vegetables', 0, 2),
  ('b1000000-0000-4000-8000-000000000001', 'Rice pilaf', 0, 3),
  ('b1000000-0000-4000-8000-000000000002', 'Extra gravy', 50, 1),
  ('b1000000-0000-4000-8000-000000000004', 'Extra bread roll', 150, 1),
  ('b1000000-0000-4000-8000-000000000004', 'Side salad', 300, 2);

-- Tomorrow's menu (adjust date in app or re-run with current date)
-- Uses dynamic tomorrow via a placeholder; run seed script from app bootstrap if needed
