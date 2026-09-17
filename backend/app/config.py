import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGO_URI = os.getenv("MONGO_URI")
    MONGO_DATABASE = os.getenv(
        "MONGO_DATABASE",
        "carcrash"
    )

    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
    S3_BUCKET = os.getenv("S3_BUCKET")

    # JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

    # Overall request limit
    MAX_CONTENT_LENGTH = 200 * 1024 * 1024  # 200 MB

    # Individual media file limit
    MAX_MEDIA_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

    # Maximum number of files per observation
    MAX_MEDIA_FILES = 10