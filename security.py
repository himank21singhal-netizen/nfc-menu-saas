import hmac
import hashlib
from urllib.parse import urlencode

def generate_nfc_url(base_domain: str, tenant_slug: str, table_number: int, secret_key: str) -> str:
    """
    Generates a cryptographically signed URL to encode onto physical NFC tags.
    """
    payload = f"{tenant_slug}:{table_number}"
    
    # Generate HMAC-SHA256 signature using the restaurant's private key
    signature = hmac.new(
        secret_key.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    params = urlencode({"tbl": table_number, "sig": signature})
    return f"https://{base_domain}/m/{tenant_slug}?{params}"


def verify_nfc_tap(tenant_slug: str, table_number: int, signature: str, secret_key: str) -> bool:
    """
    Verifies that an incoming NFC tap hasn't been tampered with or manually typed.
    """
    payload = f"{tenant_slug}:{table_number}"
    
    expected_signature = hmac.new(
        secret_key.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # Use constant-time comparison to prevent timing attacks
    return hmac.compare_digest(expected_signature, signature)


# --- Quick Local Test ---
if __name__ == "__main__":
    # Test credentials for a dummy restaurant
    TEST_SECRET = "a4f8b92c10d3e5f67890ab12cd34ef56"
    RESTAURANT_SLUG = "urban-bistro"
    TABLE_NO = 5
    DOMAIN = "yourmenu.app"

    # 1. Generate the URL to write onto the NFC chip
    nfc_url = generate_nfc_url(DOMAIN, RESTAURANT_SLUG, TABLE_NO, TEST_SECRET)
    print("Encoded NFC URL:", nfc_url)

    # 2. Simulate server-side verification when diner taps tag
    is_valid = verify_nfc_tap(RESTAURANT_SLUG, TABLE_NO, signature=nfc_url.split("sig=")[1], secret_key=TEST_SECRET)
    print("Signature Valid?", is_valid)