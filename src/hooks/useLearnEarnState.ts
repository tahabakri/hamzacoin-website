// ============================================================================
// useLearnEarnState.ts — finite state machine for the Learn & Earn flow
// ----------------------------------------------------------------------------
// States:
//   picking  → no article selected
//   reading  → article loaded, quiz not started yet
//   quizzing → answering questions
//   grading  → posting answers to backend
//   scoring  → grading returned, animating reveal
//   claiming → claim tx in flight
//   claimed  → done (or score === 0 path: done with no reward)
//   error    → anything went wrong; UI offers retry
// ============================================================================

import { useCallback, useReducer } from "react";

export type PublicQuestion = {
  id: number;
  question: string;
  options: string[];
};

export type GradeResult = {
  score: number;
  signature: string | null;
  articleHash: string;
  perAnswer: boolean[];
  explanations: string[];
};

export type LEStatus =
  | "picking"
  | "reading"
  | "quizzing"
  | "grading"
  | "scoring"
  | "claiming"
  | "claimed"
  | "done-no-reward"
  | "error";

export type LEState = {
  status: LEStatus;
  articleTitle: string | null;
  articleDisplayTitle: string | null;
  articleHash: string | null;
  questions: PublicQuestion[];
  answers: (number | null)[];
  result: GradeResult | null;
  claimedTxHash: string | null;
  errorMessage: string | null;
};

const INITIAL: LEState = {
  status: "picking",
  articleTitle: null,
  articleDisplayTitle: null,
  articleHash: null,
  questions: [],
  answers: [],
  result: null,
  claimedTxHash: null,
  errorMessage: null,
};

type Action =
  | { type: "pickArticle"; title: string; displayTitle: string }
  | { type: "startQuiz"; articleHash: string; questions: PublicQuestion[] }
  | { type: "setAnswer"; index: number; value: number }
  | { type: "submitGrading" }
  | { type: "gradingDone"; result: GradeResult }
  | { type: "startClaim" }
  | { type: "claimDone"; txHash: string }
  | { type: "skipClaim" }
  | { type: "error"; message: string }
  | { type: "reset" }
  | { type: "backToPicker" };

function reducer(state: LEState, action: Action): LEState {
  switch (action.type) {
    case "pickArticle":
      return {
        ...INITIAL,
        status: "reading",
        articleTitle: action.title,
        articleDisplayTitle: action.displayTitle,
      };
    case "startQuiz":
      return {
        ...state,
        status: "quizzing",
        articleHash: action.articleHash,
        questions: action.questions,
        answers: new Array(action.questions.length).fill(null) as (number | null)[],
      };
    case "setAnswer": {
      const next = [...state.answers];
      next[action.index] = action.value;
      return { ...state, answers: next };
    }
    case "submitGrading":
      return { ...state, status: "grading" };
    case "gradingDone":
      return {
        ...state,
        status: action.result.score > 0 ? "scoring" : "scoring",
        result: action.result,
      };
    case "startClaim":
      return { ...state, status: "claiming" };
    case "claimDone":
      return { ...state, status: "claimed", claimedTxHash: action.txHash };
    case "skipClaim":
      return { ...state, status: "done-no-reward" };
    case "error":
      return { ...state, status: "error", errorMessage: action.message };
    case "backToPicker":
    case "reset":
      return INITIAL;
    default:
      return state;
  }
}

export function useLearnEarnState() {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const pickArticle = useCallback(
    (title: string, displayTitle: string) =>
      dispatch({ type: "pickArticle", title, displayTitle }),
    [],
  );
  const startQuiz = useCallback(
    (articleHash: string, questions: PublicQuestion[]) =>
      dispatch({ type: "startQuiz", articleHash, questions }),
    [],
  );
  const setAnswer = useCallback(
    (index: number, value: number) => dispatch({ type: "setAnswer", index, value }),
    [],
  );
  const submitGrading = useCallback(() => dispatch({ type: "submitGrading" }), []);
  const gradingDone = useCallback(
    (result: GradeResult) => dispatch({ type: "gradingDone", result }),
    [],
  );
  const startClaim = useCallback(() => dispatch({ type: "startClaim" }), []);
  const claimDone = useCallback(
    (txHash: string) => dispatch({ type: "claimDone", txHash }),
    [],
  );
  const skipClaim = useCallback(() => dispatch({ type: "skipClaim" }), []);
  const error = useCallback((message: string) => dispatch({ type: "error", message }), []);
  const reset = useCallback(() => dispatch({ type: "reset" }), []);
  const backToPicker = useCallback(() => dispatch({ type: "backToPicker" }), []);

  const allAnswered = state.answers.length > 0 && state.answers.every((a) => a !== null);

  return {
    state,
    allAnswered,
    actions: {
      pickArticle,
      startQuiz,
      setAnswer,
      submitGrading,
      gradingDone,
      startClaim,
      claimDone,
      skipClaim,
      error,
      reset,
      backToPicker,
    },
  };
}
