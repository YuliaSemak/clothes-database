import dotenv from 'dotenv'
import pg from 'pg'
dotenv.config()

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const initializeDatabase = async () => {
    console.log('Ініціалізація бази даних одягу...')

    // Змінено структуру під одяг
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS clothing (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT,
        category TEXT NOT NULL, -- Наприклад: Футболка, Штани, Куртка
        size TEXT NOT NULL,     -- Наприклад: S, M, L, XL
        color TEXT,
        price NUMERIC(10,2),
        material TEXT,
        stock_quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    try {
        await pool.query(createTableQuery);
        console.log('Таблиця clothing готова.');
    } catch(error) {
        console.error("Помилка ініціалізації:", error.message);
        throw error;
    }
};

// INSERT
async function addItem(name, brand, category, size, color, price, material, quantity) {
    const query = `
        INSERT INTO clothing
        (name, brand, category, size, color, price, material, stock_quantity)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`;

    const values = [name, brand, category, size, color, price, material, quantity];

    try {
        const res = await pool.query(query, values);
        console.log("Товар додано:", res.rows[0]);
    } catch(err) {
        console.error("Помилка додавання:", err.message);
    }
}

// SELECT
async function getAllItems() {
    const res = await pool.query("SELECT * FROM clothing ORDER BY id");
    console.table(res.rows);
}

// Перевірка існування
async function itemExists(id) {
    const res = await pool.query("SELECT id FROM clothing WHERE id = $1", [id]);
    return res.rows.length > 0;
}

// UPDATE (Зміна ціни)
async function updatePrice(id, newPrice) {
    if (isNaN(id) || id <= 0) {
        console.error("Помилка: Некоректний ID");
        return;
    }

    if (!(await itemExists(id))) {
        console.error(`Помилка: Товар з ID ${id} не знайдено`);
        return;
    }

    const res = await pool.query(
        "UPDATE clothing SET price = $1 WHERE id = $2 RETURNING *",
        [newPrice, id]
    );

    console.log("Ціну оновлено:", res.rows[0]);
}

// DELETE
async function deleteItem(id) {
    if (!(await itemExists(id))) {
        console.error(`Помилка: Товар з ID ${id} не знайдено`);
        return;
    }

    await pool.query("DELETE FROM clothing WHERE id = $1", [id]);
    console.log(`Товар з ID ${id} видалено.`);
}

(async () => {
    try {
        await initializeDatabase();

        const action = process.argv[2];

        switch(action) {
            case "list":
                await getAllItems();
                break;

            case "add":
                // Очікує 8 параметрів
                if (process.argv.length < 11) {
                    console.log("Usage: node clothing_db.js add <name> <brand> <category> <size> <color> <price> <material> <quantity>");
                    break;
                }
                await addItem(
                    process.argv[3], // name
                    process.argv[4], // brand
                    process.argv[5], // category
                    process.argv[6], // size
                    process.argv[7], // color
                    parseFloat(process.argv[8]), // price
                    process.argv[9], // material
                    parseInt(process.argv[10])   // quantity
                );
                break;

            case "update-price":
                const idPrice = parseInt(process.argv[3]);
                const newPrice = parseFloat(process.argv[4]);
                await updatePrice(idPrice, newPrice);
                break;

            case "delete":
                const idDel = parseInt(process.argv[3]);
                await deleteItem(idDel);
                break;

            default:
                console.log("Доступні команди: list, add, update-price, delete");
        }
    } catch(err) {
        console.error("Критична помилка:", err.message);
    } finally {
        process.exit();
    }
})();
