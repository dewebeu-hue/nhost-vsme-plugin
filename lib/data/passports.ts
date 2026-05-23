import "server-only";

import { INSERT_SUPPLIER_PASSPORT, UPDATE_SUPPLIER_PASSPORT } from "@/lib/graphql/mutations";
import { GET_LATEST_SUPPLIER_PASSPORT } from "@/lib/graphql/queries";
import { executeHasuraGraphql } from "@/lib/graphql/client";
import { getNhostGraphqlUrl } from "@/lib/nhost/config";
import {
  getOrganizationAnswers,
  getQuestionItems,
} from "@/lib/data/questionnaire";
import { calculatePassportReadinessScore } from "@/lib/passport-summary";
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

type PassportReadinessItemsResponse = {
  question_items: Parameters<typeof calculatePassportReadinessScore>[0];
};

type PassportReadinessAnswersResponse = {
  question_answers: Parameters<typeof calculatePassportReadinessScore>[1];
};

type PassportGraphqlAuth =
  | { accessToken: string }
  | { useAdminSecret: true };

const GET_PASSPORT_READINESS_ITEMS = `
  query GetPassportReadinessItems {
    question_items(order_by: { sort_order: asc }) {
      id
      section_id
      code
      title
    }
  }
`;

const GET_PASSPORT_READINESS_ANSWERS = `
  query GetPassportReadinessAnswers($organizationId: uuid!) {
    question_answers(where: { organization_id: { _eq: $organizationId } }) {
      question_item_id
      value
      status
    }
  }
`;

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

export async function getLatestPassport(
  organizationId: string,
  auth?: string | PassportGraphqlAuth,
) {
  const data = await executePassportGraphql<LatestPassportResponse>(
    GET_LATEST_SUPPLIER_PASSPORT,
    { organizationId },
    normalizePassportAuth(auth),
  );

  return data.supplier_passports[0] ?? null;
}

export async function calculateReadinessScore(organizationId: string, accessToken?: string) {
  const [items, answers] = await Promise.all([
    getQuestionItems(accessToken),
    getOrganizationAnswers(organizationId, accessToken),
  ]);

  return calculatePassportReadinessScore(items, answers);
}

export async function generateSupplierPassport(
  organizationId: string,
  userId: string,
) {
  const readinessScore = await calculateReadinessScoreForUpdate(organizationId);
  const generatedAt = new Date().toISOString();
  const adminAuth = { useAdminSecret: true } as const;
  const latestPassport = await getLatestPassport(organizationId, adminAuth);

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
      adminAuth,
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
    adminAuth,
  );

  if (!data.insert_supplier_passports_one) {
    throw new Error("Supplier Passport could not be generated.");
  }

  return data.insert_supplier_passports_one;
}

async function calculateReadinessScoreForUpdate(organizationId: string) {
  const adminAuth = { useAdminSecret: true } as const;
  const [itemsData, answersData] = await Promise.all([
    executePassportGraphql<PassportReadinessItemsResponse>(
      GET_PASSPORT_READINESS_ITEMS,
      {},
      adminAuth,
      "passport_readiness_items",
    ),
    executePassportGraphql<PassportReadinessAnswersResponse>(
      GET_PASSPORT_READINESS_ANSWERS,
      { organizationId },
      adminAuth,
      "passport_readiness_answers",
    ),
  ]);

  return calculatePassportReadinessScore(itemsData.question_items, answersData.question_answers);
}

async function executePassportGraphql<TData>(
  query: string,
  variables: Record<string, unknown>,
  auth?: PassportGraphqlAuth,
  stage = "passport_graphql",
): Promise<TData> {
  if (!getNhostGraphqlUrl() || !auth) {
    throw new Error("Nhost GraphQL is not configured.");
  }

  try {
    return await executeHasuraGraphql<TData>(query, variables, auth);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown GraphQL error.";

    throw new Error(`${stage}: ${message}`);
  }
}

function normalizePassportAuth(auth?: string | PassportGraphqlAuth): PassportGraphqlAuth | undefined {
  if (typeof auth === "string") {
    return auth ? { accessToken: auth } : undefined;
  }

  return auth;
}
