import psycopg2

conn = psycopg2.connect("postgresql://postgres:Bhavesh23@localhost:5432/documentdb")
cur = conn.cursor()

cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='documents'")
existing = [row[0] for row in cur.fetchall()]
print("documents columns:", existing)

if "uploader_message" not in existing:
    cur.execute("ALTER TABLE documents ADD COLUMN uploader_message TEXT")
    print("Added uploader_message to documents")
else:
    print("uploader_message already exists")

conn.commit()
conn.close()
print("Done.")
