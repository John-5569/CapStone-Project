import asyncio
import os
import sys
import traceback
from pathlib import Path

import numpy as np
import pandas as pd
from mega.client import MegaNzClient


# ============================================================
# CONFIGURATION
# ============================================================

FILE_ID = os.getenv("FILE_ID")
CLOUD_EMAIL = os.getenv("CLOUD_EMAIL")
CLOUD_PASSWORD = os.getenv("CLOUD_PASSWORD")

WORK_DIR = Path("/tmp/dataset")
INPUT_DIR = WORK_DIR / "input"
OUTPUT_DIR = WORK_DIR / "output"

SUPPORTED_EXTENSIONS = {
    ".csv",
    ".xlsx",
    ".xls",
    ".json",
    ".parquet",
}


# ============================================================
# ENVIRONMENT VALIDATION
# ============================================================

def validate_environment() -> None:

    print("Validating environment variables...")

    if not FILE_ID:
        raise ValueError("FILE_ID environment variable is missing")

    if not CLOUD_EMAIL:
        raise ValueError("CLOUD_EMAIL environment variable is missing")

    if not CLOUD_PASSWORD:
        raise ValueError("CLOUD_PASSWORD environment variable is missing")

    print("Environment validation successful")


# ============================================================
# DIRECTORY SETUP
# ============================================================

def create_directories() -> None:

    INPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    print(f"Input directory  : {INPUT_DIR}")
    print(f"Output directory : {OUTPUT_DIR}")


# ============================================================
# FIND MEGA FILE
# ============================================================

async def find_file(
    mega: MegaNzClient,
    file_id: str
):

    print()
    print("========================================")
    print("Searching for MEGA file")
    print("========================================")

    print(f"Requested file ID: {file_id}")

    filesystem = await mega.get_filesystem(
        force=True
    )

    # Search recursively through the MEGA filesystem
    for node in filesystem.iterdir(
        filesystem.root.id,
        recursive=True
    ):

        if node.id == file_id:

            print("File found successfully")

            print(f"File ID : {node.id}")

            try:
                file_path = filesystem.absolute_path(
                    node.id
                )

                print(f"Path    : {file_path}")

            except Exception:
                pass

            return node

    raise FileNotFoundError(
        f"MEGA file '{file_id}' was not found"
    )


# ============================================================
# DOWNLOAD FILE
# ============================================================

async def download_file(
    mega: MegaNzClient,
    file_node
) -> Path:

    print()
    print("========================================")
    print("Downloading dataset")
    print("========================================")

    file_name = None
    if hasattr(file_node, 'name') and file_node.name:
        file_name = file_node.name
    elif hasattr(file_node, 'attributes'):
        attrs = getattr(file_node, 'attributes')
        if isinstance(attrs, dict):
            file_name = attrs.get('name')
        else:
            file_name = getattr(attrs, 'name', None)
    if file_name:
        existing_file = INPUT_DIR / file_name
        if existing_file.exists():
            try:
                existing_file.unlink()
                print(f"Cleaned previous file at {existing_file}")
            except Exception as ex:
                print(f"Warning cleaning existing file: {ex}")

    try:
        downloaded_file = await mega.download(
            file_node,
            str(INPUT_DIR)
        )
    except FileExistsError:
        if file_name:
            existing_file = INPUT_DIR / file_name
            if existing_file.exists():
                existing_file.unlink()
        downloaded_file = await mega.download(
            file_node,
            str(INPUT_DIR)
        )

    if not downloaded_file:

        raise RuntimeError(
            "MEGA download returned no file path"
        )

    downloaded_path = Path(
        downloaded_file
    )

    if not downloaded_path.exists():

        raise FileNotFoundError(
            f"Downloaded file does not exist: "
            f"{downloaded_path}"
        )

    print(
        f"Downloaded file: {downloaded_path}"
    )

    print(
        f"File size: "
        f"{downloaded_path.stat().st_size / 1024:.2f} KB"
    )

    return downloaded_path


# ============================================================
# READ DATASET
# ============================================================

def read_dataset(
    input_file: Path
) -> pd.DataFrame:

    extension = input_file.suffix.lower()

    print()
    print("========================================")
    print("Reading dataset")
    print("========================================")

    print(f"File      : {input_file.name}")
    print(f"Extension : {extension}")

    if extension not in SUPPORTED_EXTENSIONS:

        supported = ", ".join(
            sorted(SUPPORTED_EXTENSIONS)
        )

        raise ValueError(
            f"Unsupported dataset format: {extension}. "
            f"Supported formats: {supported}"
        )

    # --------------------------------------------------------
    # CSV
    # --------------------------------------------------------

    if extension == ".csv":

        df = pd.read_csv(
            input_file
        )

    # --------------------------------------------------------
    # Excel
    # --------------------------------------------------------

    elif extension in {".xlsx", ".xls"}:

        df = pd.read_excel(
            input_file
        )

    # --------------------------------------------------------
    # JSON
    # --------------------------------------------------------

    elif extension == ".json":

        df = pd.read_json(
            input_file
        )

    # --------------------------------------------------------
    # Parquet
    # --------------------------------------------------------

    elif extension == ".parquet":

        df = pd.read_parquet(
            input_file
        )

    else:

        raise ValueError(
            f"Unsupported file extension: {extension}"
        )

    if df.empty:

        raise ValueError(
            "Dataset is empty"
        )

    print(
        f"Rows    : {len(df)}"
    )

    print(
        f"Columns : {len(df.columns)}"
    )

    return df


# ============================================================
# CLEAN COLUMN NAMES
# ============================================================

def clean_column_names(
    df: pd.DataFrame
) -> pd.DataFrame:

    print()
    print("Cleaning column names...")

    new_columns = []

    for column in df.columns:

        column_name = str(column)

        column_name = (
            column_name
            .strip()
            .lower()
        )

        # Replace spaces with underscores
        column_name = (
            column_name
            .replace(" ", "_")
        )

        # Remove unwanted characters
        column_name = "".join(
            character
            if character.isalnum() or character == "_"
            else "_"
            for character in column_name
        )

        # Remove duplicate underscores
        while "__" in column_name:

            column_name = column_name.replace(
                "__",
                "_"
            )

        column_name = column_name.strip("_")

        if not column_name:

            column_name = "column"

        new_columns.append(
            column_name
        )

    # --------------------------------------------------------
    # Make duplicate column names unique
    # --------------------------------------------------------

    seen = {}

    unique_columns = []

    for column in new_columns:

        if column not in seen:

            seen[column] = 0

            unique_columns.append(
                column
            )

        else:

            seen[column] += 1

            unique_columns.append(
                f"{column}_{seen[column]}"
            )

    df.columns = unique_columns

    print(
        f"Cleaned columns: {list(df.columns)}"
    )

    return df


# ============================================================
# REMOVE EMPTY ROWS AND COLUMNS
# ============================================================

def remove_empty_data(
    df: pd.DataFrame
) -> pd.DataFrame:

    print()
    print("Removing empty rows and columns...")

    original_rows = len(df)

    original_columns = len(
        df.columns
    )

    # Completely empty rows
    empty_rows = int(
        df.isna()
        .all(axis=1)
        .sum()
    )

    df = df.dropna(
        how="all"
    )

    # Completely empty columns
    empty_columns = int(
        df.isna()
        .all(axis=0)
        .sum()
    )

    df = df.dropna(
        axis=1,
        how="all"
    )

    print(
        f"Removed empty rows    : {empty_rows}"
    )

    print(
        f"Removed empty columns : {empty_columns}"
    )

    print(
        f"Rows: {original_rows} -> {len(df)}"
    )

    print(
        f"Columns: "
        f"{original_columns} -> {len(df.columns)}"
    )

    return df


# ============================================================
# REMOVE DUPLICATES
# ============================================================

def remove_duplicates(
    df: pd.DataFrame
) -> pd.DataFrame:

    print()
    print("Checking duplicate rows...")

    duplicate_count = int(
        df.duplicated()
        .sum()
    )

    print(
        f"Duplicate rows found: {duplicate_count}"
    )

    if duplicate_count > 0:

        df = df.drop_duplicates()

    print(
        f"Rows after duplicate removal: {len(df)}"
    )

    return df


# ============================================================
# HANDLE INFINITE VALUES
# ============================================================

def handle_infinite_values(
    df: pd.DataFrame
) -> pd.DataFrame:

    print()
    print("Checking infinite values...")

    numeric_columns = df.select_dtypes(
        include=np.number
    ).columns

    if len(numeric_columns) == 0:

        print(
            "No numeric columns found"
        )

        return df

    infinity_count = 0

    for column in numeric_columns:

        positive_infinity = np.isposinf(
            df[column]
        ).sum()

        negative_infinity = np.isneginf(
            df[column]
        ).sum()

        infinity_count += (
            positive_infinity
            + negative_infinity
        )

    print(
        f"Infinite values found: "
        f"{infinity_count}"
    )

    if infinity_count > 0:

        df[numeric_columns] = (
            df[numeric_columns]
            .replace(
                [np.inf, -np.inf],
                np.nan
            )
        )

    return df


# ============================================================
# HANDLE MISSING VALUES
# ============================================================

def handle_missing_values(
    df: pd.DataFrame
) -> pd.DataFrame:

    print()
    print("Handling missing values...")

    missing_before = int(
        df.isna()
        .sum()
        .sum()
    )

    print(
        f"Missing values before: "
        f"{missing_before}"
    )

    for column in df.columns:

        missing_count = int(
            df[column]
            .isna()
            .sum()
        )

        if missing_count == 0:

            continue

        # ----------------------------------------------------
        # Numeric column
        # ----------------------------------------------------

        if pd.api.types.is_numeric_dtype(
            df[column]
        ):

            median = df[column].median()

            if pd.notna(median):

                df[column] = (
                    df[column]
                    .fillna(median)
                )

            else:

                # If entire numeric column is NaN
                df[column] = (
                    df[column]
                    .fillna(0)
                )

        # ----------------------------------------------------
        # Non-numeric column
        # ----------------------------------------------------

        else:

            mode = (
                df[column]
                .mode()
            )

            if not mode.empty:

                df[column] = (
                    df[column]
                    .fillna(
                        mode.iloc[0]
                    )
                )

            else:

                df[column] = (
                    df[column]
                    .fillna("unknown")
                )

    missing_after = int(
        df.isna()
        .sum()
        .sum()
    )

    print(
        f"Missing values after : "
        f"{missing_after}"
    )

    return df


# ============================================================
# OUTLIER DETECTION
# ============================================================

def handle_outliers(
    df: pd.DataFrame
) -> pd.DataFrame:

    print()
    print("Checking numeric outliers using IQR...")

    numeric_columns = df.select_dtypes(
        include=np.number
    ).columns

    if len(numeric_columns) == 0:

        print(
            "No numeric columns found"
        )

        return df

    total_outliers = 0

    for column in numeric_columns:

        # Need enough values to calculate IQR
        if df[column].dropna().shape[0] < 4:

            continue

        q1 = df[column].quantile(
            0.25
        )

        q3 = df[column].quantile(
            0.75
        )

        iqr = q3 - q1

        if pd.isna(iqr):

            continue

        # Constant column
        if iqr == 0:

            continue

        lower_bound = (
            q1 - 1.5 * iqr
        )

        upper_bound = (
            q3 + 1.5 * iqr
        )

        mask = (
            (df[column] < lower_bound)
            |
            (df[column] > upper_bound)
        )

        outlier_count = int(
            mask.sum()
        )

        if outlier_count > 0:

            print(
                f"{column}: "
                f"{outlier_count} outliers"
            )

            total_outliers += (
                outlier_count
            )

            # ------------------------------------------------
            # We use winsorization/clipping instead of
            # deleting rows.
            # ------------------------------------------------

            df[column] = (
                df[column]
                .clip(
                    lower=lower_bound,
                    upper=upper_bound
                )
            )

    print(
        f"Total outlier values handled: "
        f"{total_outliers}"
    )

    return df


# ============================================================
# CLEAN DATASET
# ============================================================

def clean_dataset(
    input_file: Path
) -> Path:

    print()
    print("========================================")
    print("Starting dataset cleaning")
    print("========================================")

    print(
        f"Input file: {input_file}"
    )

    # --------------------------------------------------------
    # Read
    # --------------------------------------------------------

    df = read_dataset(
        input_file
    )

    print()
    print("Original dataset")
    print(
        f"Rows    : {len(df)}"
    )
    print(
        f"Columns : {len(df.columns)}"
    )

    # --------------------------------------------------------
    # Empty values
    # --------------------------------------------------------

    df = remove_empty_data(
        df
    )

    # --------------------------------------------------------
    # Column names
    # --------------------------------------------------------

    df = clean_column_names(
        df
    )

    # --------------------------------------------------------
    # Duplicate rows
    # --------------------------------------------------------

    df = remove_duplicates(
        df
    )

    # --------------------------------------------------------
    # Infinite values
    # --------------------------------------------------------

    df = handle_infinite_values(
        df
    )

    # --------------------------------------------------------
    # Missing values
    # --------------------------------------------------------

    df = handle_missing_values(
        df
    )

    # --------------------------------------------------------
    # Outliers
    # --------------------------------------------------------

    df = handle_outliers(
        df
    )

    # --------------------------------------------------------
    # Final safety check
    # --------------------------------------------------------

    if df.empty:

        raise ValueError(
            "Dataset became empty after cleaning"
        )

    # --------------------------------------------------------
    # Save cleaned dataset
    # --------------------------------------------------------

    output_file = (
        OUTPUT_DIR
        / f"{input_file.stem}_cleaned.csv"
    )

    df.to_csv(
        output_file,
        index=False
    )

    print()
    print("========================================")
    print("Dataset cleaning completed")
    print("========================================")

    print(
        f"Final rows    : {len(df)}"
    )

    print(
        f"Final columns : {len(df.columns)}"
    )

    print(
        f"Output file   : {output_file}"
    )

    print(
        f"Output size   : "
        f"{output_file.stat().st_size / 1024:.2f} KB"
    )

    return output_file


# ============================================================
# UPLOAD CLEANED DATASET TO MEGA
# ============================================================

async def upload_file(
    mega: MegaNzClient,
    output_file: Path
):

    print()
    print("========================================")
    print("Uploading cleaned dataset")
    print("========================================")

    if not output_file.exists():

        raise FileNotFoundError(
            f"Output file does not exist: "
            f"{output_file}"
        )

    print(
        f"Uploading: {output_file.name}"
    )

    print(
        f"Size: "
        f"{output_file.stat().st_size / 1024:.2f} KB"
    )

    result = await mega.upload(
        output_file
    )

    print(
        "Upload completed successfully"
    )

    print(
        f"Uploaded file: {output_file.name}"
    )

    return result


# ============================================================
# MAIN PIPELINE
# ============================================================

async def process_dataset():

    print()
    print("========================================")
    print("       DATASET PROCESSOR STARTED")
    print("========================================")
    print()

    # --------------------------------------------------------
    # Validate
    # --------------------------------------------------------

    validate_environment()

    # --------------------------------------------------------
    # Create directories
    # --------------------------------------------------------

    create_directories()

    # --------------------------------------------------------
    # Display job information
    # --------------------------------------------------------

    print()
    print("Job configuration")
    print("-----------------")

    print(
        f"File ID    : {FILE_ID}"
    )

    print(
        f"Cloud user : {CLOUD_EMAIL}"
    )

    # --------------------------------------------------------
    # Connect to MEGA
    # --------------------------------------------------------

    async with MegaNzClient() as mega:

        print()
        print("========================================")
        print("Connecting to MEGA")
        print("========================================")

        await mega.login(
            CLOUD_EMAIL,
            CLOUD_PASSWORD
        )

        print(
            "MEGA login successful"
        )

        # ----------------------------------------------------
        # Find file
        # ----------------------------------------------------

        file_node = await find_file(
            mega,
            FILE_ID
        )

        # ----------------------------------------------------
        # Download
        # ----------------------------------------------------

        input_file = await download_file(
            mega,
            file_node
        )

        # ----------------------------------------------------
        # Clean
        # ----------------------------------------------------

        output_file = clean_dataset(
            input_file
        )

        # ----------------------------------------------------
        # Upload
        # ----------------------------------------------------

        await upload_file(
            mega,
            output_file
        )

    # --------------------------------------------------------
    # Completed
    # --------------------------------------------------------

    print()
    print("========================================")
    print("   PROCESSING COMPLETED SUCCESSFULLY")
    print("========================================")
    print()

    return {
        "status": "success",
        "file_id": FILE_ID,
        "output_file": str(output_file)
    }


# ============================================================
# ENTRY POINT
# ============================================================

def main():

    try:

        result = asyncio.run(
            process_dataset()
        )

        print(
            f"Result: {result}"
        )

        # Kubernetes sees exit code 0 as success.
        sys.exit(0)

    except KeyboardInterrupt:

        print()
        print(
            "Processing interrupted"
        )

        sys.exit(130)

    except Exception as e:

        print()
        print("========================================")
        print("        PROCESSING FAILED")
        print("========================================")

        print(
            f"Error: {e}"
        )

        print()
        print("Full traceback:")
        traceback.print_exc()

        # Kubernetes sees exit code 1 as failure.
        sys.exit(1)


if __name__ == "__main__":

    main()