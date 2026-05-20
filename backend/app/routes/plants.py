from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models import Plant
from .. import db

plants_bp = Blueprint("plants", __name__)

@plants_bp.route("/", methods=["GET"])
def list_plants():
    category = request.args.get("category")
    q = Plant.query
    if category:
        q = q.filter_by(category=category)
    return jsonify([p.to_dict() for p in q.all()])

@plants_bp.route("/<int:pid>", methods=["GET"])
def get_plant(pid):
    p = Plant.query.get_or_404(pid)
    return jsonify(p.to_dict())

@plants_bp.route("/", methods=["POST"])
@jwt_required()
def create_plant():
    data = request.get_json()
    plant = Plant(**data)
    db.session.add(plant)
    db.session.commit()
    return jsonify(plant.to_dict()), 201
