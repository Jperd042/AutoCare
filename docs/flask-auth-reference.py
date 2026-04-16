"""
Flask Backend Reference — AUTOCARE Auth Endpoints
==================================================
This file provides the Flask endpoint structure needed for the
AUTOCARE authentication system. It is NOT a running server — it's
a blueprint for backend implementation.

Dependencies:
  pip install flask flask-cors flask-mail pyjwt python-dotenv

Environment variables (.env):
  SECRET_KEY=your-secret-key
  MAIL_SERVER=smtp.gmail.com
  MAIL_PORT=587
  MAIL_USE_TLS=true
  MAIL_USERNAME=your-email@gmail.com
  MAIL_PASSWORD=your-app-password        # Gmail App Password (not regular password)
  MAIL_DEFAULT_SENDER=your-email@gmail.com
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
import jwt
import random
import datetime
import os

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# ─── Config ───────────────────────────────────────────
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

# In-memory OTP store (replace with Redis in production)
otp_store = {}  # { email: { code: '123456', expires: datetime } }


# ─── Helpers ──────────────────────────────────────────
def generate_otp():
    return str(random.randint(100000, 999999))


def send_otp_email(email, code):
    """Send OTP code via Gmail SMTP."""
    msg = Message(
        subject='AUTOCARE - Your Verification Code',
        recipients=[email],
        html=f"""
        <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 24px;">
            <h2 style="color: #f07c00;">Cruisers Crib Auto Care</h2>
            <p>Your verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px;
                        background: #111; color: #fff; padding: 16px; border-radius: 12px;
                        text-align: center; margin: 16px 0;">
                {code}
            </div>
            <p style="color: #888; font-size: 13px;">
                This code expires in 5 minutes. Do not share it with anyone.
            </p>
        </div>
        """
    )
    mail.send(msg)


def create_token(user_data):
    """Create a JWT token."""
    payload = {
        **user_data,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        'iat': datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


def require_auth(f):
    """Decorator to require a valid JWT token."""
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Token required'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated


# ─── POST /api/auth/register ─────────────────────────
@app.route('/api/auth/register', methods=['POST'])
def register():
    """
    Body: { name, email, password }
    Response: { message, email }
    Sends OTP to email for verification.
    """
    data = request.json
    # TODO: Validate fields, check if email already exists in DB
    # TODO: Hash password with bcrypt before storing

    code = generate_otp()
    otp_store[data['email']] = {
        'code': code,
        'expires': datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
        'context': 'registration',
        'user_data': data,
    }
    send_otp_email(data['email'], code)

    return jsonify({'message': 'OTP sent', 'email': data['email']}), 200


# ─── POST /api/auth/login ────────────────────────────
@app.route('/api/auth/login', methods=['POST'])
def login():
    """
    Body: { email, password }
    Response: { message, email } on success (then requires OTP)
    """
    data = request.json
    # TODO: Look up user in DB, verify bcrypt password hash

    code = generate_otp()
    otp_store[data['email']] = {
        'code': code,
        'expires': datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
        'context': 'login',
    }
    send_otp_email(data['email'], code)

    return jsonify({'message': 'OTP sent for 2FA', 'email': data['email']}), 200


# ─── POST /api/auth/verify-otp ───────────────────────
@app.route('/api/auth/verify-otp', methods=['POST'])
def verify_otp():
    """
    Body: { email, code }
    Response: { token, user } on success
    """
    data = request.json
    stored = otp_store.get(data['email'])

    if not stored:
        return jsonify({'error': 'No OTP found. Request a new one.'}), 400

    if datetime.datetime.utcnow() > stored['expires']:
        del otp_store[data['email']]
        return jsonify({'error': 'OTP expired. Request a new one.'}), 400

    if stored['code'] != data['code']:
        return jsonify({'error': 'Invalid OTP.'}), 400

    del otp_store[data['email']]

    # TODO: Look up user from DB
    user_data = {'email': data['email'], 'name': 'User', 'role': 'Customer'}
    token = create_token(user_data)

    return jsonify({'token': token, 'user': user_data}), 200


# ─── POST /api/auth/resend-otp ───────────────────────
@app.route('/api/auth/resend-otp', methods=['POST'])
def resend_otp():
    """
    Body: { email }
    Response: { message }
    """
    data = request.json
    code = generate_otp()
    otp_store[data['email']] = {
        'code': code,
        'expires': datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
        'context': 'resend',
    }
    send_otp_email(data['email'], code)

    return jsonify({'message': 'OTP resent'}), 200


# ─── PUT /api/auth/change-password ────────────────────
@app.route('/api/auth/change-password', methods=['PUT'])
@require_auth
def change_password():
    """
    Body: { current_password, new_password, otp_code }
    Response: { message }
    Requires: Bearer token + valid OTP
    """
    data = request.json
    email = request.user['email']

    # TODO: Verify current_password against DB
    # TODO: Verify otp_code against otp_store
    # TODO: Hash new_password and update in DB

    return jsonify({'message': 'Password updated'}), 200


# ─── PUT /api/auth/profile ────────────────────────────
@app.route('/api/auth/profile', methods=['PUT'])
@require_auth
def update_profile():
    """
    Body: { name, phone }
    Response: { user }
    Requires: Bearer token
    """
    data = request.json
    email = request.user['email']

    # TODO: Update user in DB
    updated_user = {**request.user, **data}

    return jsonify({'user': updated_user}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)
