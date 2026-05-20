from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import Task
from .. import db

tasks_bp = Blueprint("tasks", __name__)

@tasks_bp.route("/", methods=["GET"])
@jwt_required()
def list_tasks():
    uid   = int(get_jwt_identity())
    tasks = Task.query.filter_by(user_id=uid).order_by(Task.due_date).all()
    return jsonify([t.to_dict() for t in tasks])

@tasks_bp.route("/", methods=["POST"])
@jwt_required()
def create_task():
    uid  = int(get_jwt_identity())
    data = request.get_json()
    task = Task(user_id=uid, **data)
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201

@tasks_bp.route("/<int:tid>", methods=["PATCH"])
@jwt_required()
def update_task(tid):
    uid  = int(get_jwt_identity())
    task = Task.query.filter_by(id=tid, user_id=uid).first_or_404()
    data = request.get_json()
    for k, v in data.items():
        setattr(task, k, v)
    db.session.commit()
    return jsonify(task.to_dict())

@tasks_bp.route("/<int:tid>", methods=["DELETE"])
@jwt_required()
def delete_task(tid):
    uid  = int(get_jwt_identity())
    task = Task.query.filter_by(id=tid, user_id=uid).first_or_404()
    db.session.delete(task)
    db.session.commit()
    return jsonify({"deleted": tid})
