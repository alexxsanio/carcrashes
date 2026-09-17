from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import init_mongo, jwt
from app.routes.auth import auth_bp
from app.routes.observations import observations_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(
        app,
        origins=["http://localhost:3000"],
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                ],
                "methods": [
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS",
                ],
                "allow_headers": [
                    "Content-Type",
                    "Authorization",
                ],
            }
        },
        supports_credentials=False,
    )

    init_mongo(app)

    jwt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(observations_bp)

    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    return app