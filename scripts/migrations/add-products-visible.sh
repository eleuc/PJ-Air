
if [ -z "$1" ]; then
    echo "Please provide a database argument"
    exit 1
fi

sqlite3 "$1" "ALTER TABLE products ADD COLUMN visible BOOLEAN DEFAULT TRUE;" 