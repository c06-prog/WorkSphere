@echo off
setlocal EnableDelayedExpansion

:: Set UTF-8 code page quietly for Unicode display support
chcp 65001 >nul 2>&1

:: Determine repository root directory (strip trailing backslash)
set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

:: State directory for launcher runtime artifacts
set "STATE_DIR=%ROOT%\.local-run"
if not exist "%STATE_DIR%" mkdir "%STATE_DIR%" >nul 2>&1

:: Canonical identifiers
set "POSTGRES_CONTAINER=worksphere-dev-pg"
set "EMULATOR_DEVICE=emulator-5554"
set "EMULATOR_API_URL=http://10.0.2.2:8080/api/v1"
set "BACKEND_URL=http://localhost:8080"
set "PACKAGE_NAME=com.workspheremobile"

:: Check CLI arguments for automation or headless testing
if "%~1"=="status" goto do_status
if "%~1"=="postgres" goto do_postgres
if "%~1"=="backend" goto do_backend
if "%~1"=="metro" goto do_metro
if "%~1"=="android" goto do_android
if "%~1"=="all" goto do_all
if "%~1"=="stop" goto do_stop
if "%~1"=="docs" goto do_docs

:: Main Menu Loop
:menu
cls
echo ===============================================
echo         WORKSPHERE LOCAL DEVELOPMENT
echo ===============================================
echo 1. Khoi dong toan bo du an
echo 2. Chi khoi dong PostgreSQL
echo 3. Chi khoi dong Backend
echo 4. Chi khoi dong Metro
echo 5. Cai va mo ung dung Android
echo 6. Kiem tra trang thai he thong
echo 7. Dung cac tien trinh do launcher khoi dong
echo 8. Mo tai lieu huong dan
echo 9. Thoat
echo ===============================================
set "CHOICE="
set /p "CHOICE=Nhap lua chon [1-9]: "

if "%CHOICE%"=="1" goto opt_start_all
if "%CHOICE%"=="2" goto opt_start_postgres
if "%CHOICE%"=="3" goto opt_start_backend
if "%CHOICE%"=="4" goto opt_start_metro
if "%CHOICE%"=="5" goto opt_start_android
if "%CHOICE%"=="6" goto opt_status
if "%CHOICE%"=="7" goto opt_safe_stop
if "%CHOICE%"=="8" goto opt_open_docs
if "%CHOICE%"=="9" goto opt_exit

echo Lua chon khong hop le. Vui long chon tu 1 den 9.
timeout /t 2 >nul 2>&1
goto menu

:: ==============================================================================
:: SUBROUTINE: Tool Discovery
:: ==============================================================================
:find_tools
set "DOCKER_BIN="
set "JAVA_BIN="
set "NODE_BIN="
set "NPM_CMD="
set "ADB_BIN="
set "EMULATOR_BIN="

:: 1. Discover Docker CLI
where docker >nul 2>&1
if !errorlevel! equ 0 (
    set "DOCKER_BIN=docker"
) else (
    if exist "%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin\docker.exe" (
        set "DOCKER_BIN=%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin\docker.exe"
    ) else if exist "C:\Program Files\Docker\Docker\resources\bin\docker.exe" (
        set "DOCKER_BIN=C:\Program Files\Docker\Docker\resources\bin\docker.exe"
    ) else if exist "C:\Program Files\Docker\Docker\resources\docker.exe" (
        set "DOCKER_BIN=C:\Program Files\Docker\Docker\resources\docker.exe"
    )
)

:: 2. Discover Java runtime
if exist "D:\Android\jbr\bin\java.exe" (
    set "JAVA_BIN=D:\Android\jbr\bin\java.exe"
) else (
    if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" (
        set "JAVA_BIN=%JAVA_HOME%\bin\java.exe"
    ) else (
        where java >nul 2>&1
        if !errorlevel! equ 0 set "JAVA_BIN=java"
    )
)

:: 3. Discover Node and npm
where node >nul 2>&1
if !errorlevel! equ 0 set "NODE_BIN=node"
where npm.cmd >nul 2>&1
if !errorlevel! equ 0 (
    set "NPM_CMD=npm.cmd"
) else (
    where npm >nul 2>&1
    if !errorlevel! equ 0 set "NPM_CMD=npm"
)

:: 4. Discover ADB
where adb >nul 2>&1
if !errorlevel! equ 0 (
    set "ADB_BIN=adb"
) else (
    if exist "D:\AndroidSDK\platform-tools\adb.exe" (
        set "ADB_BIN=D:\AndroidSDK\platform-tools\adb.exe"
    ) else if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
        set "ADB_BIN=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
    ) else if defined ANDROID_HOME if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
        set "ADB_BIN=%ANDROID_HOME%\platform-tools\adb.exe"
    )
)

:: 5. Discover Emulator
where emulator >nul 2>&1
if !errorlevel! equ 0 (
    set "EMULATOR_BIN=emulator"
) else (
    if exist "D:\AndroidSDK\emulator\emulator.exe" (
        set "EMULATOR_BIN=D:\AndroidSDK\emulator\emulator.exe"
    ) else if exist "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" (
        set "EMULATOR_BIN=%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe"
    ) else if defined ANDROID_HOME if exist "%ANDROID_HOME%\emulator\emulator.exe" (
        set "EMULATOR_BIN=%ANDROID_HOME%\emulator\emulator.exe"
    )
)

exit /b 0

:: ==============================================================================
:: ACTION: 2. Start PostgreSQL
:: ==============================================================================
:do_postgres
call :find_tools
call :exec_start_postgres
exit /b !errorlevel!

:opt_start_postgres
call :find_tools
call :exec_start_postgres
echo.
pause
goto menu

:exec_start_postgres
echo [1/4] Kiem tra va khoi dong PostgreSQL container...
if not defined DOCKER_BIN (
    echo [LOI] Khong tim thay Docker CLI tren may tinh.
    echo Vui long kiem tra Docker Desktop da cai dat tai thu muc mac dinh.
    exit /b 1
)

:: Check if container exists
"%DOCKER_BIN%" ps -a --filter "name=%POSTGRES_CONTAINER%" --format "{{.Names}}" | findstr /i "%POSTGRES_CONTAINER%" >nul 2>&1
if !errorlevel! neq 0 (
    echo [LOI] Container %POSTGRES_CONTAINER% khong ton tai.
    echo Vui long tham khao reports\runbooks\DOCKER_LOCAL_OPERATIONS.md de setup database canonical.
    exit /b 1
)

:: Check if already running
"%DOCKER_BIN%" ps --filter "name=%POSTGRES_CONTAINER%" --format "{{.Names}}" | findstr /i "%POSTGRES_CONTAINER%" >nul 2>&1
if !errorlevel! equ 0 (
    echo [INFO] PostgreSQL container %POSTGRES_CONTAINER% da o trang thai RUNNING.
) else (
    echo [INFO] Dang khoi dong container %POSTGRES_CONTAINER%...
    "%DOCKER_BIN%" start "%POSTGRES_CONTAINER%" >nul 2>&1
    if !errorlevel! neq 0 (
        echo [LOI] Khong the khoi dong container %POSTGRES_CONTAINER%. Kiem tra Docker Desktop engine.
        exit /b 1
    )
)

:: Poll pg_isready up to 10 seconds
echo [INFO] Kiem tra do san sang cua database...
set "PG_READY=0"
for /L %%i in (1,1,10) do (
    "%DOCKER_BIN%" exec "%POSTGRES_CONTAINER%" pg_isready -U postgres >nul 2>&1
    if !errorlevel! equ 0 (
        set "PG_READY=1"
        goto pg_ready_success
    )
    timeout /t 1 >nul 2>&1
)
:pg_ready_success
if "%PG_READY%"=="1" (
    echo [OK] PostgreSQL database da san sang tren cong 5432.
    exit /b 0
) else (
    echo [CANH BAO] PostgreSQL chua phan hoi pg_isready sau 10 giay.
    exit /b 1
)

:: ==============================================================================
:: ACTION: 3. Start Backend
:: ==============================================================================
:do_backend
call :find_tools
call :exec_start_backend
exit /b !errorlevel!

:opt_start_backend
call :find_tools
call :exec_start_backend
echo.
pause
goto menu

:exec_start_backend
echo [2/4] Kiem tra va khoi dong WorkSphere Backend...
:: 1. Check if backend already healthy on port 8080
curl.exe -s http://localhost:8080/actuator/health 2>nul | findstr /i "UP" >nul 2>&1
if !errorlevel! equ 0 (
    echo [INFO] WorkSphere Backend da dang hoat dong [Health: UP]. Khong khoi dong ban thu hai.
    exit /b 0
)

:: 2. Check if port 8080 is occupied by another process
netstat -ano | findstr /c:":8080 " | findstr /c:"LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [LOI] Cong 8080 dang bi chiem boi tien trinh khac khong phai WorkSphere Backend.
    echo Danh sach tien trinh dang nghe tren cong 8080:
    netstat -ano | findstr /c:":8080 " | findstr /c:"LISTENING"
    echo Vui long giai phong cong 8080 truoc khi tiep tuc.
    exit /b 1
)

:: 3. Check Java runtime
if not defined JAVA_BIN (
    echo [LOI] Khong tim thay Java runtime hop le.
    exit /b 1
)

:: 4. Check Backend JAR existence
set "BACKEND_JAR=%ROOT%\backend\target\backend-0.0.1-SNAPSHOT.jar"
if not exist "%BACKEND_JAR%" (
    echo [INFO] JAR backend chua ton tai. Dang bien dich bang Maven Wrapper...
    cd /d "%ROOT%\backend"
    call mvnw.cmd clean package -DskipTests
    cd /d "%ROOT%"
    if not exist "%BACKEND_JAR%" (
        echo [LOI] Bien dich Backend that bai. Vui long kiem tra logs bien dich.
        exit /b 1
    )
)

:: 5. Launch Backend in dedicated window
echo [INFO] Dang khoi dong Backend trong cua so rieng...
start "WorkSphere Backend" cmd /k "cd /d "%ROOT%" && set SPRING_PROFILES_ACTIVE=dev && "%JAVA_BIN%" -jar "%BACKEND_JAR%""

:: 6. Poll health endpoint up to 25 seconds
echo [INFO] Dang doi Backend khoi dong [toi da 25s]...
set "BACKEND_READY=0"
for /L %%i in (1,1,25) do (
    curl.exe -s http://localhost:8080/actuator/health 2>nul | findstr /i "UP" >nul 2>&1
    if !errorlevel! equ 0 (
        set "BACKEND_READY=1"
        goto backend_ready_success
    )
    timeout /t 1 >nul 2>&1
)
:backend_ready_success
if "%BACKEND_READY%"=="1" (
    echo [OK] WorkSphere Backend khoi dong thanh cong [Health: UP].
    exit /b 0
) else (
    echo [CANH BAO] Backend chua bao UP sau 25 giay. Vui long kiem tra cua so "WorkSphere Backend".
    exit /b 1
)

:: ==============================================================================
:: ACTION: 4. Start Metro
:: ==============================================================================
:do_metro
call :find_tools
call :exec_start_metro
exit /b !errorlevel!

:opt_start_metro
call :find_tools
call :exec_start_metro
echo.
pause
goto menu

:exec_start_metro
echo [3/4] Kiem tra va khoi dong Metro Bundler...
:: Check if port 8081 is listening
netstat -ano | findstr /c:":8081 " | findstr /c:"LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo [INFO] Metro Bundler da dang hoat dong tren cong 8081. Khong khoi dong ban thu hai.
    exit /b 0
)

if not defined NPM_CMD (
    echo [LOI] Khong tim thay Node/npm tren may tinh.
    exit /b 1
)

:: Check mobile node_modules
if not exist "%ROOT%\mobile\node_modules" (
    echo [INFO] Thuc hien cai dat npm dependencies cho mobile...
    cd /d "%ROOT%\mobile"
    call "%NPM_CMD%" ci
    cd /d "%ROOT%"
)

echo [INFO] Dang khoi dong Metro trong cua so rieng...
start "WorkSphere Metro" cmd /k "cd /d "%ROOT%\mobile" && "%NPM_CMD%" start"

:: Poll port 8081 up to 10 seconds
set "METRO_READY=0"
for /L %%i in (1,1,10) do (
    netstat -ano | findstr /c:":8081 " | findstr /c:"LISTENING" >nul 2>&1
    if !errorlevel! equ 0 (
        set "METRO_READY=1"
        goto metro_ready_success
    )
    timeout /t 1 >nul 2>&1
)
:metro_ready_success
if "%METRO_READY%"=="1" (
    echo [OK] Metro Bundler da san sang tren cong 8081.
    exit /b 0
) else (
    echo [INFO] Metro da duoc phat lenh khoi dong. Kiem tra cua so "WorkSphere Metro".
    exit /b 0
)

:: ==============================================================================
:: ACTION: 5. Start Android Emulator and App
:: ==============================================================================
:do_android
call :find_tools
call :exec_start_emulator
call :exec_start_android_app
exit /b !errorlevel!

:opt_start_android
call :find_tools
call :exec_start_emulator
call :exec_start_android_app
echo.
pause
goto menu

:exec_start_emulator
echo Kiem tra Android Emulator...
if not defined ADB_BIN (
    echo [LOI] Khong tim thay adb CLI tren he thong.
    exit /b 1
)

:: Check if device emulator already attached
"%ADB_BIN%" devices | findstr /r "emulator-.*device$" >nul 2>&1
if !errorlevel! equ 0 (
    echo [INFO] Android Emulator da o trang thai ket noi [device].
    exit /b 0
)

if not defined EMULATOR_BIN (
    echo [LOI] Khong tim thay emulator.exe tren he thong.
    exit /b 1
)

echo [INFO] Dang lay danh sach AVD...
set "TARGET_AVD="
for /f "tokens=*" %%a in ('"%EMULATOR_BIN%" -list-avds 2^>nul') do (
    if not defined TARGET_AVD set "TARGET_AVD=%%a"
)

if not defined TARGET_AVD (
    echo [LOI] Khong tim thay AVD nao duoc tao trong Android Studio.
    exit /b 1
)

echo [INFO] Khoi dong Android Emulator voi AVD: %TARGET_AVD%...
start "WorkSphere Android Emulator" "%EMULATOR_BIN%" -avd "%TARGET_AVD%"

echo [INFO] Dang doi Emulator khoi dong boot_completed...
"%ADB_BIN%" wait-for-device
for /L %%i in (1,1,30) do (
    for /f "tokens=*" %%s in ('"%ADB_BIN%" shell getprop sys.boot_completed 2^>nul') do (
        if "%%s"=="1" goto emulator_boot_done
    )
    timeout /t 2 >nul 2>&1
)
:emulator_boot_done
echo [OK] Android Emulator da san sang.
exit /b 0

:exec_start_android_app
echo [4/4] Cai dat va khoi chay ung dung Android...
if not defined NPM_CMD (
    echo [LOI] Khong tim thay npm.
    exit /b 1
)

:: Verify backend is accessible from host
curl.exe -s http://localhost:8080/actuator/health 2>nul | findstr /i "UP" >nul 2>&1
if !errorlevel! neq 0 (
    echo [CANH BAO] Backend chua bao UP. Ứng dung co the khong goi duoc API khi mo.
)

echo [INFO] Dang chay npm run android trong cua so rieng...
start "WorkSphere Android Build" cmd /k "cd /d "%ROOT%\mobile" && "%NPM_CMD%" run android"

echo [OK] Lenh build va mo ung dung Android da duoc phat di.
echo [Luu y]: Tai khoan va mat khau demo local duoc quan ly doc lap, khong nhung trong launcher nay.
exit /b 0

:: ==============================================================================
:: ACTION: 1. Start All Components
:: ==============================================================================
:do_all
call :find_tools
call :exec_start_all
exit /b 0

:opt_start_all
cls
call :find_tools
call :exec_start_all
echo.
pause
goto menu

:exec_start_all
echo ===============================================
echo     KHOI DONG TOAN BO HE THONG WORKSPHERE
echo ===============================================

:: Step 1: PostgreSQL
call :exec_start_postgres
if !errorlevel! equ 0 (set "STATUS_PG=RUNNING") else (set "STATUS_PG=FAILED")

:: Step 2: Backend
call :exec_start_backend
if !errorlevel! equ 0 (set "STATUS_BACKEND=HEALTHY") else (set "STATUS_BACKEND=FAILED")

:: Step 3: Emulator
call :exec_start_emulator
if !errorlevel! equ 0 (set "STATUS_EMU=READY") else (set "STATUS_EMU=FAILED")

:: Step 4: Metro
call :exec_start_metro
if !errorlevel! equ 0 (set "STATUS_METRO=RUNNING") else (set "STATUS_METRO=FAILED")

:: Step 5: Android App
call :exec_start_android_app
if !errorlevel! equ 0 (set "STATUS_APP=STARTED") else (set "STATUS_APP=FAILED")

echo.
echo ===============================================
echo WORKSPHERE START SUMMARY
echo PostgreSQL: %STATUS_PG%
echo Backend: %STATUS_BACKEND%
echo Metro: %STATUS_METRO%
echo Android Emulator: %STATUS_EMU%
echo Mobile App Launch: %STATUS_APP%
echo Backend URL: %BACKEND_URL%
echo Emulator API URL: %EMULATOR_API_URL%
echo ===============================================
exit /b 0

:: ==============================================================================
:: ACTION: 6. System Status Check
:: ==============================================================================
:do_status
call :find_tools
call :exec_status
exit /b 0

:opt_status
cls
call :find_tools
call :exec_status
echo.
pause
goto menu

:exec_status
echo ===============================================
echo        KIEM TRA TRANG THAI HE THONG
echo ===============================================

echo [1] CONG CU DONG LENH (CLI TOOLS):
if defined DOCKER_BIN (
    echo   - Docker CLI: TIM THAY [%DOCKER_BIN%]
) else (
    echo   - Docker CLI: CHUA TIM THAY
)
if defined JAVA_BIN (
    echo   - Java:       TIM THAY [%JAVA_BIN%]
) else (
    echo   - Java:       CHUA TIM THAY
)
if defined NODE_BIN (
    echo   - Node.js:    TIM THAY [%NODE_BIN%]
) else (
    echo   - Node.js:    CHUA TIM THAY
)
if defined NPM_CMD (
    echo   - npm:        TIM THAY [%NPM_CMD%]
) else (
    echo   - npm:        CHUA TIM THAY
)
if defined ADB_BIN (
    echo   - adb:        TIM THAY [%ADB_BIN%]
) else (
    echo   - adb:        CHUA TIM THAY
)
if defined EMULATOR_BIN (
    echo   - emulator:   TIM THAY [%EMULATOR_BIN%]
) else (
    echo   - emulator:   CHUA TIM THAY
)

echo.
echo [2] CO SO DU LIEU (POSTGRESQL):
if defined DOCKER_BIN (
    "%DOCKER_BIN%" ps --filter "name=%POSTGRES_CONTAINER%" --format "{{.Status}}" | findstr /i "Up" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   - Container %POSTGRES_CONTAINER%: RUNNING
        "%DOCKER_BIN%" exec "%POSTGRES_CONTAINER%" pg_isready -U postgres >nul 2>&1
        if !errorlevel! equ 0 (
            echo   - Database pg_isready: READY [Port 5432]
        ) else (
            echo   - Database pg_isready: NOT_READY
        )
    ) else (
        echo   - Container %POSTGRES_CONTAINER%: STOPPED / NOT_RUNNING
    )
) else (
    echo   - Khong the kiem tra Docker container vi thieu Docker CLI.
)

echo.
echo [3] BACKEND SERVICE (PORT 8080):
netstat -ano | findstr /c:":8080 " | findstr /c:"LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo   - Port 8080: LISTENING
    curl.exe -s http://localhost:8080/actuator/health 2>nul | findstr /i "UP" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   - Actuator Health: UP [WorkSphere Backend]
    ) else (
        echo   - Actuator Health: UNKNOWN / OTHER_PROCESS
    )
) else (
    echo   - Port 8080: NOT_LISTENING [Backend chua chay]
)

echo.
echo [4] METRO BUNDLER (PORT 8081):
netstat -ano | findstr /c:":8081 " | findstr /c:"LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo   - Port 8081: LISTENING [Metro Bundler dang chay]
) else (
    echo   - Port 8081: NOT_LISTENING [Metro chua chay]
)

echo.
echo [5] ANDROID EMULATOR VA DEVICE:
if defined ADB_BIN (
    echo   - Danh sach thiet bi ket noi:
    "%ADB_BIN%" devices
    "%ADB_BIN%" shell pm list packages 2>nul | findstr /i "%PACKAGE_NAME%" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   - Goi ung dung %PACKAGE_NAME%: DA CAI DAT
    ) else (
        echo   - Goi ung dung %PACKAGE_NAME%: CHUA CAI DAT HOAC EMULATOR CHUA MO
    )
) else (
    echo   - Khong the kiem tra thiet bi vi thieu adb.
)

echo.
echo [6] GIT REPOSITORY:
git -C "%ROOT%" branch --show-current 2>nul
echo ===============================================
exit /b 0

:: ==============================================================================
:: ACTION: 7. Safe Stop (Only managed components)
:: ==============================================================================
:do_stop
call :find_tools
call :exec_safe_stop
exit /b 0

:opt_safe_stop
cls
call :find_tools
call :exec_safe_stop
echo.
pause
goto menu

:exec_safe_stop
echo ===============================================
echo           DUNG TIEN TRINH AN TOAN
echo ===============================================
echo [Nguyen tac an toan]:
echo Launcher KHONG dung taskkill broad-kill toan bo java.exe hay node.exe.
echo.
echo De dung Backend hoac Metro:
echo - Vui long chuyen sang cua so "WorkSphere Backend" va nhan Ctrl+C.
echo - Vui long chuyen sang cua so "WorkSphere Metro" va nhan Ctrl+C.
echo.

if defined DOCKER_BIN (
    set "STOP_PG_CHOICE=N"
    set /p "STOP_PG_CHOICE=Ban co muon dung container PostgreSQL (%POSTGRES_CONTAINER%) khong? [Y/N] (Mac dinh: N): "
    if /i "!STOP_PG_CHOICE!"=="Y" (
        echo Dang dung %POSTGRES_CONTAINER% [bao toan du lieu Named Volume]...
        "%DOCKER_BIN%" stop "%POSTGRES_CONTAINER%" >nul 2>&1
        echo [OK] Da dung container %POSTGRES_CONTAINER%.
    ) else (
        echo [INFO] Giu nguyen container %POSTGRES_CONTAINER%.
    )
)

if defined ADB_BIN (
    set "STOP_EMU_CHOICE=N"
    set /p "STOP_EMU_CHOICE=Ban co muon dong Android Emulator khong? [Y/N] (Mac dinh: N): "
    if /i "!STOP_EMU_CHOICE!"=="Y" (
        echo Dang gui tin hieu tat emulator...
        "%ADB_BIN%" -s "%EMULATOR_DEVICE%" emu kill >nul 2>&1
        echo [OK] Da gui tin hieu tat emulator.
    ) else (
        echo [INFO] Giu nguyen Android Emulator.
    )
)

echo ===============================================
exit /b 0

:: ==============================================================================
:: ACTION: 8. Open Documentation
:: ==============================================================================
:do_docs
call :exec_open_docs
exit /b 0

:opt_open_docs
cls
call :exec_open_docs
goto menu

:exec_open_docs
echo Dang mo tai lieu huong dan: reports\WORKSPHERE_PROJECT_OVERVIEW_AND_RUN_GUIDE.md...
set "DOC_FILE=%ROOT%\reports\WORKSPHERE_PROJECT_OVERVIEW_AND_RUN_GUIDE.md"
where code >nul 2>&1
if !errorlevel! equ 0 (
    code "%DOC_FILE%"
) else (
    start "" notepad "%DOC_FILE%"
)
exit /b 0

:: ==============================================================================
:: ACTION: 9. Exit
:: ==============================================================================
:opt_exit
echo Tam biet!
exit /b 0
