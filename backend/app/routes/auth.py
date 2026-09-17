from flask import Blueprint, request
from flask_jwt_extended import create_access_token

from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)

from app import extensions


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth",
)


@auth_bp.post("/register")
def register():
    data = request.get_json()

    if not data:
        return {
            "error": "Request body is required."
        }, 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username:
        return {
            "error": "Username is required."
        }, 400

    if len(username) < 3:
        return {
            "error": "Username must be at least 3 characters."
        }, 400

    if len(username) > 50:
        return {
            "error": "Username must be 50 characters or fewer."
        }, 400

    if len(password) < 8:
        return {
            "error": "Password must be at least 8 characters."
        }, 400

    existing_user = extensions.mongo_db["users"].find_one({
        "username": username
    })

    if existing_user:
        return {
            "error": "Username already exists."
        }, 409

    password_hash = generate_password_hash(password)

    result = extensions.mongo_db["users"].insert_one({
        "username": username,
        "password_hash": password_hash,
    })

    return {
        "message": "Account created successfully.",
        "user": {
            "id": str(result.inserted_id),
            "username": username,
        },
    }, 201


@auth_bp.post("/login")
def login():
    data = request.get_json()

    if not data:
        return {
            "error": "Request body is required."
        }, 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = extensions.mongo_db["users"].find_one({
        "username": username
    })

    if not user:
        return {
            "error": "Invalid username or password."
        }, 401

    if not check_password_hash(
        user["password_hash"],
        password
    ):
        return {
            "error": "Invalid username or password."
        }, 401

    access_token = create_access_token(
        identity=str(user["_id"])
    )

    return {
        "access_token": access_token,
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
        },
    }, 200