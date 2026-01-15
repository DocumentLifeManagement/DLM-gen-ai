import boto3, json
from datetime import datetime
from app.core.database import SessionLocal
from app.models.document import TextractJob, TextractRaw, KeyValue, Table, TableCell
from app.utils.text_parser import extract_key_value_pairs, extract_tables
from app.core.config import settings  # assuming it contains AWS creds & S3_BUCKET

s3_client = boto3.client(
    "s3",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
)

textract = boto3.client(
    "textract",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
)

def handle_completed_textract_job(job: TextractJob):
    """Fetches, stores, and parses Textract results once job completes."""
    db = SessionLocal()

    job = db.query(TextractJob).filter_by(id=job.id).first()
    if not job:
        print(f"⚠️ Job {job.id} not found in DB")
        db.close()
        return

    # ---- 1️⃣ Fetch all paginated Textract results ----
    job_id = job.job_id
    pages = []
    next_token = None

    while True:
        kwargs = {"JobId": job_id}
        if next_token:
            kwargs["NextToken"] = next_token
        response = textract.get_document_analysis(**kwargs)
        pages.append(response)
        next_token = response.get("NextToken")
        if not next_token:
            break

    # ---- 2️⃣ Save full JSON to S3 ----
    result_json = json.dumps(pages)
    result_key = f"results/{job_id}.json"

    s3_client.put_object(
        Bucket=settings.S3_BUCKET,
        Key=result_key,
        Body=result_json,
        ContentType="application/json"
    )

    # ---- 3️⃣ Store raw JSON in DB ----
    existing_raw = db.query(TextractRaw).filter_by(job_id=job.id).first()
    if not existing_raw:
        textract_raw = TextractRaw(job_id=job.id, payload_json=pages)
        db.add(textract_raw)
    job.status = "COMPLETED"
    job.completed_at = datetime.utcnow()
    job.document.status = "REVIEW_PENDING"
    job.results_s3_key = result_key  # add this column if not already

    db.commit()
    db.refresh(job)

    # ---- 4️⃣ Parse structured data ----
    blocks = []
    for p in pages:
        blocks.extend(p["Blocks"])

    kv_pairs = extract_key_value_pairs(blocks)
    tables = extract_tables(blocks)

    for kv in kv_pairs:
        db.add(KeyValue(
            document_id=job.document_id,
            job_id=job.id,
            page=1,
            key_text=kv["key"],
            value_text=kv["value"],
            key_confidence=kv["key_conf"],
            value_confidence=kv["val_conf"],
        ))

    for table in tables:
        t = Table(document_id=job.document_id, job_id=job.id, page=table["page"])
        db.add(t)
        db.flush()
        for cell in table["cells"]:
            db.add(TableCell(
                table_id=t.id,
                row_index=cell["row"],
                col_index=cell["col"],
                text=cell["text"],
                confidence=cell["confidence"]
            ))

    try:
        # your parsing + inserts for KeyValue, Table, TableCell
        db.commit()
        print(f"✅ Parsed data stored for job {job.id}")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Failed to store parsed data for job {job.id}: {e}")

