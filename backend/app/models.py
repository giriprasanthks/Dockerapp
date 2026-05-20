from . import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"
    id            = db.Column(db.Integer, primary_key=True)
    username      = db.Column(db.String(80), unique=True, nullable=False)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    plots  = db.relationship("GardenPlot", backref="owner", lazy=True, cascade="all, delete")
    tasks  = db.relationship("Task",       backref="owner", lazy=True, cascade="all, delete")

    def to_dict(self):
        return {"id": self.id, "username": self.username, "email": self.email}


class Plant(db.Model):
    __tablename__ = "plants"
    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(100), nullable=False)
    category    = db.Column(db.String(50),  nullable=False)
    description = db.Column(db.Text)
    sunlight    = db.Column(db.String(50))
    watering    = db.Column(db.String(50))
    soil_type   = db.Column(db.String(100))
    season      = db.Column(db.String(50))
    image_url   = db.Column(db.String(255))
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "category": self.category,
            "description": self.description, "sunlight": self.sunlight,
            "watering": self.watering, "soil_type": self.soil_type,
            "season": self.season, "image_url": self.image_url,
        }


class GardenPlot(db.Model):
    __tablename__ = "garden_plots"
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    plot_name  = db.Column(db.String(100), nullable=False)
    size_sqft  = db.Column(db.Float)
    location   = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    plot_plants = db.relationship("PlotPlant", backref="plot", lazy=True, cascade="all, delete")
    tasks       = db.relationship("Task",      backref="plot", lazy=True)

    def to_dict(self):
        return {
            "id": self.id, "plot_name": self.plot_name,
            "size_sqft": self.size_sqft, "location": self.location,
            "created_at": self.created_at.isoformat(),
        }


class PlotPlant(db.Model):
    __tablename__ = "plot_plants"
    id           = db.Column(db.Integer, primary_key=True)
    plot_id      = db.Column(db.Integer, db.ForeignKey("garden_plots.id"), nullable=False)
    plant_id     = db.Column(db.Integer, db.ForeignKey("plants.id"), nullable=False)
    planted_date = db.Column(db.Date)
    quantity     = db.Column(db.Integer, default=1)
    notes        = db.Column(db.Text)
    status       = db.Column(db.Enum("planted","growing","harvested","removed"), default="planted")

    plant = db.relationship("Plant", lazy=True)

    def to_dict(self):
        return {
            "id": self.id, "plot_id": self.plot_id,
            "plant": self.plant.to_dict() if self.plant else None,
            "planted_date": str(self.planted_date) if self.planted_date else None,
            "quantity": self.quantity, "notes": self.notes, "status": self.status,
        }


class Task(db.Model):
    __tablename__ = "tasks"
    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    plot_id     = db.Column(db.Integer, db.ForeignKey("garden_plots.id"), nullable=True)
    title       = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    due_date    = db.Column(db.Date)
    completed   = db.Column(db.Boolean, default=False)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id, "plot_id": self.plot_id, "title": self.title,
            "description": self.description,
            "due_date": str(self.due_date) if self.due_date else None,
            "completed": self.completed,
            "created_at": self.created_at.isoformat(),
        }
