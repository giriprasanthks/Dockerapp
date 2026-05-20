from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # ── Configuration ──────────────────────────────────────────────
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+pymysql://{os.getenv('DB_USER','gardenuser')}:"
        f"{os.getenv('DB_PASSWORD','gardenpass')}@"
        f"{os.getenv('DB_HOST','db')}:"
        f"{os.getenv('DB_PORT','3306')}/"
        f"{os.getenv('DB_NAME','gardendb')}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", "super-secret-garden-key")

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # ── Register blueprints ────────────────────────────────────────
    from .routes.auth    import auth_bp
    from .routes.plants  import plants_bp
    from .routes.plots   import plots_bp
    from .routes.tasks   import tasks_bp

    app.register_blueprint(auth_bp,   url_prefix="/api/auth")
    app.register_blueprint(plants_bp, url_prefix="/api/plants")
    app.register_blueprint(plots_bp,  url_prefix="/api/plots")
    app.register_blueprint(tasks_bp,  url_prefix="/api/tasks")

    # ── Health check ───────────────────────────────────────────────
    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "GardenApp Backend"}, 200

    return app
