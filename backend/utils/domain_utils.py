from urllib.parse import urlparse


# Cleans and standardizes URLs
def normalize_url(input_url: str):

    # Remove spaces
    input_url = input_url.strip()

    # Auto-add https:// if missing
    if not input_url.startswith(("http://", "https://")):
        input_url = "https://" + input_url

    return input_url


# Extract domain from URL
def extract_domain(input_url: str):

    # Break URL into parts
    parsed_url = urlparse(input_url)

    # Return domain
    return parsed_url.netloc or parsed_url.path