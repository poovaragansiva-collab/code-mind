import sys
from pathlib import Path

# Ensure the backend directory (containing the 'app' package) is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

