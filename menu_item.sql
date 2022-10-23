USE db_order;

TRUNCATE TABLE menu_item_category;
TRUNCATE TABLE menu_item_subcategory;
TRUNCATE TABLE menu_item;

-- CATEGORY
INSERT INTO menu_item_category VALUES (NULL, 'category 1', '');
INSERT INTO menu_item_category VALUES (NULL, 'category 2', '');
INSERT INTO menu_item_category VALUES (NULL, 'category 3', '');
INSERT INTO menu_item_category VALUES (NULL, 'category 4', '');

-- SUB CATEGORY 1
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 1a', '', 1);
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 2a', '', 1);
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 3a', '', 1);
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 4a', '', 1);

-- SUB CATEGORY 2
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 1b', '', 2);
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 2b', '', 2);
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 3b', '', 2);

-- SUB CATEGORY 3
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 1c', '', 3);
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 2c', '', 3);

-- SUB CATEGORY 4
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 1d', '', 4);
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 2d', '', 4);
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 3d', '', 4);
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 4d', '', 4);
INSERT INTO menu_item_subcategory VALUES (NULL, 'sub 5d', '', 4);

-- CATEGORY 1
	-- sub 1
	INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 1, 1);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 1, 1);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 1, 1);

	-- sub 2
	INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 1, 2);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 1, 2);

	-- sub 3
	INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 1, 3);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 1, 3);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 1, 3);
	INSERT INTO menu_item VALUES (NULL, 'item 4', '10', TRUE, 1, 3);

	-- sub 4
	INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 1, 4);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 1, 4);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 1, 4);

-- CATEGORY 2
	-- sub 1
	INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 2, 1);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 2, 1);

    -- sub 2
    INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 2, 2);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 2, 2);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 2, 2);
	INSERT INTO menu_item VALUES (NULL, 'item 4', '10', TRUE, 2, 2);

    -- sub 3
    INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 2, 3);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 2, 3);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 2, 3);
	INSERT INTO menu_item VALUES (NULL, 'item 4', '10', TRUE, 2, 3);

-- CATEGORY 3
    -- sub 1
    INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 3, 1);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 3, 1);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 3, 1);
	INSERT INTO menu_item VALUES (NULL, 'item 4', '10', TRUE, 3, 1);

    -- sub 2
    INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 3, 2);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 3, 2);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 3, 2);
	INSERT INTO menu_item VALUES (NULL, 'item 4', '10', TRUE, 3, 2);
    
-- CATEGORY 4
    -- sub 1
    INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 4, 1);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 4, 1);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 4, 1);
	INSERT INTO menu_item VALUES (NULL, 'item 4', '10', TRUE, 4, 1);

    -- sub 2
    INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 4, 2);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 4, 2);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 4, 2);
	INSERT INTO menu_item VALUES (NULL, 'item 4', '10', TRUE, 4, 2);

    -- sub 3
    INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 4, 3);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 4, 3);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 4, 3);
	INSERT INTO menu_item VALUES (NULL, 'item 4', '10', TRUE, 4, 3);

    -- sub 4
    INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 4, 4);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 4, 4);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 4, 4);
	INSERT INTO menu_item VALUES (NULL, 'item 4', '10', TRUE, 4, 4);
    INSERT INTO menu_item VALUES (NULL, 'item 5', '10', TRUE, 4, 4);
    INSERT INTO menu_item VALUES (NULL, 'item 6', '10', TRUE, 4, 4);

    -- sub 5
    INSERT INTO menu_item VALUES (NULL, 'item 1', '10', TRUE, 4, 5);
	INSERT INTO menu_item VALUES (NULL, 'item 2', '10', TRUE, 4, 5);
	INSERT INTO menu_item VALUES (NULL, 'item 3', '10', TRUE, 4, 5);



