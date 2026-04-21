Ось максимально короткий **README.md**:

# 👕 Clothing DB

Консольна утиліта для керування базою даних одягу (Node.js + PostgreSQL).

## ⚙️ Налаштування
1. `npm install`
2. Створи файл `.env`:
   ```env
   DB_URL=your_postgresql_link
   ```

## 🕹 Команди
* **Список:** `node db.js list`
* **Додати:** `node db.js add <назва> <бренд> <категорія> <розмір> <колір> <ціна> <матеріал> <кількість>`
* **Оновити ціну:** `node db.js update-price <id> <ціна>`
* **Видалити:** `node db.js delete <id>`

## 📊 Структура
Таблиця `clothing`: `id`, `name`, `brand`, `category`, `size`, `color`, `price`, `material`, `stock_quantity`.
