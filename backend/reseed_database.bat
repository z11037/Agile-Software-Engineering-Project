@echo off
echo ============================================================
echo Reseeding Database with 10,000+ Words
echo ============================================================
echo.

REM Check if conda environment exists
conda env list | findstr "english-learning" >nul
if %errorlevel% neq 0 (
    echo ERROR: Conda environment 'english-learning' not found!
    echo Please create it first with: conda env create -f environment.yml
    pause
    exit /b 1
)

echo Step 1: Activating conda environment...
call conda activate english-learning
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate conda environment
    pause
    exit /b 1
)

echo Step 2: Removing old database...
if exist english_learning.db (
    del /F english_learning.db
    echo Old database removed.
) else (
    echo No old database found.
)

echo Step 3: Running seed script...
echo.
python seed.py

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo SUCCESS! Database has been reseeded!
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo ERROR: Failed to seed database
    echo ============================================================
)

echo.
pause
