# SnapCal 프론트엔드 기능 구현 명세

> Figma 와이어프레임 기반 기능 구현 가이드  
> Figma: `rZ1zUJog21JnxxmlwwpLsD` / 페이지: 와이어프레임

---

## 목차

1. [화면 구성 개요](#1-화면-구성-개요)
2. [화면별 기능 명세](#2-화면별-기능-명세)
   - [초기화면 (로그인)](#21-초기화면-로그인)
   - [회원가입](#22-회원가입)
   - [메인화면 (캘린더)](#23-메인화면-캘린더)
   - [업로드화면](#24-업로드화면)
   - [업로드화면 사진선택](#25-업로드화면-사진선택)
   - [AI 중복사진 선택](#26-ai-중복사진-선택)
   - [AI 분류 결과](#27-ai-분류-결과)
   - [업로드 이미지 편집](#28-업로드-이미지-편집)
   - [공유](#29-공유)
3. [공통 컴포넌트](#3-공통-컴포넌트)
4. [화면 전환 플로우](#4-화면-전환-플로우)
5. [상태 관리 구조](#5-상태-관리-구조)
6. [API 연동 포인트](#6-api-연동-포인트)

---

## 1. 화면 구성 개요

| 화면 | Figma Node | 섹션 | 설명 |
|------|-----------|------|------|
| 초기화면 (로그인) | `9:2` | Section 1 | 이메일/소셜 로그인 |
| 메인화면 (캘린더) | `12:25` | Section 1 | 사진 캘린더 뷰 |
| 업로드화면 | `14:171` | Section 1 | 사진 선택 전 빈 화면 |
| 업로드화면 [사진선택] | `14:205` | Section 1 | 갤러리에서 사진 선택 후 |
| AI 중복사진 선택 | `29:20` | Section 1 | AI 유사 사진 그룹핑 및 대표 선택 |
| AI 분류 결과 | `64:86` | Section 1 | AI 카테고리 자동 분류 확인 |
| 회원가입 | `29:3` | Section 2 | 이메일/소셜 회원가입 |
| 업로드 이미지 편집 | `43:51` | Section 2 | 사진 AI 편집 (밝기·필터 등) |
| 공유 | `43:76` | Section 2 | 캘린더 SNS/링크 공유 |

---

## 2. 화면별 기능 명세

### 2.1 초기화면 (로그인)

**Figma Node:** `9:2`

#### 레이아웃 구성요소
- 로고 이미지 (상단 중앙)
- 서비스 이름 텍스트
- 서비스 설명 텍스트

#### 기능 구현 항목

| 컴포넌트 | 기능 | 상세 |
|---------|------|------|
| Email 입력 필드 | 이메일 형식 유효성 검사 | `@`, 도메인 형식 실시간 검증 |
| Password 입력 필드 | 비밀번호 입력 마스킹 | 눈 아이콘으로 표시/숨김 토글 |
| 로그인 버튼 | 이메일 로그인 요청 | 빈 값 시 버튼 비활성화 |
| 소셜계정으로 로그인 버튼 | OAuth 소셜 로그인 | 카카오/구글 등 OAuth 플로우 |
| 비밀번호 찾기 링크 | 비밀번호 재설정 화면 이동 | (별도 화면 필요 시 추가) |
| 계정이 없으신가요? 회원가입 | 회원가입 화면으로 이동 | → `회원가입` 화면 |

#### 상태
```
- email: string
- password: string
- isLoading: boolean
- errorMessage: string | null
```

#### 유효성 검사 규칙
- 이메일: 비어있지 않음 + 이메일 형식
- 비밀번호: 비어있지 않음
- 실패 시 인라인 에러 메시지 표시

---

### 2.2 회원가입

**Figma Node:** `29:3`

#### 레이아웃 구성요소
- 로고 + 서비스 이름
- "회원가입" 타이틀

#### 기능 구현 항목

| 컴포넌트 | 기능 | 상세 |
|---------|------|------|
| 이름 입력 필드 | 이름 입력 | 최소 2자 이상 |
| Email 입력 필드 | 이메일 형식 유효성 검사 | 중복 이메일 서버 검증 |
| Password 입력 필드 | 비밀번호 강도 표시 | 8자 이상, 특수문자 포함 권장 |
| 비밀번호 확인 필드 | 비밀번호 일치 여부 실시간 검증 | 불일치 시 에러 표시 |
| 회원가입 버튼 | 회원가입 요청 | 모든 필드 유효 시 활성화 |
| 소셜계정으로 가입 버튼 | OAuth 소셜 회원가입 | |
| 이미 계정이 있으신가요? 로그인 | 로그인 화면으로 이동 | → `초기화면` |

#### 상태
```
- name: string
- email: string
- password: string
- passwordConfirm: string
- isLoading: boolean
- fieldErrors: { name?, email?, password?, passwordConfirm? }
```

---

### 2.3 메인화면 (캘린더)

**Figma Node:** `12:25`

#### 레이아웃 구성요소
- 상단 헤더: 로고
- 월 네비게이션: 이전/다음 화살표 + "N월 캘린더" 텍스트
- 카테고리 필터 탭 (수평 스크롤)
- 요일 헤더: SUN MON TUE WED THU FRI SAT
- 캘린더 그리드: 주 단위 행 (4~6행) × 7열, 각 셀에 사진 표시
- 하단 네비게이션 바: 아이콘 3개

#### 기능 구현 항목

| 컴포넌트 | 기능 | 상세 |
|---------|------|------|
| 월 네비게이션 | 이전/다음 달로 이동 | 월 변경 시 해당 월 데이터 재요청 |
| 카테고리 탭 | 카테고리별 사진 필터링 | 탭 선택 시 해당 카테고리만 캘린더에 표시, 다중 선택 가능 여부 확인 필요 |
| 캘린더 셀 (날짜) | 해당 날짜 사진 표시 | 사진이 있는 날짜는 사진 썸네일, 없는 날짜는 빈 셀 |
| 캘린더 셀 탭 | 날짜 상세 / 사진 상세 진입 | 단일 사진: 상세 뷰, 복수 사진: 목록 뷰 |
| 하단 네비게이션 - 캘린더 | 메인 캘린더 화면 | 현재 화면 |
| 하단 네비게이션 - 업로드 | 업로드 화면 이동 | → `업로드화면` |
| 하단 네비게이션 - 프로필 | 프로필/설정 화면 이동 | (별도 화면) |

#### 카테고리 탭
- 최대 5개 카테고리 표시 (카테고리1~5)
- 가로 스크롤 지원
- 선택된 탭 활성화 스타일 표시
- "전체" 탭 기본 선택 상태

#### 캘린더 그리드
- 해당 월의 첫날 요일에 맞춰 시작
- 각 셀: 날짜 숫자 + 사진 썸네일 (있을 경우)
- 오늘 날짜 강조 표시
- 사진이 여러 장인 경우 대표 사진 1장 표시 + 장수 뱃지

#### 상태
```
- currentYear: number
- currentMonth: number
- selectedCategory: string | 'all'
- calendarPhotos: { [dateKey: string]: Photo[] }
- isLoading: boolean
```

---

### 2.4 업로드화면

**Figma Node:** `14:171`

#### 레이아웃 구성요소
- 상단 헤더: 뒤로가기 버튼 + "사진업로드" 타이틀
- 사진 선택 영역 (빈 상태 / 점선 박스)
- "사진선택" 텍스트 버튼

#### 기능 구현 항목
 
| 컴포넌트 | 기능 | 상세 |
|---------|------|------|
| 뒤로가기 버튼 | 이전 화면으로 이동 | |
| 사진 선택 영역 / "사진선택" 버튼 | 갤러리 접근 | 기기 갤러리 열기, 다중 선택 허용 |
| 갤러리 권한 요청 | 사진 접근 권한 | 거부 시 안내 메시지 + 설정 이동 링크 |

#### 화면 전환
- 사진 선택 완료 → `업로드화면 [사진선택]` 으로 이동 (선택한 사진 데이터 전달)

---

### 2.5 업로드화면 [사진선택]

**Figma Node:** `14:205`

#### 레이아웃 구성요소
- 상단 헤더: 뒤로가기 버튼 + "사진업로드" 타이틀
- 사진 미리보기 영역 (선택한 사진 그리드, 3열)
- 하단 "AI 카테고리 분류" 버튼

#### 기능 구현 항목

| 컴포넌트 | 기능 | 상세 |
|---------|------|------|
| 뒤로가기 버튼 | 업로드화면으로 돌아가기 | 선택 사진 초기화 |
| 사진 그리드 | 선택한 사진 미리보기 | 3열 그리드, 각 썸네일에 삭제(X) 버튼 |
| 사진 추가 | 갤러리 재접근 | 그리드 마지막에 "+" 버튼으로 사진 추가 |
| 사진 삭제 | 선택 사진 제거 | 썸네일 X 버튼 탭 |
| AI 카테고리 분류 버튼 | AI 분석 요청 시작 | 로딩 인디케이터 표시 후 → `AI 중복사진 선택` 또는 `AI 분류 결과` |

#### 업로드 플로우
1. 버튼 탭 → 서버에 사진 업로드
2. 서버에서 중복(유사) 사진 감지
   - 중복 있음 → `AI 중복사진 선택` 화면
   - 중복 없음 → `AI 분류 결과` 화면

#### 상태
```
- selectedPhotos: File[]
- isUploading: boolean
- uploadProgress: number (0~100)
```

---

### 2.6 AI 중복사진 선택

**Figma Node:** `29:20`

#### 레이아웃 구성요소
- 상단 헤더: 뒤로가기 + "중복 사진 검토" 타이틀
- 안내 배너: "AI가 비슷한 사진을 발견했어요! / 대표 사진을 선택해 주세요"
- 유사 사진 그룹 목록 (스크롤)
  - 그룹별 날짜 + 유사 사진 수 텍스트
  - 썸네일 행 (최대 3장), 각 썸네일에 체크박스
- AI 추천 배너: "AI 추천: 첫 번째 사진이 가장 선명해요"
- 하단 "선택 완료" 버튼

#### 기능 구현 항목

| 컴포넌트 | 기능 | 상세 |
|---------|------|------|
| 유사 사진 그룹 | 그룹별 대표 사진 1장 선택 | 같은 그룹 내 단일 선택 (라디오 동작) |
| 체크박스 | 선택/해제 토글 | 선택된 사진에 체크(✓) 표시 |
| AI 추천 표시 | AI 추천 사진 강조 | 추천 사진에 배지 또는 배너로 안내 |
| 선택 완료 버튼 | 선택 결과 확정 | 모든 그룹에서 최소 1장 선택 필수, → `AI 분류 결과` |

#### 상태
```
- duplicateGroups: {
    groupId: string,
    datetime: string,
    photos: Photo[],
    selectedPhotoId: string | null,
    aiRecommendedPhotoId: string
  }[]
- isSubmitting: boolean
```

#### 유효성
- 모든 그룹에서 대표 사진이 선택되어야 "선택 완료" 버튼 활성화

---

### 2.7 AI 분류 결과

**Figma Node:** `64:86`

#### 레이아웃 구성요소
- 상단 헤더: 뒤로가기 + "AI 분류 결과" 타이틀
- 안내 배너: "AI가 카테고리를 분류했어요!!"
- 카테고리별 섹션 목록 (스크롤)
  - 카테고리명 (예: 음식, 패션, 미분류)
  - 해당 카테고리 사진 썸네일 행, 체크박스
- 하단 "캘린더 저장" 버튼

#### 기능 구현 항목

| 컴포넌트 | 기능 | 상세 |
|---------|------|------|
| 카테고리 섹션 | 카테고리별 사진 그룹 표시 | AI 분류 결과를 카테고리별로 묶어 표시 |
| 카테고리 수정 | 개별 사진 카테고리 변경 | 썸네일 탭 → 카테고리 선택 드롭다운 |
| 체크박스 | 사진 선택/해제 | 저장에서 제외할 사진 선택 해제 가능 |
| 미분류 섹션 | 미분류 사진 별도 표시 | 사용자가 직접 카테고리 지정 유도 |
| 캘린더 저장 버튼 | 최종 저장 요청 | 선택된 사진만 캘린더에 저장, → `메인화면` |

#### 상태
```
- classifiedPhotos: {
    category: string,
    photos: { photo: Photo, isSelected: boolean, assignedCategory: string }[]
  }[]
- isSaving: boolean
```

---

### 2.8 업로드 이미지 편집

**Figma Node:** `43:51`

#### 레이아웃 구성요소
- 상단 헤더: 뒤로가기 + "업로드 이미지 편집" 타이틀 + 우측 "저장" 버튼
- 이미지 미리보기 영역 (편집 결과 실시간 반영)
- "미리보기" 라벨
- 하단 AI 편집 옵션 패널
  - 밝기 / 배경 흐림 / 필터 / 텍스트
- 상세 수정 UI 패널 (선택된 옵션에 따라 표시)

#### 기능 구현 항목

| 컴포넌트 | 기능 | 상세 |
|---------|------|------|
| 이미지 미리보기 | 편집 결과 실시간 렌더링 | 옵션 변경 시 즉시 반영 |
| 밝기 버튼 | 밝기 조절 슬라이더 표시 | 범위: -100 ~ +100 |
| 배경 흐림 버튼 | 배경 블러 강도 조절 | AI 피사체 분리 후 배경만 블러 |
| 필터 버튼 | 프리셋 필터 목록 표시 | 필터 썸네일 가로 스크롤 |
| 텍스트 버튼 | 텍스트 추가 모드 | 텍스트 입력, 폰트/크기/색상 선택 |
| 저장 버튼 | 편집 결과 저장 | 편집된 이미지 서버 업로드 후 이전 플로우 복귀 |
| 뒤로가기 버튼 | 편집 취소 | 변경사항 있을 시 확인 다이얼로그 표시 |

#### 상태
```
- originalImage: string (URL)
- editOptions: {
    brightness: number,
    blur: number,
    filter: string | null,
    textLayers: { text: string, x: number, y: number, style: TextStyle }[]
  }
- activeEditMode: 'brightness' | 'blur' | 'filter' | 'text' | null
- isSaving: boolean
```

---

### 2.9 공유

**Figma Node:** `43:76`

#### 레이아웃 구성요소
- 상단 헤더: 뒤로가기 + "캘린더 공유" 타이틀
- 캘린더 미리보기 영역
- "캘린더 미리보기" 라벨
- 하단 공유 옵션 패널
  - "공유하기" 타이틀 + "비율 선택" 옵션
  - 인스타 / 카카오 / 링크 / 사진 저장

#### 기능 구현 항목

| 컴포넌트 | 기능 | 상세 |
|---------|------|------|
| 캘린더 미리보기 | 공유될 캘린더 이미지 미리보기 | 선택된 비율에 따라 미리보기 업데이트 |
| 비율 선택 | 공유 이미지 비율 선택 | 1:1 (인스타 정방형), 4:5 (인스타 세로), 16:9 (가로) 등 |
| 인스타 버튼 | 인스타그램 공유 | 이미지 생성 후 인스타 앱으로 공유 |
| 카카오 버튼 | 카카오톡 공유 | 카카오 SDK로 공유 |
| 링크 버튼 | 공유 링크 생성 및 클립보드 복사 | "링크가 복사되었습니다" 토스트 표시 |
| 사진 저장 버튼 | 기기 갤러리에 이미지 저장 | 저장 권한 요청 후 저장, "저장되었습니다" 토스트 |

#### 상태
```
- selectedRatio: '1:1' | '4:5' | '16:9'
- calendarImageUrl: string
- isGenerating: boolean
- shareStatus: 'idle' | 'generating' | 'success' | 'error'
```

---

## 3. 공통 컴포넌트

### 3.1 상단 헤더 (AppBar)
```
Props:
- title: string
- showBackButton: boolean
- rightAction?: ReactNode
```
- 뒤로가기: 이전 화면으로 네비게이션 스택 pop
- 타이틀: 화면 중앙 정렬

### 3.2 하단 네비게이션 바 (BottomNavBar)
- 캘린더 아이콘 → 메인화면
- 업로드 아이콘 → 업로드화면
- 프로필 아이콘 → 프로필/설정
- 현재 화면 아이콘 활성화 표시

### 3.3 사진 썸네일 (PhotoThumbnail)
```
Props:
- uri: string
- size: number
- showCheckbox?: boolean
- isSelected?: boolean
- onSelect?: () => void
- badge?: number (사진 장수 뱃지)
```

### 3.4 입력 필드 (InputField)
```
Props:
- label: string
- value: string
- onChange: (v: string) => void
- type: 'text' | 'email' | 'password'
- errorMessage?: string
- placeholder?: string
```

### 3.5 기본 버튼 (Button)
```
Props:
- label: string
- onPress: () => void
- variant: 'primary' | 'secondary' | 'outline'
- disabled?: boolean
- isLoading?: boolean
```

### 3.6 AI 안내 배너 (AIInfoBanner)
```
Props:
- message: string
- subMessage?: string
- type: 'info' | 'recommendation'
```

### 3.7 토스트 메시지 (Toast)
- 하단에서 슬라이드업 등장, 2초 후 자동 소멸
- 성공/실패/정보 타입 지원

---

## 4. 화면 전환 플로우

```
초기화면 (로그인)
├── [로그인 성공] → 메인화면
├── [회원가입 링크] → 회원가입
│   └── [가입 성공] → 초기화면 or 메인화면
└── [비밀번호 찾기] → 비밀번호 찾기 (미설계)

메인화면 (캘린더)
├── [하단 업로드 탭] → 업로드화면
│   └── [사진선택 완료] → 업로드화면 [사진선택]
│       └── [AI 카테고리 분류 버튼]
│           ├── [중복 사진 있음] → AI 중복사진 선택
│           │   └── [선택 완료] → AI 분류 결과
│           └── [중복 사진 없음] → AI 분류 결과
│               └── [캘린더 저장] → 메인화면
└── [캘린더 셀 탭] → 사진 상세 뷰 (미설계)
    └── [편집 버튼] → 업로드 이미지 편집
        └── [저장] → 이전 화면 복귀

공유 (캘린더 공유)
└── [공유 옵션 선택] → 각 플랫폼 공유 처리
```

---

## 5. 상태 관리 구조

### 전역 상태 (Global State)
```
AuthStore
- user: User | null
- accessToken: string | null
- isAuthenticated: boolean
- login(email, password): Promise
- loginWithSocial(provider): Promise
- logout(): void

CalendarStore
- currentYear: number
- currentMonth: number
- selectedCategory: string
- calendarData: { [dateKey: string]: Photo[] }
- fetchCalendar(year, month, category): Promise

UploadStore
- selectedPhotos: File[]
- uploadedPhotos: Photo[]
- duplicateGroups: DuplicateGroup[]
- classifiedPhotos: ClassifiedPhoto[]
- uploadPhotos(): Promise
- submitDuplicateSelection(selections): Promise
- saveToCalendar(photos): Promise
- reset(): void
```

### 로컬 상태 (Component State)
- 각 입력 필드 값
- 편집 옵션 (밝기, 필터 등)
- 로딩 인디케이터
- 에러 메시지

---

## 6. API 명세 (요청/응답 필드 포함)

> - 모든 요청 헤더: `Authorization: Bearer {accessToken}`
> - 모든 응답은 `{ success: boolean, data: {...}, error?: string }` 래퍼 구조
> - 날짜/시간: ISO 8601 형식 (`"2024-05-10T15:22:00Z"`)

---

### 6.1 인증

#### POST `/auth/login` — 이메일 로그인
```json
// 요청
{
  "email": "user@example.com",
  "password": "string"
}

// 응답 200
{
  "accessToken": "string",
  "user": {
    "userId": "string",
    "name": "string",
    "email": "string",
    "profileImageUrl": "string | null"
  }
}
// refreshToken은 HttpOnly Cookie로 자동 설정됨 (응답 body에 없음)

// 응답 401
{ "error": "이메일 또는 비밀번호가 올바르지 않습니다." }
```

#### POST `/auth/social` — 소셜 로그인/가입
```json
// 요청
{
  "provider": "kakao" | "google",
  "accessToken": "string"   // 클라이언트에서 소셜 SDK로 받은 토큰
}

// 응답 200
{
  "accessToken": "string",
  "user": {
    "userId": "string",
    "name": "string",
    "email": "string",
    "profileImageUrl": "string | null"
  },
  "isNewUser": true | false   // 신규 가입 여부 (온보딩 분기에 사용), 신규일 때만 true
}
// refreshToken은 HttpOnly Cookie로 자동 설정됨 (응답 body에 없음)
```

#### POST `/auth/signup` — 이메일 회원가입
```json
// 요청
{
  "name": "string",           // 최소 2자
  "email": "string",
  "password": "string"        // 최소 8자
}

// 응답 201
{
  "accessToken": "string",
  "user": {
    "userId": "string",
    "name": "string",
    "email": "string",
    "profileImageUrl": null
  }
}
// refreshToken은 HttpOnly Cookie로 자동 설정됨 (응답 body에 없음)

// 응답 409
{ "error": "이미 사용 중인 이메일입니다." }
```

#### POST `/auth/refresh` — 토큰 갱신
```json
// 요청: body 없음 (Cookie의 refreshToken을 자동으로 읽음)

// 응답 200
{ "accessToken": "string" }
```

---

### 6.2 사진 업로드 및 AI 분석

#### POST `/photos/upload` — 사진 업로드 + AI 분석 시작

> `Content-Type: multipart/form-data`

```
// 요청 필드 (form-data)
photos      File[]    // 이미지 파일 (jpeg, png, heic)
```

```json
// 응답 200 — 분석 완료 (동기 처리 시)
{
  "uploadId": "string",
  "status": "done",
  "duplicateGroups": [
    {
      "groupId": "string",
      "takenAt": "2024-05-10T15:22:00Z",   // 그룹 대표 촬영 시각
      "photos": [
        {
          "photoId": "string",
          "url": "string",                  // 썸네일 URL
          "takenAt": "2024-05-10T15:22:00Z"
        }
      ],
      "aiRecommendedPhotoId": "string"      // AI 추천 대표 사진 ID
    }
  ],
  "classifications": [
    {
      "photoId": "string",
      "url": "string",
      "takenAt": "2024-05-10T15:22:00Z",   // EXIF 촬영일 (캘린더 날짜로 사용)
      "category": "음식" | "패션" | "운동" | "풍경" | "일상" | "미분류"
    }
  ]
}

// 응답 202 — 분석 중 (비동기 처리 시, 폴링 사용)
{
  "uploadId": "string",
  "status": "processing"
}
```

> **폴링이 필요한 경우:** 2~3초 간격으로 아래 엔드포인트 호출

#### GET `/photos/upload/:uploadId/status` — 분석 상태 확인 (폴링용)
```json
// 응답 — 분석 중
{ "status": "processing" }

// 응답 — 분석 완료
{
  "status": "done",
  "duplicateGroups": [ ... ],   // 위와 동일 구조
  "classifications": [ ... ]
}

// 응답 — 실패
{ "status": "error", "error": "string" }
```

---

### 6.3 AI 중복사진 선택 제출

#### POST `/photos/duplicates/select` — 대표 사진 선택 제출
```json
// 요청
{
  "uploadId": "string",
  "selections": [
    {
      "groupId": "string",
      "selectedPhotoId": "string",
      "unselectedPhotoIds": ["string"]   // 삭제할 사진 ID 목록 (그룹 내 나머지)
    }
  ]
}

// 응답 200
{ "message": "선택이 완료되었습니다." }
```

> 이 API 호출 후 프론트는 `classifications` 데이터를 이미 갖고 있으므로
> AI 분류 결과 화면으로 바로 이동 (추가 요청 불필요)

---

### 6.3-1 카테고리 수동 변경

#### PATCH `/photos/{photoId}/category` — 카테고리 변경
```json
// 요청
{ "categoryId": 1 }   // GET /api/categories로 조회한 카테고리 ID

// 응답 200
{ "data": null }
```

> AI 분류 결과 화면에서 드래그로 카테고리 변경 시 호출.
> `GET /api/categories`로 카테고리명 → ID 매핑 후 사용.

---

### 6.4 캘린더 저장

#### POST `/calendar/save` — 사진 캘린더 저장
```json
// 요청
{ "uploadId": "string" }

// 응답 200
{ "message": "캘린더에 저장되었습니다." }
```

> `uploadId`에 속한 PENDING 사진을 CONFIRMED로 전환.
> 카테고리 변경은 저장 전 `PATCH /photos/{photoId}/category`로 별도 처리.

---

### 6.5 캘린더 조회

#### GET `/calendar` — 월별 캘린더 데이터
```
// 쿼리 파라미터
year      number    // 예: 2024
month     number    // 예: 5
```

> category 파라미터는 백엔드 미지원. 카테고리 필터링은 프론트에서 처리.

```json
// 응답 200
{
  "year": 2024,
  "month": 5,
  "days": [
    {
      "date": "2024-05-10",
      "photos": [
        {
          "photoId": "string",
          "thumbnailUrl": "string",
          "category": "string",
          "categoryColor": "#FAC775"
        }
      ]
    }
  ]
}
```

> `days`: 사진이 있는 날짜만 포함, 없으면 빈 배열  
> 프론트에서 `days` 배열을 `Record<"YYYY-MM-DD", CalendarDateEntry>`로 변환 후 사용  
> 카테고리 필터는 `representativePhoto.category`를 클라이언트에서 비교

---

### 6.6 이미지 편집

#### POST `/photos/:photoId/edit` — AI 편집 적용 및 저장
```json
// 요청
{
  "brightness": 20,             // -100 ~ 100, 0이 기본
  "blur": 0.5,                  // 0 ~ 1, 배경 블러 강도
  "filter": "vivid" | "matte" | "noir" | null,
  "textLayers": [
    {
      "text": "string",
      "x": 0.5,                 // 0~1 비율 좌표
      "y": 0.3,
      "fontSize": 16,
      "color": "#FFFFFF"
    }
  ]
}

// 응답 200
{
  "photoId": "string",
  "editedUrl": "string"         // 편집 완료된 이미지 URL
}
```

---

### 6.7 공유

#### POST `/calendar/export` — 공유용 캘린더 이미지 생성
```json
// 요청
{
  "year": 2024,
  "month": 5,
  "ratio": "1:1" | "4:5" | "16:9"
}

// 응답 200
{
  "imageUrl": "string",         // 생성된 캘린더 이미지 URL
  "expiresAt": "string"         // URL 만료 시각 (임시 URL인 경우)
}
```

#### POST `/calendar/share/link` — 공유 링크 생성
```json
// 요청
{
  "year": 2024,
  "month": 5
}

// 응답 200
{
  "shareUrl": "https://snapcal.app/shared/abc123",
  "expiresAt": "string"
}
```

---

### 6.8 공통 에러 코드

| HTTP 상태 | 코드 | 설명 |
|----------|------|------|
| 400 | `VALIDATION_ERROR` | 요청 필드 오류 |
| 401 | `UNAUTHORIZED` | 토큰 없음 또는 만료 |
| 403 | `FORBIDDEN` | 권한 없음 |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `CONFLICT` | 중복 (이메일 등) |
| 500 | `SERVER_ERROR` | 서버 내부 오류 |

```json
// 에러 응답 공통 형식
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "이메일 형식이 올바르지 않습니다.",
    "field": "email"    // 필드 관련 오류일 때만 포함
  }
}
```

---

## 미설계 화면 (추후 추가 필요)

- 비밀번호 찾기 / 재설정
- 사진 상세 뷰 (날짜 셀 탭 시)
- 프로필 / 설정 화면
- 카테고리 관리 (추가/수정/삭제)
- 알림 화면
