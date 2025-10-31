import psycopg2
import json
from psycopg2.extras import RealDictCursor
from django.conf import settings  # для доступа к базе данных через Django настройки

# Параметры подключения к PostgreSQL через настройки Django
DB_PARAMS = {
    'dbname': settings.DATABASES['default']['NAME'],
    'user': settings.DATABASES['default']['USER'],
    'password': settings.DATABASES['default']['PASSWORD'],
    'host': settings.DATABASES['default']['HOST'],
    'port': settings.DATABASES['default']['PORT'],
}

def get_recommendations(user_id):
    connection = psycopg2.connect(**DB_PARAMS)
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""
        SELECT sneaker_id FROM cart_items
        WHERE cart_id IN (SELECT id FROM carts WHERE user_id = %s)
    """, (user_id,))
    cart_items = cursor.fetchall()

    category_ids = [item['sneaker_id'] for item in cart_items]

    cursor.execute("""
        SELECT id, name FROM sneakers
        WHERE category IN (SELECT category FROM sneakers WHERE id IN (%s))
        AND id NOT IN (%s)
    """, (",".join([str(i) for i in category_ids]), ",".join([str(i) for i in category_ids])))

    recommendations = cursor.fetchall()

    connection.close()
    return json.dumps([{"id": rec['id'], "name": rec['name']} for rec in recommendations])

def get_all_discount():
    connection = psycopg2.connect(**DB_PARAMS)
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    cursor.execute("SELECT code, amount, active FROM discounts")
    discounts = cursor.fetchall()

    connection.close()
    return json.dumps([{"code": disc['code'], "amount": disc['amount'], "active": disc['active']} for disc in discounts])

def update_products(user_id, new_products):
    connection = psycopg2.connect(**DB_PARAMS)
    cursor = connection.cursor()

    cursor.execute("""
        SELECT sneaker_id FROM clientorders WHERE user_id = %s
    """, (user_id,))
    current_products = cursor.fetchall()

    current_product_ids = {item['sneaker_id'] for item in current_products}
    new_product_ids = {product['sneaker_id'] for product in new_products}

    cursor.execute("""
        DELETE FROM clientorders WHERE user_id = %s AND sneaker_id NOT IN (%s)
    """, (user_id, ",".join([str(i) for i in new_product_ids])))

    for product in new_products:
        sneaker_id = product['sneaker_id']
        quantity = product['quantity']

        cursor.execute("""
            SELECT id FROM clientorders WHERE user_id = %s AND sneaker_id = %s
        """, (user_id, sneaker_id))
        existing_order = cursor.fetchone()

        if existing_order:
            cursor.execute("""
                UPDATE clientorders
                SET quantity = %s
                WHERE user_id = %s AND sneaker_id = %s
            """, (quantity, user_id, sneaker_id))
        else:
            cursor.execute("""
                INSERT INTO clientorders (user_id, sneaker_id, quantity)
                VALUES (%s, %s, %s)
            """, (user_id, sneaker_id, quantity))

    connection.commit()
    connection.close()

def get_products(user_id):
    connection = psycopg2.connect(**DB_PARAMS)
    cursor = connection.cursor(cursor_factory=RealDictCursor)

    cursor.execute("""
        SELECT sneakers.id, sneakers.name, clientorders.quantity
        FROM clientorders
        JOIN sneakers ON clientorders.sneaker_id = sneakers.id
        WHERE clientorders.user_id = %s
    """, (user_id,))

    products = cursor.fetchall()

    connection.close()
    return json.dumps([{"sneaker_id": prod['id'], "name": prod['name'], "quantity": prod['quantity']} for prod in products])

def fetch_consumables():
    conn = None
    try:
        # Подключение к базе данных
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()

        # Выполнение SQL-запроса
        cur.execute("SELECT con_id, name, price, category, imageurl FROM public.consumables;")

        # Получение всех строк
        rows = cur.fetchall()

        # Преобразование в список словарей (как JSON)
        consumables = []
        for row in rows:
            consumables.append({
                'id': row[0],
                'title': row[1],
                'price': float(row[2]),  # NUMERIC → float
                'category': row[3],
                'imageUrl': row[4]
            })

        # Вывод в формате JSON
        print(json.dumps(consumables, ensure_ascii=False, indent=2))
        return consumables

    except (Exception, psycopg2.DatabaseError) as error:
        print("Ошибка при работе с PostgreSQL:", error)
        return []

    finally:
        if conn is not None:
            conn.close()