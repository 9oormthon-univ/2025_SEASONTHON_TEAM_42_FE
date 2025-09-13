# 📁 디렉토리 구조 가이드

## 🏗️ 새로운 파일 구조

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 인증 관련 라우트 그룹
│   ├── ai-chat/                  # AI 채팅 페이지
│   ├── career-roadmap/           # 커리어 로드맵 페이지
│   ├── job-postings/             # 채용 공고 페이지
│   └── ...                       # 기타 페이지들
│
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                      # 기본 UI 컴포넌트
│   │   ├── ChatInput.tsx
│   │   ├── SearchBar.tsx
│   │   └── ...
│   ├── layout/                  # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── features/                # 기능별 컴포넌트
│   │   ├── job/                 # 채용 관련 컴포넌트
│   │   │   ├── JobCard.tsx
│   │   │   └── JobRecommendationsSection.tsx
│   │   ├── roadmap/             # 로드맵 관련 컴포넌트
│   │   │   ├── UserMap.tsx
│   │   │   ├── UserCheckList.tsx
│   │   │   └── CareerRoadmapSection.tsx
│   │   ├── chat/                # AI 채팅 관련 컴포넌트
│   │   │   ├── AIChatJobCard.tsx
│   │   │   ├── MessageSection.tsx
│   │   │   └── AICoachSection.tsx
│   │   └── auth/                # 인증 관련 컴포넌트
│   ├── common/                  # 공통 컴포넌트
│   │   ├── FlipCard.tsx
│   │   └── SplashScreen.tsx
│   └── providers/               # React 프로바이더
│       └── QueryProvider.tsx
│
├── lib/                         # 유틸리티 및 설정
│   ├── api/                     # API 관련 함수들
│   │   └── jobApi.ts
│   ├── auth/                    # 인증 관련
│   │   └── auth.ts
│   ├── utils/                   # 유틸리티 함수들
│   │   └── cn.ts
│   └── constants/               # 상수 정의
│
├── types/                       # TypeScript 타입 정의 (통합)
│   ├── job.ts
│   ├── roadmap.ts
│   └── user.ts
│
├── hooks/                       # 커스텀 훅
├── contexts/                    # React Context
│   └── ChatHistoryContext.tsx
├── stores/                      # 상태 관리
│   └── roadmapStore.ts
└── data/                        # 정적 데이터 및 목업
    ├── ai-chat-job-list.ts
    ├── ai-chat-roadmap-list.ts
    ├── jobData.ts
    ├── aiCoachData.ts
    └── ...
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
