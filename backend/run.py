import time
import pymysql
import os
from app import create_app, db

def wait_for_db():
    host     = os.getenv("DB_HOST", "db")
    port     = int(os.getenv("DB_PORT", 3306))
    user     = os.getenv("DB_USER", "gardenuser")
    password = os.getenv("DB_PASSWORD", "gardenpass")
    dbname   = os.getenv("DB_NAME", "gardendb")

    print("⏳ Waiting for MySQL …")
    for _ in range(30):
        try:
            conn = pymysql.connect(host=host, port=port, user=user, password=password, database=dbname)
            conn.close()
            print("✅ MySQL ready!")
            return
        except Exception:
            time.sleep(2)
    raise RuntimeError("Could not connect to MySQL after 30 attempts")

app = create_app()

if __name__ == "__main__":
    wait_for_db()
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=False)
