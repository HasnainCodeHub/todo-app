import bcrypt

def hash_password(password: str) -> str:
    if isinstance(password, str):
        password = password.encode("utf-8")

    # bcrypt limit protection
    password = password[:72]

    hashed = bcrypt.hashpw(password, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    if isinstance(password, str):
        password = password.encode("utf-8")

    return bcrypt.checkpw(password, hashed_password.encode("utf-8"))
