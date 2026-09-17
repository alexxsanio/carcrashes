import uuid

import boto3
from werkzeug.utils import secure_filename


class S3Service:
    def __init__(
        self,
        access_key,
        secret_key,
        region,
        bucket,
    ):
        self.bucket = bucket
        self.region = region

        self.client = boto3.client(
            "s3",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )

    def upload_file(self, file):
        """
        Upload a file to a private S3 bucket.

        Only the S3 object key is returned.
        No public URL is created.
        """

        original_name = secure_filename(
            file.filename
        )

        extension = ""

        if "." in original_name:
            extension = (
                "."
                + original_name.rsplit(".", 1)[1]
            )

        key = (
            "crash-observations/"
            f"{uuid.uuid4()}"
            f"{extension}"
        )

        self.client.upload_fileobj(
            file,
            self.bucket,
            key,
            ExtraArgs={
                "ContentType": file.content_type
            },
        )

        media_type = "video"

        if file.content_type.startswith(
            "image/"
        ):
            media_type = "image"

        return {
            "key": key,
            "type": media_type,
            "filename": original_name,
        }

    def generate_presigned_url(
        self,
        key,
        expiration=900,
    ):
        """
        Generate a temporary URL for a
        private S3 object.

        expiration is in seconds.
        Default: 15 minutes.
        """

        return self.client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self.bucket,
                "Key": key,
            },
            ExpiresIn=expiration,
        )