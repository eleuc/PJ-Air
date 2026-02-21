-- ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('Admin', 'Cliente', 'Repostero', 'Transporte', 'Delivery');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('Pedido', 'En Producción', 'Finalizado', 'En Entrega', 'Entregado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shift_type AS ENUM ('mañana', 'tarde', 'noche', 'madrugada', 'todo el día');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- TABLES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'Cliente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    description TEXT,
    description_long TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zones (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL, -- Name for the address (e.g., Home, Work)
    address_line TEXT NOT NULL,
    notes TEXT,
    google_maps_url TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    zone_id INTEGER REFERENCES zones(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    address_id INTEGER REFERENCES addresses(id),
    status order_status DEFAULT 'Pedido',
    total_price DECIMAL(10,2) NOT NULL,
    delivery_date DATE,
    payment_date DATE, -- Calculated 6 days after delivery
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS transports (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    plates TEXT
);

CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    transport_id INTEGER REFERENCES transports(id),
    zone_id INTEGER REFERENCES zones(id),
    day_of_week TEXT, -- Monday, Tuesday, etc.
    shift shift_type,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type TEXT,
    message TEXT,
    is_realtime BOOLEAN DEFAULT TRUE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
