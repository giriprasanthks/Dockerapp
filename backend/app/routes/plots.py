from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import GardenPlot, PlotPlant, Plant
from .. import db

plots_bp = Blueprint("plots", __name__)

@plots_bp.route("/", methods=["GET"])
@jwt_required()
def list_plots():
    uid = int(get_jwt_identity())
    plots = GardenPlot.query.filter_by(user_id=uid).all()
    return jsonify([p.to_dict() for p in plots])

@plots_bp.route("/", methods=["POST"])
@jwt_required()
def create_plot():
    uid  = int(get_jwt_identity())
    data = request.get_json()
    plot = GardenPlot(user_id=uid, **data)
    db.session.add(plot)
    db.session.commit()
    return jsonify(plot.to_dict()), 201

@plots_bp.route("/<int:pid>", methods=["DELETE"])
@jwt_required()
def delete_plot(pid):
    uid  = int(get_jwt_identity())
    plot = GardenPlot.query.filter_by(id=pid, user_id=uid).first_or_404()
    db.session.delete(plot)
    db.session.commit()
    return jsonify({"deleted": pid})

# ── Plants inside a plot ───────────────────────────────────────────
@plots_bp.route("/<int:pid>/plants", methods=["GET"])
@jwt_required()
def list_plot_plants(pid):
    return jsonify([pp.to_dict() for pp in PlotPlant.query.filter_by(plot_id=pid).all()])

@plots_bp.route("/<int:pid>/plants", methods=["POST"])
@jwt_required()
def add_plant_to_plot(pid):
    data = request.get_json()
    pp = PlotPlant(plot_id=pid, **data)
    db.session.add(pp)
    db.session.commit()
    return jsonify(pp.to_dict()), 201

@plots_bp.route("/<int:pid>/plants/<int:ppid>", methods=["PATCH"])
@jwt_required()
def update_plot_plant(pid, ppid):
    pp   = PlotPlant.query.filter_by(id=ppid, plot_id=pid).first_or_404()
    data = request.get_json()
    for k, v in data.items():
        setattr(pp, k, v)
    db.session.commit()
    return jsonify(pp.to_dict())

@plots_bp.route("/<int:pid>/plants/<int:ppid>", methods=["DELETE"])
@jwt_required()
def remove_plant_from_plot(pid, ppid):
    pp = PlotPlant.query.filter_by(id=ppid, plot_id=pid).first_or_404()
    db.session.delete(pp)
    db.session.commit()
    return jsonify({"deleted": ppid})
