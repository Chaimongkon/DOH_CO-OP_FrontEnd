"use client";

import { lazy, Suspense } from "react";
import { Skeleton } from "antd";

// Dynamic imports for heavy components
const QuestionsPage = lazy(() => import("@/app/(Questions)/Questions/page"));
const NewQuestionsPage = lazy(() => import("@/app/(Questions)/NewQuestions/page"));
const QuestionDetailPage = lazy(() => import("@/app/(Questions)/Questions/[id]/page"));

// Loading fallback component
const QuestionsLoading = () => (
  <div style={{ padding: "20px" }}>
    <Skeleton active paragraph={{ rows: 6 }} />
  </div>
);

// Lazy-loaded Questions List Component
export const LazyQuestionsPage = () => (
  <Suspense fallback={<QuestionsLoading />}>
    <QuestionsPage />
  </Suspense>
);

// Lazy-loaded New Question Form Component
export const LazyNewQuestionsPage = () => (
  <Suspense fallback={<QuestionsLoading />}>
    <NewQuestionsPage />
  </Suspense>
);

// Lazy-loaded Question Detail Component
export const LazyQuestionDetailPage = () => (
  <Suspense fallback={<QuestionsLoading />}>
    <QuestionDetailPage />
  </Suspense>
);

const LazyQuestionComponents = {
  QuestionsPage: LazyQuestionsPage,
  NewQuestionsPage: LazyNewQuestionsPage,
  QuestionDetailPage: LazyQuestionDetailPage,
};

export default LazyQuestionComponents;