import boto3
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

# Initialize S3 Client
try:
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )
except Exception as e:
    print(f"⚠️ S3 Init Error: {e}")
    s3_client = None

def upload_file_to_s3(file_obj, filename: str, folder: str = "uploads") -> str:
    """
    Uploads a file object to S3 and returns the public URL.
    """
    if not s3_client:
        print("❌ S3 Client not initialized.")
        return None

    try:
        # Generate unique filename
        ext = filename.split(".")[-1] if "." in filename else "bin"
        unique_name = f"{folder}/{uuid.uuid4()}.{ext}"
        
        # Upload (No ACL - relies on Bucket Policy)
        s3_client.upload_fileobj(
            file_obj,
            AWS_BUCKET_NAME,
            unique_name,
            # We try to guess content type or default to binary
            ExtraArgs={"ContentType": "application/octet-stream"} 
        )
        
        return f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_name}"

    except Exception as e:
        print(f"❌ S3 Upload Error: {str(e)}")
        return None
