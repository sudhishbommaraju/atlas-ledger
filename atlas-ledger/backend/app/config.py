from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/atlas_ledger"
    app_name: str = "Atlas Ledger"
    version: str = "0.1.0"

    model_config = {"env_file": ".env"}


settings = Settings()
