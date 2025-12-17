"""Configuration management for Todo API.

Loads environment variables and provides application settings.
Phase II: Added BETTER_AUTH_SECRET for JWT verification.
"""

import os

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Attributes:
        DATABASE_URL: PostgreSQL connection string.
                     Accepts both sync (postgresql://) and async (postgresql+asyncpg://) formats.
                     The application auto-converts to async format if needed.
        BETTER_AUTH_SECRET: Secret key for JWT HS256 signature verification.
                           Required for production; defaults to test value in TESTING mode.
        CORS_ORIGINS: Comma-separated list of allowed CORS origins.
        APP_NAME: Application name for logging and metadata.
        DEBUG: Enable debug mode (default: False).
        TESTING: Flag indicating test environment (default: 0).
        INTEGRATION_TESTS: Flag for running integration tests (default: 0).
    """

    DATABASE_URL: str = ""
    BETTER_AUTH_SECRET: str = ""
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    APP_NAME: str = "Todo API"
    DEBUG: bool = False
    TESTING: str = "0"
    INTEGRATION_TESTS: str = "0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @model_validator(mode="after")
    def check_required_settings(self):
        """Validate required settings based on environment."""
        is_testing = os.getenv("TESTING") == "1" or self.TESTING == "1"

        # DATABASE_URL validation
        if is_testing and not self.DATABASE_URL:
            self.DATABASE_URL = "sqlite+aiosqlite:///:memory:"
        elif not self.DATABASE_URL:
            raise ValueError("DATABASE_URL is required when not in testing environment.")

        # BETTER_AUTH_SECRET validation
        if is_testing and not self.BETTER_AUTH_SECRET:
            self.BETTER_AUTH_SECRET = "test-secret-key-for-testing-only-do-not-use-in-production"
        elif not self.BETTER_AUTH_SECRET:
            raise ValueError("BETTER_AUTH_SECRET is required when not in testing environment.")

        return self

    @property
    def async_database_url(self) -> str:
        """Return the DATABASE_URL converted to async format for asyncpg.

        Converts postgresql:// to postgresql+asyncpg:// if needed.
        """
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    @property
    def is_testing(self) -> bool:
        """Check if running in test mode."""
        return os.getenv("TESTING") == "1" or self.TESTING == "1"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


# Global settings instance
settings = Settings()
