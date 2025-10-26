from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    content = await file.read()
    # Process or temporarily store file content
    return {"filename": file.filename, "size": len(content)}
