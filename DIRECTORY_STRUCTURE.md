# 📁 디렉토리 구조 가이드

## 🏗️ 새로운 파일 구조

```
src/
├── app/                     # Next.js App Router
│   ├── (auth)/              # 인증 관련 라우트 그룹
│   │   └── member/          # 회원가입, 로그인
│   ├── ai-chat/             # AI 채팅 페이지
│   │   ├── job/             # 직업 추천 채팅
│   │   └── roadmap/         # 로드맵 생성 채팅
│   ├── api/                 # API 라우트
│   │   ├── auth/            # 인증 API
│   │   ├── chat/            # 채팅 관련 API
│   │   └── heart-lists/     # 북마크 관련 API
│   │       ├── job/         # 채용 북마크 API
│   │       └── edu/         # 교육 북마크 API
│   ├── career-roadmap/      # 커리어 로드맵
│   ├── education-programs/  # 교육 프로그램
│   ├── job-postings/        # 채용 공고
│   ├── heart-lists/         # 관심 목록
│   ├── my/                  # 마이 페이지
│   ├── main/                # 메인 페이지
│   ├── oauth2/              # OAuth2 인증
│   ├── edit/                # 프로필 편집
│   ├── test/                # 테스트 페이지
│   ├── globals.css          # 글로벌 스타일
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 홈페이지
├── components/              # React 컴포넌트
│   ├── features/            # 기능별 컴포넌트
│   │   ├── job/             # 채용 관련 컴포넌트
│   │   │   ├── JobCard.tsx
│   │   │   ├── EducationCard.tsx
│   │   │   └── JobRecommendationsSection.tsx
│   │   ├── roadmap/         # 로드맵 관련 컴포넌트
│   │   │   ├── UserMap.tsx
│   │   │   ├── UserCheckList.tsx
│   │   │   └── CareerRoadmapSection.tsx
│   │   ├── chat/            # AI 채팅 관련 컴포넌트
│   │   │   ├── AIChatJobCard.tsx
│   │   │   ├── MessageSection.tsx
│   │   │   └── AICoachSection.tsx
│   │   └── auth/            # 인증 관련 컴포넌트
│   ├── ui/                  # 재사용 UI 컴포넌트
│   │   ├── ChatInput.tsx
│   │   ├── SearchBar.tsx
│   │   └── JobCardSkeleton.tsx
│   ├── layout/              # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── common/              # 공통 컴포넌트
│   │   ├── FlipCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── providers/           # Context Provider
│   │   └── QueryProvider.tsx
│   └── SplashScreen.tsx     # 스플래시 스크린
├── contexts/                # React Context
│   └── ChatHistoryContext.tsx
├── stores/                  # Zustand 상태 관리
│   └── roadmapStore.ts
├── lib/                     # 유틸리티 라이브러리
│   ├── api/                 # API 클라이언트
│   │   └── jobApi.ts
│   ├── auth/                # 인증 관련
│   │   └── auth.ts
│   ├── utils/               # 유틸리티 함수
│   │   └── cn.ts
│   └── constants/           # 상수 정의
├── types/                   # TypeScript 타입 정의
│   ├── job.ts
│   ├── roadmap.ts
│   └── user.ts
├── data/                    # 정적 데이터
│   ├── ai-chat-job-list.ts
│   ├── ai-chat-roadmap-list.ts
│   ├── jobData.ts
│   └── aiCoachData.ts
├── styles/                  # 스타일 관련
│   └── components/
├── utils/                   # 추가 유틸리티
│   └── alert.ts
└── hooks/                   # 커스텀 훅 (필요시)
```

## 🎯 디렉토리별 역할과 책임

### `components/features/`

기능별로 구조화된 컴포넌트들:

- **job/**: 채용 공고 관련 모든 컴포넌트
- **roadmap/**: 커리어 로드맵 관련 모든 컴포넌트
- **chat/**: AI 채팅 관련 모든 컴포넌트
- **auth/**: 인증 관련 컴포넌트

### `components/ui/`

프로젝트 전반에서 재사용되는 기본 UI 컴포넌트들

### `components/layout/`

페이지 레이아웃을 구성하는 컴포넌트들

### `lib/`

비즈니스 로직과 유틸리티 함수들:

- **api/**: 백엔드 API 호출 함수들
- **auth/**: 인증 관련 로직
- **utils/**: 공통 유틸리티 함수들

### `types/`

모든 TypeScript 타입 정의가 통합된 폴더

### `data/`

정적 데이터와 목업 데이터

## 📝 Import 경로 규칙

### 절대 경로 사용

```typescript
// ✅ 좋은 예
import JobCard from '@/components/features/job/JobCard';
import { getRecommendedJobs } from '@/lib/api/jobApi';
import { JobResponse } from '@/types/job';

// ❌ 나쁜 예
import JobCard from '../../components/features/job/JobCard';
import { getRecommendedJobs } from '../../../lib/api/jobApi';
```

### 설정된 Alias

- `@/components/*`: 컴포넌트 폴더
- `@/lib/*`: 라이브러리 폴더
- `@/types/*`: 타입 정의 폴더
- `@/hooks/*`: 커스텀 훅 폴더
- `@/contexts/*`: React Context 폴더
- `@/stores/*`: 상태 관리 폴더
- `@/data/*`: 정적 데이터 폴더

## 🔄 마이그레이션 완료 사항

1. **API 파일 이동**: `src/apis/jobApi.ts` → `src/lib/api/jobApi.ts`
2. **컴포넌트 재구성**: 기능별 폴더로 분류
3. **타입 통합**: `src/lib/types/` → `src/types/`
4. **Mock 데이터 통합**: `src/mock/` → `src/data/`
5. **Import 경로 업데이트**: 모든 파일의 import 경로 수정 완료
6. **절대 경로 설정**: tsconfig.json에 alias 설정 완료

## 🚀 장점

1. **가독성 향상**: 기능별로 명확하게 분류된 구조
2. **유지보수성**: 관련 파일들이 논리적으로 그룹화됨
3. **확장성**: 새로운 기능 추가 시 명확한 위치 제공
4. **재사용성**: 컴포넌트 간 의존성 명확화
5. **개발 효율성**: 절대 경로로 빠른 파일 찾기 가능

이 구조는 프로젝트의 지속적인 성장과 팀 협업을 고려하여 설계되었습니다.
