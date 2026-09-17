import os

from flask import current_app


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/webp": {".webp"},
}

ALLOWED_VIDEO_TYPES = {
    "video/mp4": {".mp4"},
    "video/webm": {".webm"},
    "video/quicktime": {".mov"},
}


ALLOWED_TYPES = {
    **ALLOWED_IMAGE_TYPES,
    **ALLOWED_VIDEO_TYPES,
}


def validate_media_file(file):
    if not file:
        raise ValueError("Invalid file.")

    if not file.filename:
        raise ValueError("File must have a filename.")

    filename = file.filename.lower()

    extension = os.path.splitext(filename)[1]

    content_type = (
        file.content_type or ""
    ).lower()

    # Validate MIME type
    if content_type not in ALLOWED_TYPES:
        raise ValueError(
            f"File type '{content_type}' is not allowed."
        )

    # Validate extension
    allowed_extensions = ALLOWED_TYPES[content_type]

    if extension not in allowed_extensions:
        raise ValueError(
            "File extension does not match its content type."
        )

    # Check file size
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)

    max_size = current_app.config[
        "MAX_MEDIA_FILE_SIZE"
    ]

    if size > max_size:
        raise ValueError(
            "Each media file must be 50 MB or smaller."
        )

    if size == 0:
        raise ValueError(
            "Empty files are not allowed."
        )

    if content_type.startswith("image/"):
        media_type = "image"
    else:
        media_type = "video"

    return {
        "size": size,
        "content_type": content_type,
        "media_type": media_type,
        "extension": extension,
    }


def validate_media_files(files):
    max_files = current_app.config[
        "MAX_MEDIA_FILES"
    ]

    if len(files) > max_files:
        raise ValueError(
            f"You can upload a maximum of "
            f"{max_files} files."
        )

    total_size = 0
    validated = []

    for file in files:
        result = validate_media_file(file)

        total_size += result["size"]

        validated.append(result)

    max_total_size = (
        current_app.config["MAX_CONTENT_LENGTH"]
    )

    if total_size > max_total_size:
        raise ValueError(
            "The total upload size is too large."
        )

    return validated