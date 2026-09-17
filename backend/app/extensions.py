from pymongo import MongoClient
from flask_jwt_extended import JWTManager

mongo_client = None
mongo_db = None

jwt = JWTManager()


def init_mongo(app):
    global mongo_client
    global mongo_db

    mongo_client = MongoClient(
        app.config["MONGO_URI"]
    )

    mongo_db = mongo_client[
        app.config["MONGO_DATABASE"]
    ]

    mongo_client.admin.command("ping")

    print("MongoDB connected successfully.")

    return mongo_db