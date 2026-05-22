import "server-only";

import { UPSERT_QUESTION_ANSWER } from "@/lib/graphql/mutations";
import {
  GET_ORGANIZATION_ANSWERS,
  GET_QUESTION_ITEMS,
  GET_QUESTIONS_BY_SECTION,
  GET_QUESTION_SECTIONS,
} from "@/lib/graphql/queries";
import { executeHasuraGraphql } from "@/lib/graphql/client";
import { getNhostGraphqlUrl } from "@/lib/nhost/config";
import type { QuestionAnswerStatus } from "@/lib/types";

export type GraphqlJson =
  | string
  | number
  | boolean
  | null
  | GraphqlJson[]
  | { [key: string]: GraphqlJson };

export type QuestionSectionRecord = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  sort_order: number;
  question_items_aggregate?: {
    aggregate?: {
      count: number;
    } | null;
  } | null;
};

export type QuestionItemRecord = {
  id: string;
  section_id: string;
  code: string;
  title: string;
  help_text: string | null;
  answer_type:
    | "text"
    | "number"
    | "boolean"
    | "select"
    | "date"
    | "multi_select"
    | "textarea";
  unit: string | null;
  options: GraphqlJson;
  evidence_required: boolean;
  questionnaire_level: "basic" | "full";
  sort_order: number;
};

export type QuestionAnswerRecord = {
  id: string;
  organization_id: string;
  question_item_id: string;
  value: GraphqlJson;
  status: QuestionAnswerStatus;
  created_at: string;
  updated_at: string;
  question_item?: {
    id: string;
    section_id: string;
    code: string;
    title?: string;
    evidence_required?: boolean;
    question_section?: {
      id: string;
      code: string;
      title: string;
    } | null;
  } | null;
};

export type UpsertQuestionAnswerInput = {
  organizationId: string;
  questionItemId: string;
  value: GraphqlJson;
  status: QuestionAnswerStatus;
};

export type SaveQuestionnaireAnswersInput = {
  organizationId: string;
  answers: Array<{
    questionItemId: string;
    value: GraphqlJson;
    status: QuestionAnswerStatus;
  }>;
};

type QuestionSectionsResponse = {
  question_sections: QuestionSectionRecord[];
};

type QuestionsBySectionResponse = {
  question_items: QuestionItemRecord[];
};

type QuestionItemsResponse = {
  question_items: QuestionItemRecord[];
};

type OrganizationAnswersResponse = {
  question_answers: QuestionAnswerRecord[];
};

type UpsertQuestionAnswerResponse = {
  insert_question_answers_one: QuestionAnswerRecord | null;
};

export function isQuestionnaireBackendConfigured() {
  return Boolean(getNhostGraphqlUrl());
}

export async function getQuestionSections(accessToken?: string) {
  const data = await executeQuestionnaireGraphql<QuestionSectionsResponse>(
    GET_QUESTION_SECTIONS,
    {},
    accessToken,
  );

  return data.question_sections;
}

export async function getQuestionItems(accessToken?: string) {
  const data = await executeQuestionnaireGraphql<QuestionItemsResponse>(
    GET_QUESTION_ITEMS,
    {},
    accessToken,
  );

  return data.question_items;
}

export async function getQuestionsBySection(sectionCode: string, accessToken?: string) {
  const data = await executeQuestionnaireGraphql<QuestionsBySectionResponse>(
    GET_QUESTIONS_BY_SECTION,
    { sectionCode },
    accessToken,
  );

  return data.question_items;
}

export async function getQuestionnaireData(
  organizationId: string,
  accessToken?: string,
  sectionCode = "energy",
) {
  const [sections, items, answers] = await Promise.all([
    getQuestionSections(accessToken),
    getQuestionsBySection(sectionCode, accessToken),
    getOrganizationAnswers(organizationId, accessToken),
  ]);

  return {
    sections,
    items,
    answers,
    isMock: false,
  };
}

export async function getOrganizationAnswers(organizationId: string, accessToken?: string) {
  const data = await executeQuestionnaireGraphql<OrganizationAnswersResponse>(
    GET_ORGANIZATION_ANSWERS,
    { organizationId },
    accessToken,
  );

  return data.question_answers;
}

export async function upsertQuestionAnswer(
  input: UpsertQuestionAnswerInput,
  accessToken?: string,
) {
  const data = await executeQuestionnaireGraphql<UpsertQuestionAnswerResponse>(
    UPSERT_QUESTION_ANSWER,
    {
      object: {
        organization_id: input.organizationId,
        question_item_id: input.questionItemId,
        value: input.value,
        status: input.status,
      },
    },
    accessToken,
  );

  if (!data.insert_question_answers_one) {
    throw new Error("Question answer could not be saved.");
  }

  return data.insert_question_answers_one;
}

export async function saveQuestionnaireAnswers(
  input: SaveQuestionnaireAnswersInput,
  accessToken?: string,
) {
  return Promise.all(
    input.answers.map((answer) =>
      upsertQuestionAnswer(
        {
          organizationId: input.organizationId,
          questionItemId: answer.questionItemId,
          value: answer.value,
          status: answer.status === "reviewed" ? "completed" : answer.status,
        },
        accessToken,
      ),
    ),
  );
}

async function executeQuestionnaireGraphql<TData>(
  query: string,
  variables: Record<string, unknown>,
  accessToken?: string,
): Promise<TData> {
  const graphqlUrl = getNhostGraphqlUrl();

  if (!graphqlUrl || !accessToken) {
    throw new Error("Nhost GraphQL is not configured.");
  }

  // User access tokens keep questionnaire reads/writes under Hasura permissions.
  return executeHasuraGraphql<TData>(query, variables, { accessToken });
}
