import "server-only";

import { INSERT_SUPPLIER_PASSPORT, UPDATE_SUPPLIER_PASSPORT } from "@/lib/graphql/mutations";
import { GET_LATEST_SUPPLIER_PASSPORT } from "@/lib/graphql/queries";
import { executeHasuraGraphql } from "@/lib/graphql/client";
import { getNhostGraphqlUrl } from "@/lib/nhost/config";
import {
  getOrganizationAnswers,
  getQuestionItems,
  type QuestionAnswerRecord,
} from "@/lib/data/questionnaire";
import {
  passportApprovedDocuments,
  passportCompanyProfile,
  passportMissingDataChecklist,
  passportReadinessSummary,
  passportSections,
  passportShareSettings,
} from "@/lib/mock-data";

export type SupplierPassportRecord = {
  id: string;
  organization_id: string;
  title: string;
  status: "draft" | "generated" | "shared" | "archived";
  readiness_score: number;
  generated_by: string | null;
  generated_at: string | null;
  created_at: string;
  updated_at: string;
};

type LatestPassportResponse = {
  supplier_passports: SupplierPassportRecord[];
};

type InsertPassportResponse = {
  insert_supplier_passports_one: SupplierPassportRecord | null;
};

type UpdatePassportResponse = {
  update_supplier_passports_by_pk: SupplierPassportRecord | null;
};

export function isPassportsBackendConfigured() {
  return Boolean(getNhostGraphqlUrl());
}

export async function getPassportPreviewData() {
  return {
    company: passportCompanyProfile,
    readiness: passportReadinessSummary,
    sections: passportSections,
    approvedDocuments: passportApprovedDocuments,
    missingDataChecklist: passportMissingDataChecklist,
    shareSettings: passportShareSettings,
    source: "mock" as const,
  };
}

export async function getLatestPassport(organizationId: string, accessToken?: string) {
  const data = await executePassportGraphql<LatestPassportResponse>(
    GET_LATEST_SUPPLIER_PASSPORT,
    { organizationId },
    accessToken,
  );

  return data.supplier_passports[0] ?? null;
}

export async function calculateReadinessScore(organizationId: string, accessToken?: string) {
  const [items, answers] = await Promise.all([
    getQuestionItems(accessToken),
    getOrganizationAnswers(organizationId, accessToken),
  ]);

  if (!items.length) {
    return 0;
  }

  const answersByQuestionId = new Map(
    answers.map((answer) => [answer.question_item_id, answer]),
  );

  const completedCount = items.reduce((count, item) => {
    const answer = answersByQuestionId.get(item.id);

    return isAnswerComplete(answer) ? count + 1 : count;
  }, 0);

  return Math.round((completedCount / items.length) * 100);
}

export async function generateSupplierPassport(
  organizationId: string,
  userId: string,
  accessToken?: string,
) {
  const readinessScore = await calculateReadinessScore(organizationId, accessToken);
  const generatedAt = new Date().toISOString();
  const latestPassport = await getLatestPassport(organizationId, accessToken);

  if (latestPassport) {
    const data = await executePassportGraphql<UpdatePassportResponse>(
      UPDATE_SUPPLIER_PASSPORT,
      {
        passportId: latestPassport.id,
        set: {
          title: latestPassport.title || "Supplier Passport",
          status: "generated",
          readiness_score: readinessScore,
          generated_by: userId,
          generated_at: generatedAt,
        },
      },
      accessToken,
    );

    if (!data.update_supplier_passports_by_pk) {
      throw new Error("Supplier Passport could not be updated.");
    }

    return data.update_supplier_passports_by_pk;
  }

  const data = await executePassportGraphql<InsertPassportResponse>(
    INSERT_SUPPLIER_PASSPORT,
    {
      object: {
        organization_id: organizationId,
        title: "Supplier Passport",
        status: "generated",
        readiness_score: readinessScore,
        generated_by: userId,
        generated_at: generatedAt,
      },
    },
    accessToken,
  );

  if (!data.insert_supplier_passports_one) {
    throw new Error("Supplier Passport could not be generated.");
  }

  return data.insert_supplier_passports_one;
}

function isAnswerComplete(answer?: QuestionAnswerRecord) {
  return answer?.status === "completed" || answer?.status === "reviewed";
}

async function executePassportGraphql<TData>(
  query: string,
  variables: Record<string, unknown>,
  accessToken?: string,
): Promise<TData> {
  if (!getNhostGraphqlUrl() || !accessToken) {
    throw new Error("Nhost GraphQL is not configured.");
  }

  return executeHasuraGraphql<TData>(query, variables, { accessToken });
}
