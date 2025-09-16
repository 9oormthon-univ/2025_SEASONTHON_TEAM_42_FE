'use client';

import { useState, useEffect, useRef } from 'react';
import { REGIONS, CITIES } from '@/data/location';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface JobFilterProps {
  onFilterChange?: (filters: FilterState) => void;
}

interface FilterState {
  selectedRegion: string;
  selectedDistricts: string[];
  employmentType: string[];
  jobCategory: string[];
}

// 지역 데이터를 FilterOption 형태로 변환
const regionOptions: FilterOption[] = REGIONS.map((region, index) => ({
  id: `region-${index}`,
  label: region,
  value: region,
}));

const employmentTypeOptions: FilterOption[] = [
  { id: 'fulltime', label: '정규직', value: 'fulltime' },
  { id: 'contract', label: '계약직', value: 'contract' },
  { id: 'freelance', label: '프리랜서', value: 'freelance' },
  { id: 'dispatch', label: '파견직', value: 'dispatch' },
  { id: 'parttime', label: '아르바이트/파트', value: 'parttime' },
  { id: 'intern', label: '인턴', value: 'intern' },
];

const jobCategoryOptions: FilterOption[] = [
  { id: 'production', label: '생산', value: 'production' },
  { id: 'service', label: '서비스', value: 'service' },
  { id: 'cook', label: '조리사', value: 'cook' },
  { id: 'social_worker', label: '사회복지사', value: 'social_worker' },
  { id: 'childcare', label: '보육교사', value: 'childcare' },
  { id: 'other', label: '기타', value: 'other' },
];

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  values: string[];
  isOpen: boolean;
  onToggle: () => void;
  onChange: (values: string[]) => void;
}

interface RegionSelectorProps {
  selectedRegion: string;
  selectedDistricts: string[];
  isOpen: boolean;
  onToggle: () => void;
  onRegionChange: (region: string) => void;
  onDistrictsChange: (districts: string[]) => void;
}

function FilterDropdown({
  label,
  options,
  values,
  isOpen,
  onToggle,
  onChange,
}: FilterDropdownProps) {
  const isSelected = values.length > 0;

  const handleOptionToggle = (optionValue: string) => {
    const newValues = values.includes(optionValue)
      ? values.filter((v) => v !== optionValue)
      : [...values, optionValue];
    onChange(newValues);
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-primary-20 transition-colors whitespace-nowrap ${
          isSelected || isOpen
            ? 'bg-primary-20 text-gray-90'
            : 'bg-white text-gray-70 hover:border-primary-50'
        }`}
      >
        <span className="text-sm md:text-3xl">{label}</span>
        <svg
          className={`w-4 h-4 md:w-6 md:h-6 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[calc(100vw-3rem)] max-w-72 bg-white border border-gray-20 rounded-lg shadow-lg z-10 p-2 md:p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {options.map((option) => {
              const isChecked = values.includes(option.value);
              return (
                <label
                  key={option.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-primary-90 border-primary-90'
                        : 'border-gray-70'
                    }`}
                  >
                    {isChecked && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs md:text-lg text-gray-90">
                    {option.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleOptionToggle(option.value)}
                    className="hidden"
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RegionSelector({
  selectedRegion,
  selectedDistricts,
  isOpen,
  onToggle,
  onRegionChange,
  onDistrictsChange,
}: RegionSelectorProps) {
  const handleDistrictToggle = (district: string) => {
    const newDistricts = selectedDistricts.includes(district)
      ? selectedDistricts.filter((d) => d !== district)
      : [...selectedDistricts, district];
    onDistrictsChange(newDistricts);
  };

  const currentDistricts = selectedRegion
    ? CITIES[selectedRegion as keyof typeof CITIES] || []
    : [];
  const isSelected = selectedDistricts.length > 0;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-primary-20 transition-colors whitespace-nowrap ${
          isSelected || isOpen
            ? 'bg-primary-20 text-gray-90'
            : 'bg-white text-gray-70 hover:border-primary-50'
        }`}
      >
        <span className="text-sm md:text-3xl">지역</span>
        <svg
          className={`w-4 h-4 md:w-6 md:h-6 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[calc(100vw-3rem)] md:w-[500px] bg-white border border-gray-20 rounded-lg shadow-lg z-10 p-2 md:p-4">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4">
            {/* 왼쪽: 지역 목록 */}
            <div className="w-full md:w-1/2">
              <h3 className="text-sm md:text-xl font-medium text-gray-90 mb-2 md:mb-3">
                지역 선택
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {regionOptions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => onRegionChange(region.value)}
                    className={`px-3 py-2 text-xs md:text-lg text-left rounded transition-colors ${
                      selectedRegion === region.value
                        ? 'bg-primary-10 text-primary-90 font-medium'
                        : 'text-gray-70 hover:bg-gray-5'
                    }`}
                  >
                    {region.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 오른쪽: 선택된 지역의 구/시 목록 */}
            <div className="w-full md:w-1/2 md:border-l border-gray-20 md:pl-4">
              <h3 className="text-sm md:text-xl font-medium text-gray-90 mb-2 md:mb-3">
                {selectedRegion
                  ? `${selectedRegion} 지역`
                  : '지역을 선택하세요'}
              </h3>
              {selectedRegion && currentDistricts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {currentDistricts.map((district, index) => {
                    const isChecked = selectedDistricts.includes(district);
                    return (
                      <label
                        key={`${selectedRegion}-${index}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-primary-90 border-primary-90'
                              : 'border-gray-70'
                          }`}
                        >
                          {isChecked && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs md:text-base text-gray-90">
                          {district}
                        </span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleDistrictToggle(district)}
                          className="hidden"
                        />
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs md:text-lg text-gray-50 text-center py-8">
                  {selectedRegion
                    ? '해당 지역에 구/시가 없습니다'
                    : '지역을 선택해주세요'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobFilter({ onFilterChange }: JobFilterProps) {
  const filterRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    selectedRegion: '',
    selectedDistricts: [],
    employmentType: [],
    jobCategory: [],
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState<{
    region: boolean;
    employmentType: boolean;
    jobCategory: boolean;
  }>({
    region: false,
    employmentType: false,
    jobCategory: false,
  });

  const handleFilterChange = (
    key: keyof FilterState,
    values: string[] | string
  ) => {
    const newFilters = { ...filters, [key]: values };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleRegionChange = (region: string) => {
    setFilters((prev) => ({
      ...prev,
      selectedRegion: region,
      selectedDistricts: [], // 지역이 바뀌면 선택된 구/시 초기화
    }));
  };

  const handleDistrictsChange = (districts: string[]) => {
    setFilters((prev) => ({
      ...prev,
      selectedDistricts: districts,
    }));
  };

  const toggleDropdown = (key: keyof typeof isDropdownOpen) => {
    setIsDropdownOpen((prev) => {
      // 다른 모든 드롭다운을 닫고, 현재 드롭다운만 토글
      const newState = {
        region: false,
        employmentType: false,
        jobCategory: false,
      };
      newState[key] = !prev[key];
      return newState;
    });
  };

  const getSelectedLabel = (key: keyof FilterState) => {
    if (key === 'selectedRegion') {
      return filters.selectedRegion || '전체';
    }

    const optionsMap: Record<string, FilterOption[]> = {
      employmentType: employmentTypeOptions,
      jobCategory: jobCategoryOptions,
    };

    const options = optionsMap[key];
    const selectedValues = filters[key as keyof typeof filters] as string[];
    if (selectedValues.length === 0) return '전체';
    if (selectedValues.length === 1) {
      return (
        options?.find(
          (option: FilterOption) => option.value === selectedValues[0]
        )?.label || '전체'
      );
    }
    return `${selectedValues.length}개 선택`;
  };

  const hasActiveFilters =
    filters.selectedDistricts.length > 0 ||
    filters.employmentType.length > 0 ||
    filters.jobCategory.length > 0;

  // 외부 클릭 시 모든 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen({
          region: false,
          employmentType: false,
          jobCategory: false,
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={filterRef} className="w-full mt-6">
      {/* 필터 바 */}
      <div className="flex flex-row items-stretch md:items-center gap-3 md:gap-4">
        {/* 지역 필터 */}
        <RegionSelector
          selectedRegion={filters.selectedRegion}
          selectedDistricts={filters.selectedDistricts}
          isOpen={isDropdownOpen.region}
          onToggle={() => toggleDropdown('region')}
          onRegionChange={handleRegionChange}
          onDistrictsChange={handleDistrictsChange}
        />

        {/* 근무형태 필터 */}
        <FilterDropdown
          label="근무형태"
          options={employmentTypeOptions}
          values={filters.employmentType}
          isOpen={isDropdownOpen.employmentType}
          onToggle={() => toggleDropdown('employmentType')}
          onChange={(values) => handleFilterChange('employmentType', values)}
        />

        {/* 직무 필터 */}
        <FilterDropdown
          label="직무"
          options={jobCategoryOptions}
          values={filters.jobCategory}
          isOpen={isDropdownOpen.jobCategory}
          onToggle={() => toggleDropdown('jobCategory')}
          onChange={(values) => handleFilterChange('jobCategory', values)}
        />

        {/* 데스크탑용 필터 적용하기 버튼 */}
        <button
          onClick={() => onFilterChange?.(filters)}
          className="hidden md:block ml-auto px-6 py-3 bg-primary-90 text-white rounded-xl text-body-medium font-medium hover:bg-primary-80 transition-colors"
        >
          필터 적용하기
        </button>
      </div>

      {/* 모바일용 필터 적용하기 버튼 */}
      <div className="mt-4 md:hidden flex justify-start">
        <button
          onClick={() => onFilterChange?.(filters)}
          className="px-4 py-2 bg-primary-90 text-white rounded-xl text-sm font-medium hover:bg-primary-80 transition-colors"
        >
          필터 적용하기
        </button>
      </div>

      {/* 활성 필터 표시 */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {/* 선택된 구/시 표시 */}
          {filters.selectedDistricts.map((district) => (
            <div
              key={`district-${district}`}
              className="flex items-center gap-2 px-2 md:px-3 py-1 bg-primary-10 text-primary-90 rounded-full text-xs md:text-body-small"
            >
              <span>{district}</span>
              <button
                onClick={() => {
                  const newDistricts = filters.selectedDistricts.filter(
                    (d: string) => d !== district
                  );
                  handleDistrictsChange(newDistricts);
                }}
                className="hover:text-primary-70"
              >
                ×
              </button>
            </div>
          ))}

          {/* 근무형태 필터 표시 */}
          {filters.employmentType.map((type) => {
            const option = employmentTypeOptions.find(
              (opt) => opt.value === type
            );
            if (!option) return null;
            return (
              <div
                key={`employment-${type}`}
                className="flex items-center gap-2 px-2 md:px-3 py-1 bg-primary-10 text-primary-90 rounded-full text-xs md:text-body-small"
              >
                <span>{option.label}</span>
                <button
                  onClick={() => {
                    const newTypes = filters.employmentType.filter(
                      (t: string) => t !== type
                    );
                    handleFilterChange('employmentType', newTypes);
                  }}
                  className="hover:text-primary-70"
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* 직무 필터 표시 */}
          {filters.jobCategory.map((category) => {
            const option = jobCategoryOptions.find(
              (opt) => opt.value === category
            );
            if (!option) return null;
            return (
              <div
                key={`category-${category}`}
                className="flex items-center gap-2 px-2 md:px-3 py-1 bg-primary-10 text-primary-90 rounded-full text-xs md:text-body-small"
              >
                <span>{option.label}</span>
                <button
                  onClick={() => {
                    const newCategories = filters.jobCategory.filter(
                      (c: string) => c !== category
                    );
                    handleFilterChange('jobCategory', newCategories);
                  }}
                  className="hover:text-primary-70"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
