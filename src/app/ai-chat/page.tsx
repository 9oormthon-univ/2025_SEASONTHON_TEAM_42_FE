'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useChatHistory } from '@/contexts/ChatHistoryContext';
import MessageSection from '@/components/sections/MessageSection';
import ChatInput from '@/components/ui/ChatInput';
import { createAiChatFlow } from '@/data/ai-chat-job-list';
import { createAiChatRoadmapFlow } from '@/data/ai-chat-roadmap-list';
import { roadmapResults } from '@/data/ai-chat-roadmap-results';
import MessageItem from '@/components/ui/MessageItem';
import { UserResponse } from '@/lib/types/user';

interface Occupation {
  imageUrl: string;
  occupationName: string;
  description: string;
  score: string;
}

interface JobRecommendations {
  first: Occupation;
  second: Occupation;
  third: Occupation;
}

export default function AiChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chapter = searchParams.get('chapter') || 'job'; // job 또는 roadmap

  // 사용자 정보 가져오기
  const { data: userData, isLoading: userLoading } = useQuery<UserResponse>({
    queryKey: ['user', 'profile'],
    queryFn: () => fetch('/api/auth/user').then((res) => res.json()),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 데이터가 5분동안 fresh상태로 유지
  });

  // 사용자 이름으로 동적 채팅 플로우 생성 -> 추후 삭제
  console.log('Debug - userData:', userData);
  console.log('Debug - userData.data:', userData?.data);
  console.log('Debug - userData.data.name:', userData?.data?.name);

  const userName = userData?.data?.name ? `${userData.data.name}님` : '님';
  console.log('Debug - userName:', userName);

  const dynamicJobFlow = createAiChatFlow(userName);
  const dynamicRoadmapFlow = createAiChatRoadmapFlow(userName);
  const aiChatFlow =
    chapter === 'roadmap' ? dynamicRoadmapFlow : dynamicJobFlow;

  const {
    messages,
    currentStep,
    isCompleted,
    addBotMessage,
    addUserMessage,
    nextStep,
    completeChat,
  } = useChatHistory();

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  const [showCurrentQuestion, setShowCurrentQuestion] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [jobRecommendations, setJobRecommendations] =
    useState<JobRecommendations | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);

  // 초기 intro 메시지 추가 (사용자 데이터 로딩 후)
  useEffect(() => {
    if (messages.length === 0 && !userLoading && userData) {
      addBotMessage(aiChatFlow.intro.messages.join('\n'), 0);
      setShowCurrentQuestion(true);
    }
  }, [
    messages.length,
    userLoading,
    userData,
    aiChatFlow.intro.messages,
    addBotMessage,
  ]);

  // 현재 단계에 따른 질문 표시
  useEffect(() => {
    if (
      currentStep > 0 &&
      currentStep <= aiChatFlow.questions.length &&
      showCurrentQuestion
    ) {
      const currentQuestion = aiChatFlow.questions.find(
        (q) => q.step === currentStep
      );
      if (currentQuestion) {
        addBotMessage(currentQuestion.message.join('\n'), currentQuestion.id);
      }
      setShowCurrentQuestion(false);
    } else if (currentStep > aiChatFlow.questions.length && !isCompleted) {
      addBotMessage(aiChatFlow.outro.message.join('\n'));
      completeChat();
    }
  }, [
    currentStep,
    showCurrentQuestion,
    isCompleted,
    aiChatFlow,
    addBotMessage,
    completeChat,
  ]);

  // choice나 mixed 타입 질문에서 동적 옵션 조회
  useEffect(() => {
    if (currentStep <= 0) {
      setDynamicOptions([]);
      setIsLoadingOptions(false);
      return;
    }

    const currentQuestion = aiChatFlow.questions.find(
      (q) => q.step === currentStep
    );

    // 추후 삭제
    console.log('현재 질문:', currentQuestion);
    console.log('질문 타입:', currentQuestion?.type);
    console.log('챕터:', chapter);
    console.log('currentStep:', currentStep);

    if (
      currentQuestion &&
      (currentQuestion.type === 'choice' || currentQuestion.type === 'mixed') &&
      chapter === 'job'
    ) {
      const fetchOptions = async () => {
        setIsLoadingOptions(true);
        console.log('API 호출 시작 - sequence:', currentQuestion.step);

        try {
          const response = await fetch(
            `/api/chat/jobs/options/${currentQuestion.step}`
          );
          console.log('API 응답 상태:', response.status);

          const data = await response.json();
          console.log('API 응답 데이터:', data);

          if (data.result === 'SUCCESS' && data.data?.optionList) {
            console.log('동적 옵션 설정:', data.data.optionList);
            setDynamicOptions(data.data.optionList);
          } else {
            console.log('API 응답 실패, 에러:', data.error);
            console.log('기본 옵션으로 폴백:', currentQuestion.options);
            setDynamicOptions([]);
          }
        } catch (error) {
          console.error('옵션 조회 실패:', error);
          setDynamicOptions([]);
        } finally {
          setIsLoadingOptions(false);
        }
      };

      fetchOptions();
    } else {
      console.log('조건 불만족 - 동적 옵션 사용 안함');
      setDynamicOptions([]);
      setIsLoadingOptions(false);
    }
  }, [currentStep, chapter]);

  // AI 채팅 완료 후 결과 데이터 가져오기
  const fetchJobRecommendations = async () => {
    if (chapter !== 'job') return;

    setIsLoadingRecommendations(true);

    try {
      // 1. 채팅 히스토리 조회
      console.log('채팅 히스토리 조회 중...');
      const historyResponse = await fetch('/api/chat/jobs/history');
      const historyData = await historyResponse.json();
      console.log('채팅 히스토리:', historyData);

      // 2. 맞춤형 직업 추천 조회
      console.log('맞춤형 직업 추천 조회 중...');
      const recommendResponse = await fetch('/api/jobs/recommend/occupation');
      const recommendData = await recommendResponse.json();
      console.log('직업 추천 데이터:', recommendData);

      if (recommendData.result === 'SUCCESS') {
        setJobRecommendations(recommendData.data);
      } else {
        console.error('직업 추천 실패:', recommendData.error);
      }
    } catch (error) {
      console.error('결과 데이터 가져오기 실패:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // 채팅 완료 시 결과 데이터 가져오기
  useEffect(() => {
    if (isCompleted && chapter === 'job' && !jobRecommendations) {
      fetchJobRecommendations();
    }
  }, [isCompleted, chapter, jobRecommendations]);

  const getCurrentQuestion = () => {
    if (currentStep === 0) return null;
    return aiChatFlow.questions.find((q) => q.step === currentStep);
  };

  const handleOptionClick = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleCompleteClick = async () => {
    const currentQuestion = getCurrentQuestion();
    let userResponse = '';

    if (selectedOptions.length > 0) {
      userResponse = selectedOptions.join(', ');
    }

    if (textInput.trim()) {
      userResponse = userResponse ? `${userResponse}, ${textInput}` : textInput;
    }

    if (userResponse || selectedOptions.length > 0) {
      addUserMessage(userResponse, currentQuestion?.id, selectedOptions);

      // API로 답변 저장 (job인 경우)
      if (chapter === 'job' && currentQuestion?.id) {
        try {
          await fetch('/api/chat/jobs/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sequence: currentQuestion.id,
              answer: userResponse,
            }),
          });
        } catch (error) {
          console.error('답변 저장 실패:', error);
        }
      }
    }

    // 다음 단계로 이동
    if (currentStep < aiChatFlow.questions.length) {
      nextStep();
      setShowCurrentQuestion(true);
    } else {
      nextStep(); // 결과 페이지로 이동
    }

    // 상태 초기화
    setSelectedOptions([]);
    setTextInput('');
  };

  const handleSkipClick = async () => {
    const currentQuestion = getCurrentQuestion();
    addUserMessage('건너뛰기', currentQuestion?.id);

    // API로 빈 답변 저장 (job인 경우)
    if (chapter === 'job' && currentQuestion?.id) {
      try {
        await fetch('/api/chat/jobs/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sequence: currentQuestion.id,
            answer: '',
          }),
        });
      } catch (error) {
        console.error('건너뛰기 답변 저장 실패:', error);
      }
    }

    // 다음 단계로 이동
    if (currentStep < aiChatFlow.questions.length) {
      nextStep();
      setShowCurrentQuestion(true);
    } else {
      nextStep(); // 결과 페이지로 이동
    }

    // 상태 초기화
    setSelectedOptions([]);
    setTextInput('');
  };

  const handleStartClick = () => {
    addUserMessage('시작하기');
    nextStep(); // step 1로 이동
    setShowCurrentQuestion(true);
  };

  const currentQuestion = getCurrentQuestion();
  const showStartButton = currentStep === 0 && messages.length > 0;

  // 동적 옵션이 있는 경우 사용, 없으면 기본 옵션 사용
  const currentOptions = (() => {
    if (!currentQuestion) return [];

    const isChoiceOrMixed =
      currentQuestion.type === 'choice' || currentQuestion.type === 'mixed';
    const isJobChapter = chapter === 'job';

    console.log('옵션 선택 로직:', {
      isChoiceOrMixed,
      isJobChapter,
      dynamicOptionsLength: dynamicOptions.length,
      basicOptionsLength: currentQuestion.options?.length || 0,
      isLoadingOptions,
    });

    if (isChoiceOrMixed && isJobChapter) {
      // choice/mixed + job 챕터인 경우
      if (isLoadingOptions) {
        return currentQuestion.options || [];
      }
      if (dynamicOptions.length > 0) {
        console.log('동적 옵션 사용:', dynamicOptions);
        return dynamicOptions;
      }
    }

    console.log('기본 옵션 사용:', currentQuestion.options || []);
    return currentQuestion.options || [];
  })();

  const showQuestionOptions =
    currentQuestion && currentOptions && currentOptions.length > 0;

  // 로딩 상태 처리
  if (userLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="text-center">
          <p className="text-chat-message">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-[10vh] left-1/2 transform -translate-x-1/2">
      <MessageSection
        messages={messages}
        showStartButton={showStartButton}
        showQuestionOptions={showQuestionOptions || false}
        currentQuestionOptions={currentOptions}
        selectedOptions={selectedOptions}
        canSkip={currentQuestion?.canSkip || false}
        onStartClick={handleStartClick}
        onOptionClick={handleOptionClick}
        onCompleteClick={handleCompleteClick}
        onSkipClick={handleSkipClick}
      >
        {/* 완료된 경우 결과 표시 */}
        {isCompleted && (
          // 맞춤형 로드맵 부분
          <div className="ml-[3.7vw]">
            {chapter === 'roadmap' ? (
              <>
                <div className="space-y-2">
                  {roadmapResults.map((result, index) => (
                    <MessageItem
                      key={index}
                      message={result.message.join('\n')}
                      isBot={true}
                      hideProfile={true}
                      noTopMargin={true}
                    />
                  ))}
                </div>
                <div
                  className="flex items-center justify-center w-[20vh] h-[6.7vh] border-2 rounded-[12px] cursor-pointer text-chat-message bg-primary-90 text-white mt-4"
                  onClick={() => router.push('/career-roadmap')}
                >
                  로드맵으로 이동하기
                </div>
              </>
            ) : (
              // 맞춤형 직업 추천 부분
              <div className="space-y-4">
                {isLoadingRecommendations ? (
                  <div className="text-center p-4">
                    <p className="text-chat-message">
                      맞춤형 직업을 추천하는 중...
                    </p>
                  </div>
                ) : jobRecommendations ? (
                  <div className="space-y-4">
                    <MessageItem
                      message="🎉 맞춤형 직업 추천 결과입니다!"
                      isBot={true}
                      hideProfile={true}
                      noTopMargin={true}
                    />

                    {/* 1순위 직업 */}
                    {jobRecommendations.first && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-3">
                          {jobRecommendations.first.imageUrl && (
                            <img
                              src={jobRecommendations.first.imageUrl}
                              alt={jobRecommendations.first.occupationName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-primary-90">
                              1순위: {jobRecommendations.first.occupationName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              적합도: {jobRecommendations.first.score}
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                              {jobRecommendations.first.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2순위 직업 */}
                    {jobRecommendations.second && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-3">
                          {jobRecommendations.second.imageUrl && (
                            <img
                              src={jobRecommendations.second.imageUrl}
                              alt={jobRecommendations.second.occupationName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-primary-90">
                              2순위: {jobRecommendations.second.occupationName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              적합도: {jobRecommendations.second.score}
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                              {jobRecommendations.second.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3순위 직업 */}
                    {jobRecommendations.third && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-3">
                          {jobRecommendations.third.imageUrl && (
                            <img
                              src={jobRecommendations.third.imageUrl}
                              alt={jobRecommendations.third.occupationName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-primary-90">
                              3순위: {jobRecommendations.third.occupationName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              적합도: {jobRecommendations.third.score}
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                              {jobRecommendations.third.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-chat-message">
                      추천 결과를 불러올 수 없습니다.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </MessageSection>

      {/* 입력창 */}
      <div className="absolute bottom-[4.8vh] w-full flex justify-center">
        <ChatInput
          value={textInput}
          onChange={setTextInput}
          onSend={handleCompleteClick}
        />
      </div>
    </div>
  );
}
