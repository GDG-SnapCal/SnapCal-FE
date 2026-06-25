# SnapCal

AI가 사진을 자동 분류하고 날짜별로 캘린더에 기록해주는 사진 다이어리 앱입니다.

🔗 **배포 URL**: [https://snap-cal-fe-two.vercel.app](https://snap-cal-fe-two.vercel.app)

---

## 주요 기능

- **AI 자동 분류** — 사진 업로드 시 AI가 음식, 패션, 운동, 풍경, 일상 카테고리로 자동 분류
- **중복 사진 선별** — 비슷한 사진을 묶어 대표 사진을 직접 선택
- **카테고리 캘린더** — 월별 캘린더에서 카테고리별 대표 사진 확인
- **사진 편집** — 텍스트 추가, 필터 적용 후 캘린더에 업로드
- **대표 사진 변경** — 날짜별 캘린더 표지 사진을 원하는 사진으로 변경
- **캘린더 공유** — 월별 캘린더를 이미지로 저장 (1:1 / 4:5 / 9:16 비율)

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| 상태관리 | Zustand |
| 라우팅 | React Router v7 |
| HTTP | Axios |
| DnD | @dnd-kit/core |
| 배포 | Vercel |
| 백엔드 | Spring Boot (Railway) |

---

## 로컬 실행

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

### 환경변수

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_API_BASE_URL=http://localhost:8080
```

> 배포 환경에서는 Vercel의 `/api/*` 경로가 Railway 백엔드로 프록시됩니다.

---

## 폴더 구조

```
src/
├── api/          # Axios API 호출
├── components/   # 공통 컴포넌트
├── pages/        # 페이지 컴포넌트
├── stores/       # Zustand 상태 관리
├── types/        # TypeScript 타입 정의
└── lib/          # Axios 인스턴스 등 유틸
```

---

## 브랜치 전략

- `main` — 배포 브랜치 (Vercel 자동 배포)
- `develop` — 개발 브랜치
