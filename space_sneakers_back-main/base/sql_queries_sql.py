import psycopg2
import json
from psycopg2.extras import RealDictCursor
from django.conf import settings
from psycopg2.extras import execute_values
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
                SELECT DISTINCT
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
    ]
    """
    conn = psycopg2.connect(**DB_PARAMS)
    with conn.cursor() as cursor:
        cursor.execute('''
            SELECT min_sum AS min_amount, discount_num AS discount_percent
            FROM public."discount"
            ORDER BY min_sum;
        ''')
        rows = cursor.fetchall()
        # Преобразуем в список словарей
        result = [
            {"min_amount": float(row[0]), "discount_percent": float(row[1])}
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


def insert_cart_consumables(cart_items):
    """
    Вставляет записи в carts_consumables.
    :param cart_items: list of dicts, e.g. [{'cart_id': 1, 'con_id': 101, 'quantity': 2}, ...]
    """
    print(cart_items)
    if not cart_items:
        return

    conn = psycopg2.connect(**DB_PARAMS)
    try:
        with conn.cursor() as cur:
            # Подготавливаем данные: (cart_id, con_id, quantity)

            data = [(item['cart_id'], item['con_id'], item['quantity']) for item in cart_items]
            execute_values(
                cur,
                """
                INSERT INTO public.carts_consumables (cart_id, con_id, quantity)
                VALUES %s
                ON CONFLICT (cart_id, con_id)
                DO UPDATE SET quantity = EXCLUDED.quantity;
                """,
                data
            )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def clear_cart(cart_id):
    """
    Удаляет все записи из carts_consumables для указанной корзины.
    :param cart_id: ID корзины (cart.id)
    """
    conn = psycopg2.connect(**DB_PARAMS)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM public.carts_consumables
                WHERE cart_id = %s;
                """,
                (cart_id,)
            )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def get_consumables_by_cart_id(cart_id):
    """
    Возвращает список расходников в корзине по cart_id.
    :param cart_id: ID корзины (значение из carts.id)
    :return: Список словарей вида:
        {
            'con_id': int,
            'name': str,
            'price': Decimal,
            'category': str,
            'imageurl': str or None,
            'quantity': int
        }
    """
    conn = psycopg2.connect(**DB_PARAMS)
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    c.con_id,
                    c.name,
                    c.price,
                    c.category,
                    c.imageurl,
                    cc.quantity
                FROM public.carts_consumables AS cc
                INNER JOIN public.consumables AS c ON cc.con_id = c.con_id
                WHERE cc.cart_id = %s;
            """, (cart_id,))
            rows = cur.fetchall()
            return [
                {
                    'con_id': row[0],
                    'name': row[1],
                    'price': row[2],
                    'category': row[3],
                    'imageurl': row[4],
                    'quantity': row[5]
                }
                for row in rows
            ]
    finally:
        conn.close()