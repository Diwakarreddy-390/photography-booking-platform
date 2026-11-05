
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db_connection
import urllib.request
import json

import os
import secrets
import hashlib
import hmac
import jwt
import bcrypt

from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
CORS(app, origins=[FRONTEND_URL])

JWT_SECRET = os.getenv("JWT_SECRET")


# =====================================
# HOME
# =====================================

@app.route("/")
def home():
    return jsonify({
        "message": "PRL SHOOTS Backend is Running!"
    })


# =====================================
# CUSTOMER: SEND OTP
# =====================================

@app.route("/send-otp", methods=["POST"])
def send_otp():

    data = request.get_json(silent=True) or {}
    phone = data.get("phone", "")

    if (not isinstance(phone, str) or not phone.isdigit()
            or len(phone) != 10 or phone[0] not in "6789"):
        return jsonify({"error": "Invalid mobile number"}), 400

    otp = str(secrets.randbelow(900000) + 100000)
    otp_hash = hashlib.sha256(otp.encode()).hexdigest()

    expires_at = (
        datetime.now(timezone.utc).replace(tzinfo=None)
        + timedelta(minutes=5)
    )

    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO otp_verifications
            (phone, otp_hash, expires_at, attempts)
            VALUES (%s, %s, %s, 0)
            ON DUPLICATE KEY UPDATE
            otp_hash = VALUES(otp_hash),
            expires_at = VALUES(expires_at),
            attempts = 0
        """, (phone, otp_hash, expires_at))

        db.commit()

        cursor.close()
        db.close()

        # LOCAL DEVELOPMENT ONLY
        print(f"PRL SHOOTS OTP for {phone}: {otp}")

        return jsonify({
            "message": "OTP generated. Check backend terminal for testing."
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =====================================
# CUSTOMER: REGISTER WITH 4-DIGIT PIN
# =====================================

@app.route("/pin-register", methods=["POST"])
def pin_register():
    data = request.get_json(silent=True) or {}

    name = data.get("name", "")
    phone = data.get("phone", "")
    pin = data.get("pin", "")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Name is required"}), 400

    name = name.strip()

    if len(name) > 100:
        return jsonify({"error": "Name is too long"}), 400

    if (not isinstance(phone, str) or not phone.isdigit()
            or len(phone) != 10 or phone[0] not in "6789"):
        return jsonify({"error": "Invalid mobile number"}), 400

    if not isinstance(pin, str) or not pin.isdigit() or len(pin) != 4:
        return jsonify({"error": "PIN must contain exactly 4 digits"}), 400

    if not JWT_SECRET:
        return jsonify({"error": "JWT_SECRET is not configured"}), 500

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT id FROM customers WHERE phone = %s",
            (phone,)
        )

        if cursor.fetchone():
            return jsonify({
                "error": "An account with this mobile number already exists. Please login."
            }), 409

        pin_hash = bcrypt.hashpw(
            pin.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute("""
            INSERT INTO customers (name, phone, pin_hash)
            VALUES (%s, %s, %s)
        """, (name, phone, pin_hash))

        customer_id = cursor.lastrowid
        db.commit()

        token = jwt.encode(
            {
                "customer_id": customer_id,
                "exp": datetime.now(timezone.utc) + timedelta(hours=12)
            },
            JWT_SECRET,
            algorithm="HS256"
        )

        return jsonify({
            "message": "Account created successfully",
            "token": token,
            "customer": {
                "id": customer_id,
                "name": name,
                "phone": phone
            }
        }), 201

    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# =====================================
# CUSTOMER: LOGIN WITH 4-DIGIT PIN
# =====================================

@app.route("/pin-login", methods=["POST"])
def pin_login():
    data = request.get_json(silent=True) or {}

    phone = data.get("phone", "")
    pin = data.get("pin", "")

    if (not isinstance(phone, str) or not phone.isdigit()
            or len(phone) != 10 or phone[0] not in "6789"):
        return jsonify({"error": "Invalid mobile number"}), 400

    if not isinstance(pin, str) or not pin.isdigit() or len(pin) != 4:
        return jsonify({"error": "PIN must contain exactly 4 digits"}), 400

    if not JWT_SECRET:
        return jsonify({"error": "JWT_SECRET is not configured"}), 500

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, name, phone, pin_hash
            FROM customers
            WHERE phone = %s
        """, (phone,))

        customer = cursor.fetchone()

        if not customer or not customer["pin_hash"]:
            return jsonify({
                "error": "Account not found. Please create an account."
            }), 401

        if not bcrypt.checkpw(
            pin.encode("utf-8"),
            customer["pin_hash"].encode("utf-8")
        ):
            return jsonify({"error": "Incorrect PIN"}), 401

        token = jwt.encode(
            {
                "customer_id": customer["id"],
                "exp": datetime.now(timezone.utc) + timedelta(hours=12)
            },
            JWT_SECRET,
            algorithm="HS256"
        )

        return jsonify({
            "message": "Login successful",
            "token": token,
            "customer": {
                "id": customer["id"],
                "name": customer["name"],
                "phone": customer["phone"]
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

# =====================================
# CUSTOMER: VERIFY OTP
# =====================================

@app.route("/verify-otp", methods=["POST"])
def verify_otp():

    data = request.get_json(silent=True) or {}

    phone = data.get("phone", "")
    otp = data.get("otp", "")

    if (not isinstance(phone, str) or not phone.isdigit()
            or len(phone) != 10 or phone[0] not in "6789"
            or not isinstance(otp, str) or not otp.isdigit()
            or len(otp) != 6):
        return jsonify({"error": "Invalid phone number or OTP"}), 400

    if not JWT_SECRET:
        return jsonify({"error": "JWT_SECRET is not configured"}), 500

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM otp_verifications
            WHERE phone = %s
        """, (phone,))

        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({
                "error": "Please request an OTP first"
            }), 400

        if record["expires_at"] <= datetime.now(timezone.utc).replace(tzinfo=None):
            cursor.execute(
                "DELETE FROM otp_verifications WHERE phone = %s",
                (phone,)
            )
            db.commit()
            cursor.close()
            db.close()
            return jsonify({
                "error": "OTP expired. Request a new OTP"
            }), 400

        if record["attempts"] >= 5:
            cursor.execute(
                "DELETE FROM otp_verifications WHERE phone = %s",
                (phone,)
            )
            db.commit()
            cursor.close()
            db.close()
            return jsonify({
                "error": "Too many attempts. Request a new OTP"
            }), 429

        entered_hash = hashlib.sha256(otp.encode()).hexdigest()

        if not hmac.compare_digest(entered_hash, record["otp_hash"]):
            cursor.execute("""
                UPDATE otp_verifications
                SET attempts = attempts + 1
                WHERE phone = %s
            """, (phone,))

            db.commit()
            cursor.close()
            db.close()

            return jsonify({"error": "Incorrect OTP"}), 400

        cursor.execute("""
            INSERT INTO customers (phone)
            VALUES (%s)
            ON DUPLICATE KEY UPDATE phone = VALUES(phone)
        """, (phone,))

        db.commit()

        cursor.execute(
            "SELECT id, phone FROM customers WHERE phone = %s",
            (phone,)
        )

        customer = cursor.fetchone()

        cursor.execute(
            "DELETE FROM otp_verifications WHERE phone = %s",
            (phone,)
        )

        db.commit()

        token = jwt.encode(
            {
                "customer_id": customer["id"],
                "exp": datetime.now(timezone.utc) + timedelta(hours=12)
            },
            JWT_SECRET,
            algorithm="HS256"
        )

        cursor.close()
        db.close()

        return jsonify({
            "message": "Login successful",
            "token": token,
            "customer": customer
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =====================================
# ADMIN: LOGIN
# =====================================

@app.route("/admin-login", methods=["POST"])
def admin_login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "")
    password = data.get("password", "")

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"error": "Invalid login details"}), 400

    email = email.strip().lower()

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    if not JWT_SECRET:
        return jsonify({
            "error": "JWT_SECRET is not configured"
        }), 500

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, name, email, password_hash, role
            FROM admins
            WHERE email = %s
        """, (email,))

        admin = cursor.fetchone()

        if not admin:
            return jsonify({
                "error": "Invalid email or password"
            }), 401

        password_hash = admin["password_hash"].encode("utf-8")

        if not bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash
        ):
            return jsonify({
                "error": "Invalid email or password"
            }), 401

        if admin["role"] != "admin":
            return jsonify({
                "error": "Admin access denied"
            }), 403

        token = jwt.encode(
            {
                "admin_id": admin["id"],
                "role": "admin",
                "exp": datetime.now(timezone.utc) + timedelta(hours=8)
            },
            JWT_SECRET,
            algorithm="HS256"
        )

        return jsonify({
            "message": "Admin login successful",
            "token": token,
            "admin": {
                "id": admin["id"],
                "name": admin["name"],
                "email": admin["email"],
                "role": admin["role"]
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()


# =====================================
# RUN SERVER
# =====================================

# =====================================
# ADMIN: DASHBOARD STATISTICS
# =====================================

@app.route("/admin-dashboard", methods=["GET"])
def admin_dashboard():

    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Admin token required"}), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded.get("role") != "admin" or not decoded.get("admin_id"):
            return jsonify({"error": "Admin access denied"}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Login again."}), 401

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid admin token"}), 401

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                COUNT(*) AS total_bookings,
                COALESCE(SUM(
                    CASE WHEN LOWER(status) = 'pending'
                    THEN 1 ELSE 0 END
                ), 0) AS pending_bookings,
                COALESCE(SUM(
                    CASE WHEN LOWER(status) = 'confirmed'
                    THEN 1 ELSE 0 END
                ), 0) AS confirmed_bookings
            FROM bookings
        """)

        booking_stats = cursor.fetchone()

        cursor.execute("""
            SELECT COUNT(*) AS total_customers
            FROM customers
        """)

        customer_stats = cursor.fetchone()

        return jsonify({
            "total_bookings": booking_stats["total_bookings"],
            "pending_bookings": booking_stats["pending_bookings"],
            "confirmed_bookings": booking_stats["confirmed_bookings"],
            "total_customers": customer_stats["total_customers"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

# =====================================
# ADMIN: VIEW ALL BOOKINGS
# =====================================

@app.route("/admin-bookings", methods=["GET"])
def admin_bookings():

    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Admin token required"}), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded.get("role") != "admin" or not decoded.get("admin_id"):
            return jsonify({"error": "Admin access denied"}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Login again."}), 401

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid admin token"}), 401

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                b.id,
                b.customer_id,
                c.name AS customer_name,
                c.phone AS customer_phone,
                b.package_name,
                b.booking_date,
                b.time_slot,
                b.status,
                b.created_at
            FROM bookings b
            LEFT JOIN customers c
                ON b.customer_id = c.id
            ORDER BY b.id DESC
        """)

        bookings = cursor.fetchall()

        return jsonify({
            "bookings": bookings
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

# =====================================
# ADMIN: UPDATE BOOKING STATUS
# =====================================

@app.route("/admin-bookings/<int:booking_id>", methods=["PUT"])
def update_booking_status(booking_id):

    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Admin token required"}), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded.get("role") != "admin" or not decoded.get("admin_id"):
            return jsonify({"error": "Admin access denied"}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Login again."}), 401

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid admin token"}), 401

    data = request.get_json(silent=True) or {}
    status = data.get("status")

    if status not in ["Confirmed", "Rejected"]:
        return jsonify({"error": "Invalid booking status"}), 400

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("""
            UPDATE bookings
            SET status = %s
            WHERE id = %s AND LOWER(status) = 'pending'
        """, (status, booking_id))

        if cursor.rowcount == 0:
            db.rollback()
            return jsonify({
                "error": "Booking not found or already processed"
            }), 404

        db.commit()

        return jsonify({
            "message": f"Booking {status.lower()} successfully",
            "booking_id": booking_id,
            "status": status
        }), 200

    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
# =====================================
# ADMIN: VIEW ALL CUSTOMERS
# =====================================

@app.route("/admin-customers", methods=["GET"])
def admin_customers():

    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Admin token required"}), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded.get("role") != "admin" or not decoded.get("admin_id"):
            return jsonify({"error": "Admin access denied"}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Login again."}), 401

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid admin token"}), 401

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                c.id,
                c.name,
                c.phone,
                c.created_at,
                COUNT(b.id) AS total_bookings
            FROM customers c
            LEFT JOIN bookings b
                ON c.id = b.customer_id
            GROUP BY c.id, c.name, c.phone, c.created_at
            ORDER BY c.id DESC
        """)

        customers = cursor.fetchall()

        return jsonify({
            "customers": customers
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
@app.route("/admin-packages", methods=["GET"])
def admin_packages():
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Admin token required"}), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded.get("role") != "admin" or not decoded.get("admin_id"):
            return jsonify({"error": "Admin access denied"}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Login again."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid admin token"}), 401

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, name, description, price, duration, created_at
            FROM packages
            ORDER BY id DESC
        """)

        packages = cursor.fetchall()

        return jsonify({"packages": packages}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

@app.route("/packages", methods=["GET"])
def get_customer_packages():
    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, name, description, price, duration
            FROM packages
            ORDER BY id DESC
        """)

        packages = cursor.fetchall()

        return jsonify({"packages": packages}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()

@app.route("/admin-packages", methods=["POST"])
def add_admin_package():
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Admin token required"}), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded.get("role") != "admin" or not decoded.get("admin_id"):
            return jsonify({"error": "Admin access denied"}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Login again."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid admin token"}), 401

    data = request.get_json()

    name = data.get("name", "").strip()
    description = data.get("description", "").strip()
    price = data.get("price")
    duration = data.get("duration", "").strip()

    if not name or price is None:
        return jsonify({"error": "Package name and price are required"}), 400

    try:
        price = float(price)

        if price < 0:
            return jsonify({"error": "Price cannot be negative"}), 400

    except (ValueError, TypeError):
        return jsonify({"error": "Enter a valid price"}), 400

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO packages (name, description, price, duration)
            VALUES (%s, %s, %s, %s)
        """, (name, description, price, duration))

        db.commit()

        return jsonify({
            "message": "Package added successfully",
            "package_id": cursor.lastrowid
        }), 201

    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
@app.route("/admin-packages/<int:package_id>", methods=["PUT"])
def update_admin_package(package_id):
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Admin token required"}), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded.get("role") != "admin" or not decoded.get("admin_id"):
            return jsonify({"error": "Admin access denied"}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Login again."}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid admin token"}), 401

    data = request.get_json() or {}

    name = data.get("name", "").strip()
    description = data.get("description", "").strip()
    price = data.get("price")
    duration = data.get("duration", "").strip()

    if not name or price is None:
        return jsonify({"error": "Package name and price are required"}), 400

    try:
        price = float(price)

        if price < 0:
            return jsonify({"error": "Price cannot be negative"}), 400

    except (ValueError, TypeError):
        return jsonify({"error": "Enter a valid price"}), 400

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("""
            UPDATE packages
            SET name = %s,
                description = %s,
                price = %s,
                duration = %s
            WHERE id = %s
        """, (name, description, price, duration, package_id))

        if cursor.rowcount == 0:
            cursor.execute(
                "SELECT id FROM packages WHERE id = %s",
                (package_id,)
            )

            if not cursor.fetchone():
                return jsonify({"error": "Package not found"}), 404

        db.commit()

        return jsonify({
            "message": "Package updated successfully"
        }), 200

    except Exception as e:
        if db:
            db.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
        if db:
            db.close()
@app.route("/admin-packages/<int:package_id>", methods=["DELETE"])
def delete_admin_package(package_id):
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Admin token required"}), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded.get("role") != "admin" or not decoded.get("admin_id"):
            return jsonify({"error": "Admin access denied"}), 403

        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute(
            "DELETE FROM packages WHERE id = %s",
            (package_id,)
        )

        if cursor.rowcount == 0:
            cursor.close()
            db.close()
            return jsonify({"error": "Package not found"}), 404

        db.commit()

        cursor.close()
        db.close()

        return jsonify({
            "message": "Package deleted successfully"
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
# =====================================
# CUSTOMER: CREATE BOOKING
# =====================================


@app.route("/bookings", methods=["POST"])
def create_booking():
    # Check customer authentication
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({
            "error": "Please login to submit a booking"
        }), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        customer_id = decoded.get("customer_id")

        if not customer_id:
            return jsonify({
                "error": "Invalid customer token"
            }), 401

    except jwt.ExpiredSignatureError:
        return jsonify({
            "error": "Session expired. Please login again."
        }), 401

    except jwt.InvalidTokenError:
        return jsonify({
            "error": "Invalid customer token"
        }), 401

    # Get booking details
    data = request.get_json(silent=True) or {}

    name = data.get("name", "")
    email = data.get("email", "")
    category = data.get("category", "")
    package_id = data.get("packageType")
    booking_date = data.get("date", "")
    time_slot = data.get("time", "")
    location = data.get("location", "")
    requirements = data.get("requirements", "")

    # Ensure text values are strings
    if not all(
        isinstance(value, str)
        for value in [
            name,
            email,
            category,
            booking_date,
            time_slot,
            location,
            requirements
        ]
    ):
        return jsonify({
            "error": "Invalid booking details"
        }), 400

    # Remove unnecessary spaces
    name = name.strip()
    email = email.strip()
    category = category.strip()
    booking_date = booking_date.strip()
    time_slot = time_slot.strip()
    location = location.strip()
    requirements = requirements.strip()

    # Validate required fields
    if not all([
        name,
        email,
        category,
        package_id,
        booking_date,
        time_slot,
        location
    ]):
        return jsonify({
            "error": "Please complete all required fields"
        }), 400

    # Validate phone number
    phone = data.get("phone", "")

    if not isinstance(phone, str) or not phone.isdigit() or len(phone) != 10:
        return jsonify({
            "error": "Please enter a valid 10-digit phone number"
        }), 400

    db = None
    cursor = None

    try:
        package_id = int(package_id)

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        # Verify customer account
        cursor.execute(
            "SELECT id FROM customers WHERE id = %s",
            (customer_id,)
        )

        customer = cursor.fetchone()

        if not customer:
            return jsonify({
                "error": "Customer account not found"
            }), 404

        # Verify selected package
        cursor.execute(
            "SELECT id, name FROM packages WHERE id = %s",
            (package_id,)
        )

        package = cursor.fetchone()

        if not package:
            return jsonify({
                "error": "Selected package not found"
            }), 404

        # Update customer name
        cursor.execute("""
            UPDATE customers
            SET name = %s
            WHERE id = %s
        """, (name, customer_id))

        # Save booking
        cursor.execute("""
            INSERT INTO bookings
            (
                customer_id,
                package_name,
                booking_date,
                time_slot,
                status,
                email,
                category,
                location,
                requirements
            )
            VALUES (%s, %s, %s, %s, 'Pending', %s, %s, %s, %s)
        """, (
            customer_id,
            package["name"],
            booking_date,
            time_slot,
            email,
            category,
            location,
            requirements
        ))

        booking_id = cursor.lastrowid

        db.commit()

        return jsonify({
            "message": "Booking request submitted successfully",
            "booking_id": booking_id,
            "status": "Pending"
        }), 201

    except (ValueError, TypeError):
        return jsonify({
            "error": "Invalid package selection"
        }), 400

    except Exception as e:
        if db:
            db.rollback()

        print("Booking error:", e)

        return jsonify({
            "error": "Unable to submit booking. Please try again."
        }), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()
# =====================================
# CUSTOMER: GET MY BOOKINGS
# =====================================

@app.route("/my-bookings", methods=["GET"])
def get_my_bookings():

    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Please login first"}), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        customer_id = decoded.get("customer_id")

        if not customer_id:
            return jsonify({"error": "Invalid customer token"}), 401

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Please login again."}), 401

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid customer token"}), 401

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                id,
                package_name,
                booking_date,
                time_slot,
                status,
                email,
                category,
                location,
                requirements,
                created_at
            FROM bookings
            WHERE customer_id = %s
            ORDER BY id DESC
        """, (customer_id,))

        bookings = cursor.fetchall()

        return jsonify({
            "bookings": bookings
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()


@app.route("/msg91-verify", methods=["POST"])
def msg91_verify():

    data = request.get_json(silent=True) or {}
    access_token = data.get("access_token", "")

    if not isinstance(access_token, str) or not access_token:
        return jsonify({"error": "Missing access token"}), 400

    authkey = os.getenv("MSG91_AUTHKEY")

    if not authkey:
        return jsonify({"error": "MSG91 Authkey not configured"}), 500

    payload = json.dumps({
        "authkey": authkey,
        "access-token": access_token
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://control.msg91.com/api/v5/widget/verifyAccessToken",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            result = json.loads(response.read().decode("utf-8"))

        if result.get("type") != "success":
            return jsonify({
                "error": "MSG91 token verification failed"
            }), 401

        verified_phone = str(result.get("message", ""))

        if not verified_phone.startswith("91"):
            return jsonify({"error": "Invalid verified mobile number"}), 401

        phone = verified_phone[2:]

        if not phone.isdigit() or len(phone) != 10:
            return jsonify({"error": "Invalid verified mobile number"}), 401

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            INSERT INTO customers (phone)
            VALUES (%s)
            ON DUPLICATE KEY UPDATE phone = VALUES(phone)
        """, (phone,))

        db.commit()

        cursor.execute(
            "SELECT id, phone FROM customers WHERE phone = %s",
            (phone,)
        )

        customer = cursor.fetchone()

        token = jwt.encode(
            {
                "customer_id": customer["id"],
                "exp": datetime.now(timezone.utc) + timedelta(hours=12)
            },
            JWT_SECRET,
            algorithm="HS256"
        )

        cursor.close()
        db.close()

        return jsonify({
            "message": "Login successful",
            "token": token,
            "customer": customer
        })

    except urllib.error.HTTPError as e:
        return jsonify({"error": "MSG91 verification request failed"}), 502

    except Exception:
        return jsonify({"error": "Unable to verify OTP at this time"}), 500

# PUBLIC: GET REELS
@app.route("/reels", methods=["GET"])
def get_public_reels():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, title, category, video_url
            FROM reels
            ORDER BY id DESC
        """)

        reels = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify({"reels": reels}), 200

    except Exception as e:
        print("Public reels error:", e)
        return jsonify({"error": "Unable to fetch reels"}), 500
# =====================================
# ADMIN: MANAGE REELS
# =====================================

@app.route("/admin-reels", methods=["GET", "POST"])
def admin_reels():
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Admin token required"}), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded.get("role") != "admin" or not decoded.get("admin_id"):
            return jsonify({"error": "Admin access denied"}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Login again."}), 401

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid admin token"}), 401

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        if request.method == "GET":
            cursor.execute("""
                SELECT id, title, category, video_url, created_at
                FROM reels
                ORDER BY id DESC
            """)

            return jsonify({"reels": cursor.fetchall()}), 200

        data = request.get_json(silent=True) or {}

        title = data.get("title", "")
        category = data.get("category", "")
        video_url = data.get("video_url", "")

        if not all(isinstance(value, str) for value in [title, category, video_url]):
            return jsonify({"error": "Invalid reel details"}), 400

        title = title.strip()
        category = category.strip()
        video_url = video_url.strip()

        if not title or not category or not video_url:
            return jsonify({
                "error": "Title, category, and video link are required"
            }), 400

        cursor.execute("""
            INSERT INTO reels (title, category, video_url)
            VALUES (%s, %s, %s)
        """, (title, category, video_url))

        db.commit()

        return jsonify({
            "message": "Reel added successfully",
            "reel_id": cursor.lastrowid
        }), 201

    except Exception as e:
        if db:
            db.rollback()

        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()


@app.route("/admin-reels/<int:reel_id>", methods=["DELETE"])
def delete_admin_reel(reel_id):
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Admin token required"}), 401

    token = auth_header.split(" ", 1)[1]

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"]
        )

        if decoded.get("role") != "admin" or not decoded.get("admin_id"):
            return jsonify({"error": "Admin access denied"}), 403

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Session expired. Login again."}), 401

    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid admin token"}), 401

    db = None
    cursor = None

    try:
        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute(
            "DELETE FROM reels WHERE id = %s",
            (reel_id,)
        )

        if cursor.rowcount == 0:
            return jsonify({"error": "Reel not found"}), 404

        db.commit()

        return jsonify({
            "message": "Reel deleted successfully"
        }), 200

    except Exception as e:
        if db:
            db.rollback()

        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
