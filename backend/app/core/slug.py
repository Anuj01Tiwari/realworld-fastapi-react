import re
import uuid

def generate_slug(title: str) -> str:
    # Lowercase & replace non-alphanumeric with hyphens
    slug = title.lower()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug).strip("-")
    if not slug:
        slug = "article"
    # Append unique short hash to avoid collisions
    unique_suffix = str(uuid.uuid4())[:8]
    return f"{slug}-{unique_suffix}"
