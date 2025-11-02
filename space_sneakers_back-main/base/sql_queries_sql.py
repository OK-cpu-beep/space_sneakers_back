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
    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT DISTINCT ci.sneaker_id
                FROM public.carts c
                JOIN public.cart_items ci ON c.id = ci.cart_id
                WHERE c.user_id = %s
            """, (user_id,))

            sneaker_ids = [row['sneaker_id'] for row in cur.fetchall()]
            print(sneaker_ids)
            if not sneaker_ids:
                return []

            cur.execute("""
                SELECT 
                    rec.recommended_product_id AS con_id,
                    cons.name AS name,
                    cons.price AS price,
                    cons.category AS category,
                    cons.imageurl AS imageurl
                FROM public.recommendations rec
                JOIN public.consumables cons ON rec.recommended_product_id = cons.con_id
                WHERE rec.source_product_id = ANY(%(sneaker_ids)s::BIGINT[])
                  AND rec.is_active = true
            """, {"sneaker_ids": sneaker_ids})

            recommendations = []
            for row in cur.fetchall():
                recommendations.append({
                    "con_id": row["con_id"],
                    "name": row["name"],
                    "price": float(row["price"]),
                    "category": row["category"],
                    "imageurl": row["imageurl"],
                })
            return recommendations
    finally:
        connection.close()

def get_all_discount():
    """
    Получает все скидки из таблицы public."Discount"
    и возвращает список словарей в формате:
    [
      {"min_amount": 10000, "discount_percent": 5},
      ...
    ]
    """
    conn = psycopg2.connect(**DB_PARAMS)
    with conn.cursor() as cursor:
        cursor.execute('''
            SELECT min_sum AS min_amount, discount_num AS discount_percent
            FROM public."Discount"
            ORDER BY min_sum;
        ''')
        rows = cursor.fetchall()
        # Преобразуем в список словарей
        result = [
            {"min_amount": row[0], "discount_percent": row[1]}
            for row in rows
        ]
    conn.close()
    return result

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
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()

        # Выполнение SQL-запроса
        cur.execute("SELECT con_id, name, price, category, imageurl FROM public.consumables;")

        rows = cur.fetchall()

        consumables = []
        for row in rows:
            consumables.append({
                'id': row[0],
                'title': row[1],
                'price': float(row[2]),  # NUMERIC → float
                'category': row[3],
                'imageUrl': row[4]
            })

        # print(json.dumps(consumables, ensure_ascii=False, indent=2))
        return consumables

    except (Exception, psycopg2.DatabaseError) as error:
        print("Ошибка при работе с PostgreSQL:", error)
        return []

    finally:
        if conn is not None:
            conn.close()