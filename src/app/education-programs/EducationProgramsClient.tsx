'use client';

import EducationCard from '@/components/features/job/EducationCard';
import EmptyEducations from '@/components/features/job/EmptyEducations';
import SearchBar from '@/components/ui/SearchBar';
import EducationTab from '@/components/ui/EducationTab';
import EducationFilter from '@/components/ui/EducationFilter';
import EducationCardSkeleton from '@/components/ui/EducationCardSkeleton';
import Footer from '@/components/layout/Footer';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getAllEducationsAnonymous,
  getHrdEducations,
  getRecommendedEducations,
  getEducationBookmarks,
} from '@/lib/api/jobApi';
import { EducationSummary } from '@/types/job';

interface EducationProgramsClientProps {
  initialEducations: EducationSummary[];
  initialTotalElements: number;
  isLoggedInInitial: boolean;
}

export default function EducationProgramsClient({
  initialEducations,
  initialTotalElements,
  isLoggedInInitial,
}: EducationProgramsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = isLoggedInInitial;

  // URL에서 초기 상태 파싱
  const getInitialTab = (): 'custom' | 'all' => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'recommend' || tabParam === 'custom') return 'custom';
    if (tabParam === 'all') return 'all';
    return isLoggedInInitial ? 'custom' : 'all';
  };

  const getInitialPage = (): number => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam) : 1;
  };

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'custom' | 'all'>(getInitialTab());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [educations, setEducations] =
    useState<EducationSummary[]>(initialEducations);
  const [currentPage, setCurrentPage] = useState<number>(getInitialPage());
  const [, setTotalElements] = useState<number>(initialTotalElements);
  const [totalPages, setTotalPages] = useState<number>(
    Math.max(
      1,
      Math.ceil((initialTotalElements || initialEducations.length) / 10)
    )
  );
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] =
    useState<string>('');
  const [filters, setFilters] = useState<{
    selectedRegion: string;
    selectedDistricts: string[];
    educationType: string[];
    educationCategory: string[];
  }>({
    selectedRegion: '',
    selectedDistricts: [],
    educationType: [],
    educationCategory: [],
  });

  // URL 업데이트 함수
  const updateURL = (tab: 'custom' | 'all', page: number) => {
    const params = new URLSearchParams();
    if (tab === 'custom') {
      params.set('tab', 'recommend');
    } else {
      params.set('tab', 'all');
      params.set('page', page.toString());
    }
    router.push(`/education-programs?${params.toString()}`, { scroll: false });
  };

  // 탭 변경 핸들러 -> useEffect가 activeTab 변경을 감지하여 fetchEducations 호출
  const handleTabChange = (tab: 'custom' | 'all') => {
    setActiveTab(tab);
    setCurrentPage(1);
    updateURL(tab, 1);
  };

  // 페이지 변경 핸들러 -> useEffect가 currentPage 변경을 감지하여 fetchEducations 호출
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL(activeTab, page);
  };

  // 북마크 초기 로드 (로그인 시)
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const bookmarkIds = await getEducationBookmarks();
        setFavorites(new Set(bookmarkIds));
      } catch (e) {
        console.error('Error loading education bookmarks:', e);
      }
    })();
  }, [isLoggedIn]);

  // 검색어 디바운싱 -> 사용자가 타이핑을 멈춘 후 실제 검색이 실행될 수 있게 함
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearchKeyword(searchKeyword),
      500
    );
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const fetchEducations = async (page: number = 1) => {
    try {
      setIsLoading(true);
      let data: EducationSummary[] = [];
      let newTotalElements = 0;

      if (isLoggedIn) {
        if (activeTab === 'custom') {
          data = await getRecommendedEducations();
          newTotalElements = data.length;
        } else {
          const result = await getHrdEducations({
            keyword: debouncedSearchKeyword || undefined,
            pageNo: page,
            pageSize: 10,
            startYmd: '20250101',
            endYmd: '20251231',
          });
          data = (result.educationDtoList || []).map((edu) => ({
            id: edu.educationId.toString(),
            educationId: edu.educationId,
            trprId: edu.educationId.toString(),
            title: edu.title,
            subTitle: edu.subTitle,
            institution: '',
            address: edu.address,
            traStartDate: edu.traStartDate,
            traEndDate: edu.traEndDate,
            trainTarget: '',
            contents: '',
            certificate: '',
            grade: '',
            regCourseMan: '',
            courseMan: edu.courseMan,
            realMan: '',
            yardMan: '',
            telNo: '',
            stdgScor: '',
            eiEmplCnt3: '',
            eiEmplRate3: '',
            eiEmplCnt3Gt10: '',
            eiEmplRate6: '',
            ncsCd: '',
            trprDegr: edu.trprDegr,
            instCd: '',
            trngAreaCd: '',
            trainTargetCd: '',
            trainstCstId: '',
            subTitleLink: '',
            titleLink: edu.titleLink,
            titleIcon: '',
            imageUrl: edu.imageUrl,
            isBookmark: edu.isBookmark,
            recommendScore: edu.score ?? undefined,
          }));
          newTotalElements = result.totalElements || 0;
        }
      } else {
        const result = await getAllEducationsAnonymous({
          keyword: debouncedSearchKeyword || undefined,
          startYmd: '',
          endYmd: '',
        });
        data = (result.educationDtoList || []).map((edu) => ({
          id: edu.educationId.toString(),
          educationId: edu.educationId,
          trprId: edu.educationId.toString(),
          title: edu.title,
          subTitle: edu.subTitle,
          institution: '',
          address: edu.address,
          traStartDate: edu.traStartDate,
          traEndDate: edu.traEndDate,
          trainTarget: '',
          contents: '',
          certificate: '',
          grade: '',
          regCourseMan: '',
          courseMan: edu.courseMan,
          realMan: '',
          yardMan: '',
          telNo: '',
          stdgScor: '',
          eiEmplCnt3: '',
          eiEmplRate3: '',
          eiEmplCnt3Gt10: '',
          eiEmplRate6: '',
          ncsCd: '',
          trprDegr: edu.trprDegr,
          instCd: '',
          trngAreaCd: '',
          trainTargetCd: '',
          trainstCstId: '',
          subTitleLink: '',
          titleLink: edu.titleLink,
          titleIcon: '',
          imageUrl: edu.imageUrl,
          isBookmark: edu.isBookmark,
          recommendScore: edu.score ?? undefined,
        }));
        newTotalElements = result.totalElements || 0;
      }

      setEducations(data);
      setTotalElements(newTotalElements);
      setTotalPages(Math.max(1, Math.ceil(newTotalElements / 10)));
    } catch (error) {
      console.error(
        '[EducationProgramsClient] Error fetching educations:',
        error
      );
      setEducations([]);
      setTotalElements(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // 의존성 변경 시 첫 페이지로 로드
  useEffect(() => {
    // 탭이나 필터가 변경되면 항상 데이터를 다시 가져옴
    fetchEducations(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isLoggedIn, filters, debouncedSearchKeyword]);

  // 페이지 변경 시 로드
  useEffect(() => {
    if (currentPage > 1) {
      fetchEducations(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const toggleFavorite = (educationId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(educationId)) {
      newFavorites.delete(educationId);
    } else {
      newFavorites.add(educationId);
    }
    setFavorites(newFavorites);
  };

  if (isLoading) {
    return (
      <div>
        <main className="min-h-screen bg-white">
          <section className="w-full px-4 py-8">
            <div className="max-w-[1200px] mx-auto">
              <SearchBar />
              <EducationFilter onFilterChange={setFilters} />
              {isLoggedIn && (
                <EducationTab
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  isLoggedIn={isLoggedIn}
                />
              )}
              <div className="flex flex-col md:flex-row gap-6 mt-12">
                <div className="flex flex-col gap-6 flex-1">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <EducationCardSkeleton key={index} />
                  ))}
                </div>
                <div className="flex flex-col gap-6 flex-1">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <EducationCardSkeleton key={index + 4} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <main className="min-h-screen bg-white">
        <section className="w-full px-4 py-8">
          <div className="max-w-[1200px] mx-auto">
            <SearchBar onSearchChange={setSearchKeyword} />
            <EducationFilter onFilterChange={setFilters} />
            {isLoggedIn && (
              <EducationTab
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isLoggedIn={isLoggedIn}
              />
            )}
            {educations.length === 0 && isLoggedIn ? (
              <EmptyEducations isLoggedIn={isLoggedIn} activeTab={activeTab} />
            ) : educations.length > 0 ? (
              <>
                <div className="flex flex-col md:flex-row gap-6 mt-12">
                  <div className="flex flex-col gap-6 flex-1">
                    {educations
                      .slice(0, Math.ceil(educations.length / 2))
                      .map((education, index) => (
                        <EducationCard
                          key={education.trprId || index}
                          education={education}
                          onToggleBookmark={toggleFavorite}
                          isBookmarked={favorites.has(education.trprId || '')}
                        />
                      ))}
                  </div>
                  <div className="flex flex-col gap-6 flex-1">
                    {educations
                      .slice(Math.ceil(educations.length / 2))
                      .map((education, index) => (
                        <EducationCard
                          key={
                            education.trprId ||
                            index + Math.ceil(educations.length / 2)
                          }
                          education={education}
                          onToggleBookmark={toggleFavorite}
                          isBookmarked={favorites.has(education.trprId || '')}
                        />
                      ))}
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1 sm:gap-2 mt-12 mb-8">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base"
                    >
                      &lt;&lt;
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base"
                    >
                      &lt;
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`min-w-[32px] sm:min-w-[40px] px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border font-medium cursor-pointer text-sm sm:text-base ${currentPage === pageNum ? 'bg-primary-90 text-white border-primary-90 shadow-md' : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base"
                    >
                      &gt;
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base"
                    >
                      &gt;&gt;
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
