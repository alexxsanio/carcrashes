from flask import Blueprint, request, jsonify, current_app

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)
from bson import ObjectId
from bson.errors import InvalidId

from app.services.file_validation import (
    validate_media_file,
)
from app.services.s3 import S3Service
from app.services.geocoder import geocode_place

from datetime import datetime, timezone
from app import extensions


observations_bp = Blueprint(
    "observations",
    __name__,
    url_prefix="/api/observations",
)


def get_s3_service():
    return S3Service(
        access_key=current_app.config[
            "AWS_ACCESS_KEY_ID"
        ],
        secret_key=current_app.config[
            "AWS_SECRET_ACCESS_KEY"
        ],
        region=current_app.config[
            "AWS_REGION"
        ],
        bucket=current_app.config[
            "S3_BUCKET"
        ],
    )


def serialize_observation(
    observation,
    include_media_urls=False,
):
    """
    Convert MongoDB document into JSON-safe data.

    Presigned URLs are generated only when requested.
    """

    observation_id = str(
        observation["_id"]
    )

    result = {
        "id": observation_id,

        "nearbyPlace": observation.get(
            "nearbyPlace"
        ),

        "latitude": observation.get(
            "latitude"
        ),

        "longitude": observation.get(
            "longitude"
        ),

        "geocodedPlace": observation.get(
            "geocodedPlace"
        ),

        "date": observation.get(
            "date"
        ),

        "time": observation.get(
            "time"
        ),

        "severity": observation.get(
            "severity"
        ),

        "vehicles": observation.get(
            "vehicles"
        ),

        "description": observation.get(
            "description",
            "",
        ),

        "createdAt": observation.get(
            "createdAt"
        ),

        "media": [],
    }

    if include_media_urls:
        s3 = get_s3_service()

        for media in observation.get(
            "media",
            [],
        ):
            try:
                url = (
                    s3.generate_presigned_url(
                        media["key"],
                        expiration=900,
                    )
                )

                result["media"].append({
                    "url": url,
                    "type": media["type"],
                    "filename": media[
                        "filename"
                    ],
                })

            except Exception as error:
                current_app.logger.error(
                    "Could not generate "
                    f"presigned URL: {error}"
                )

    else:
        # Return metadata without exposing
        # the S3 object key.
        for media in observation.get(
            "media",
            [],
        ):
            result["media"].append({
                "type": media["type"],
                "filename": media[
                    "filename"
                ],
            })

    return result


@observations_bp.route(
    "",
    methods=["GET"],
)
@jwt_required()
def get_observations():
    """
    Get observations for the map.

    Media URLs are not generated here.
    This keeps the initial map request lightweight.
    """

    observations = list(
        extensions.mongo_db["observations"].find({})
        .sort(
            "createdAt",
            -1,
        )
    )

    return jsonify({
        "observations": [
            serialize_observation(
                observation
            )
            for observation in observations
        ]
    })


@observations_bp.route(
    "/<observation_id>",
    methods=["GET"],
)
@jwt_required()
def get_observation(observation_id):

    try:
        # 1. Convert ID
        try:
            object_id = ObjectId(observation_id)
        except InvalidId as e:
            return jsonify({
                "error": "Invalid observation ID"
            }), 400

        # 2. Query MongoDB
        try:
            observation = extensions.mongo_db["observations"].find_one({
                "_id": object_id
            })
        except Exception as e:
            return jsonify({
                "error": "MongoDB query failed",
                "details": str(e)
            }), 500

        if not observation:
            return jsonify({
                "error": "Observation not found"
            }), 404

        # 3. Create S3 service
        try:
            s3 = get_s3_service()
        except Exception as e:
            return jsonify({
                "error": "S3 service failed",
                "details": str(e)
            }), 500

        # 4. Generate media URLs
        media = []

        for item in observation.get("media", []):

            try:
                url = s3.generate_presigned_url(
                    item["key"],
                    expiration=900
                )

                media.append({
                    "url": url,
                    "type": item["type"],
                    "filename": item["filename"],
                })

            except Exception as e:

                return jsonify({
                    "error": "Failed to generate media URL",
                    "details": str(e)
                }), 500

        # 5. Return observation
        result = {
            "id": str(observation["_id"]),
            "nearbyPlace": observation.get("nearbyPlace"),
            "latitude": observation.get("latitude"),
            "longitude": observation.get("longitude"),
            "date": observation.get("date"),
            "time": observation.get("time"),
            "severity": observation.get("severity"),
            "vehicles": observation.get("vehicles"),
            "description": observation.get("description"),
            "media": media,
            "createdAt": observation.get("createdAt"),
        }

        return jsonify(result), 200

    except Exception as e:

        return jsonify({
            "error": "Unexpected server error",
            "details": str(e)
        }), 500


@observations_bp.route(
    "",
    methods=["POST"],
)
@jwt_required()
def create_observation():
    # --------------------------------
    # Read form data
    # --------------------------------

    user_id = get_jwt_identity()

    date = request.form.get(
        "date"
    )

    time = request.form.get(
        "time"
    )

    nearby_place = request.form.get(
        "nearbyPlace"
    )

    severity = request.form.get(
        "severity"
    )

    vehicles = request.form.get(
        "vehicles"
    )

    description = request.form.get(
        "description",
        "",
    )

    # --------------------------------
    # Validate required fields
    # --------------------------------

    if not date:
        return jsonify({
            "error": "Date is required."
        }), 400

    if not time:
        return jsonify({
            "error": "Time is required."
        }), 400

    if not nearby_place:
        return jsonify({
            "error":
                "Nearby place is required."
        }), 400

    if not severity:
        return jsonify({
            "error":
                "Severity is required."
        }), 400

    try:
        vehicles = int(
            request.form.get("vehicles", "0")
        )
    except (
        ValueError,
    ):
        return jsonify({
            "error":
                "Vehicles must be a number."
        }), 400

    if vehicles < 1:
        return jsonify({
            "error":
                "Vehicles must be at least 1."
        }), 400

    # --------------------------------
    # Geocode nearby place
    # --------------------------------

    location = None

    try:
        location = geocode_place(
            nearby_place
        )

    except Exception as error:
        current_app.logger.warning(
            "Geocoding failed: "
            f"{error}"
        )

    # --------------------------------
    # Upload media to private S3
    # --------------------------------

    media = []

    uploaded_files = (
        request.files.getlist(
            "media"
        )
    )

    s3 = get_s3_service()

    for file in uploaded_files:
        if (
            not file
            or not file.filename
        ):
            continue

        try:
            # -------------------------
            # Validate file BEFORE S3
            # -------------------------

            try:
                validated_files = validate_media_file(file)
            except ValueError as error:
                return {
                    "error": str(error)
                }, 400
                
            uploaded = (
                s3.upload_file(file)
            )

            media.append({
                "key": uploaded["key"],
                "type": uploaded["type"],
                "filename":
                    uploaded["filename"],
            })

        except Exception as error:
            current_app.logger.error(
                "S3 upload failed: "
                f"{error}"
            )

            return jsonify({
                "error":
                    "Media upload failed."
            }), 500

    # --------------------------------
    # Create MongoDB document
    # --------------------------------

    observation = {
        "userId": user_id,
        
        "date": date,

        "time": time,

        "nearbyPlace":
            nearby_place,

        "latitude": (
            location["latitude"]
            if location
            else None
        ),

        "longitude": (
            location["longitude"]
            if location
            else None
        ),

        "geocodedPlace": (
            location[
                "display_name"
            ]
            if location
            else None
        ),

        "severity": severity,

        "vehicles": vehicles,

        "description":
            description,

        "media": media,

        "createdAt":
            datetime.now(
                timezone.utc
            ).isoformat(),
    }

    result = (
        extensions.mongo_db["observations"].insert_one(
            observation
        )
    )

    observation["_id"] = (
        result.inserted_id
    )

    return jsonify({
        "message":
            "Observation saved successfully.",

        "observation":
            serialize_observation(
                observation
            ),
    }), 201