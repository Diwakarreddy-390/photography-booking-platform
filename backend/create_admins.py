
import bcrypt
from database import get_db_connection
from getpass import getpass

def create_admin():
    db = get_db_connection()
    cursor = db.cursor()

    for i in range(1):
        print(f"\nCreate Admin {i + 1}")

        name = input("Enter name: ")
        email = input("Enter email: ").strip().lower()
        password = getpass("Enter password: ")

        if not name.strip() or not email or len(password) < 12:
            print("Invalid details. Password must be at least 12 characters.")
            continue

        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        try:
            cursor.execute("""
                INSERT INTO admins (name, email, password_hash, role)
                VALUES (%s, %s, %s, 'admin')
            """, (name, email, password_hash))

            db.commit()
            print("Admin account created successfully!")

        except Exception as e:
            db.rollback()
            print("Error:", e)

    cursor.close()
    db.close()

if __name__ == "__main__":
    create_admin()
