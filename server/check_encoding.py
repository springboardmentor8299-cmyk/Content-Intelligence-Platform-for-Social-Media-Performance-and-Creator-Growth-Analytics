import os

def check_files(path):
    for root, dirs, files in os.walk(path):
        for f in files:
            if f.endswith(".py"):
                fp = os.path.join(root, f)
                with open(fp, "rb") as o:
                    content = o.read()
                    if b"\x00" in content:
                        print(f"NULL BYTES FOUND: {fp}")

check_files(".")
