# Agent Prompt Manager - 사용 가이드

## 빠른 시작

### 1. Docker Compose로 실행 (권장)

```bash
# Docker Compose로 전체 애플리케이션 실행
docker-compose up -d

# 접속
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
```

### 2. 로컬 개발 환경에서 실행

#### Backend 실행
```bash
cd backend
npm install
npm run dev
# API 서버가 http://localhost:3000 에서 실행됩니다
```

#### Frontend 실행 (별도 터미널)
```bash
cd frontend
npm install
npm run dev
# 웹 앱이 http://localhost:5173 에서 실행됩니다
```

## 주요 기능

### 1. 프롬프트 편집
- 좌측 사이드바의 "Prompts" 탭에서 프롬프트 파일 목록을 확인할 수 있습니다
- 파일을 클릭하면 편집기가 열립니다
- 편집 후 "Save" 버튼을 클릭하면 저장됩니다
- 저장 시 자동으로 이력이 생성됩니다

### 2. 이력 확인
- 좌측 사이드바의 "History" 탭을 클릭합니다
- 폴더 구조로 프롬프트별 이력이 표시됩니다
- 폴더를 클릭하면 확장/축소됩니다
- 이력 파일을 클릭하면 내용을 확인할 수 있습니다 (읽기 전용)
- "Copy" 버튼으로 이력 내용을 복사할 수 있습니다

### 3. 이력 파일 명명 규칙
```
history/
  └── sample-agent.md/
      ├── sample-agent-2025-01-28-14-30-22.md
      ├── sample-agent-2025-01-28-10-20-15.md
      └── sample-agent-2025-01-27-15-30-45.md
```

파일명 형식: `{프롬프트명}-{YYYY-MM-DD-HH-MM-SS}.{확장자}`

## Docker 설정

### 환경변수 커스터마이징

`docker-compose.yml` 파일에서 설정을 변경할 수 있습니다:

```yaml
services:
  backend:
    environment:
      - PORT=3000              # API 서버 포트
      - PROMPTS_DIR=/app/prompts
      - HISTORY_DIR=/app/history
    ports:
      - "3000:3000"           # 호스트:컨테이너

  frontend:
    build:
      args:
        - VITE_API_URL=http://localhost:3000  # API 서버 주소
    ports:
      - "5173:80"             # 호스트:컨테이너
```

### 볼륨 매핑

프롬프트 파일과 이력은 호스트 시스템에 저장됩니다:

```yaml
volumes:
  - ./prompts:/app/prompts   # 프롬프트 폴더
  - ./history:/app/history   # 이력 폴더
```

## 서버 환경 배포

서버 환경에서 실행 시 `docker-compose.yml`의 API URL을 서버 IP로 변경하세요:

```yaml
frontend:
  build:
    args:
      - VITE_API_URL=http://YOUR_SERVER_IP:3000
```

또는 외부 설정 파일을 사용할 수 있습니다:

```bash
# .env 파일 생성
echo "VITE_API_URL=http://192.168.1.100:3000" > frontend/.env

# Docker Compose 실행
docker-compose up -d
```

## 문제 해결

### 포트가 이미 사용 중인 경우
```bash
# docker-compose.yml에서 포트 변경
ports:
  - "8080:3000"  # Backend
  - "8081:80"    # Frontend
```

### API 연결 오류
1. Backend 컨테이너가 실행 중인지 확인
   ```bash
   docker-compose ps
   ```

2. API URL이 올바른지 확인
   ```bash
   curl http://localhost:3000/health
   ```

3. CORS 설정 확인 (Backend는 모든 origin을 허용하도록 설정됨)

### 프롬프트 파일이 표시되지 않는 경우
1. `prompts/` 폴더에 `.txt` 또는 `.md` 파일이 있는지 확인
2. Backend 로그 확인
   ```bash
   docker-compose logs backend
   ```

## 개발 팁

### Hot Reload
로컬 개발 시 코드 변경사항이 자동으로 반영됩니다.

### API 테스트
```bash
# 프롬프트 목록 조회
curl http://localhost:3000/api/prompts

# 특정 프롬프트 조회
curl http://localhost:3000/api/prompts/sample-agent.md

# 이력 트리 조회
curl http://localhost:3000/api/prompts/history/tree
```

## 라이선스

MIT
