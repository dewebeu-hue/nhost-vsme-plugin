import { NextResponse } from "next/server";
import {
  AuthenticationRequiredError,
  getAuthTokenForGraphQL,
  requireCurrentUser,
} from "@/lib/auth/session";
import { getPrimaryOrganizationForUser } from "@/lib/data/organizations";
import {
  type GraphqlJson,
  isQuestionnaireBackendConfigured,
  saveQuestionnaireAnswers,
} from "@/lib/data/questionnaire";
import type { QuestionAnswerStatus } from "@/lib/types";

type SaveAnswerPayload = {
  organizationId?: unknown;
  answers?: unknown;
};

type AnswerInput = {
  questionItemId: string;
  value: GraphqlJson;
  status: QuestionAnswerStatus;
  internalNote?: string;
};

const allowedStatuses: QuestionAnswerStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "needs_evidence",
  "reviewed",
];

export async function POST(request: Request) {
  if (!isQuestionnaireBackendConfigured()) {
    return NextResponse.json(
      { error: "Nhost is not configured yet. Your questionnaire changes remain in mock mode." },
      { status: 503 },
    );
  }

  try {
    const user = await requireCurrentUser(request);
    const accessToken = await getAuthTokenForGraphQL(request);
    const payload = (await request.json()) as SaveAnswerPayload;
    const organizationId = readString(payload.organizationId);

    if (!accessToken) {
      return NextResponse.json({ error: "Please sign in before saving answers." }, { status: 401 });
    }

    if (!isUuid(organizationId)) {
      return NextResponse.json({ error: "A valid organization is required." }, { status: 400 });
    }

    const organization = await getPrimaryOrganizationForUser(user.id, accessToken);

    if (!organization || organization.id !== organizationId) {
      return NextResponse.json(
        { error: "We could not confirm access to this workspace." },
        { status: 403 },
      );
    }

    const answers = parseAnswers(payload.answers);

    if (!answers.length) {
      return NextResponse.json({ saved: [] });
    }

    const saved = await saveQuestionnaireAnswers({ organizationId, answers }, accessToken);

    return NextResponse.json({ saved });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ error: "Please sign in before saving answers." }, { status: 401 });
    }

    console.error("Unable to save questionnaire answers", error);

    if (error instanceof Error && /permission|access|not found/i.test(error.message)) {
      return NextResponse.json(
        { error: "You do not have permission to update this questionnaire." },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "We could not save your answers right now. Please try again." },
      { status: 500 },
    );
  }
}

function parseAnswers(value: unknown): AnswerInput[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): AnswerInput[] => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const questionItemId = readString(record.questionItemId);
    const status = readStatus(record.status);

    if (!isUuid(questionItemId) || !status || !isGraphqlJson(record.value)) {
      return [];
    }

    const internalNote = readString(record.internalNote);

    return [
      {
        questionItemId,
        value: record.value,
        status,
        internalNote: internalNote || undefined,
      },
    ];
  });
}

function readStatus(value: unknown): QuestionAnswerStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  return allowedStatuses.includes(value as QuestionAnswerStatus)
    ? (value as QuestionAnswerStatus)
    : null;
}

function isGraphqlJson(value: unknown): value is GraphqlJson {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isGraphqlJson);
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).every(isGraphqlJson);
  }

  return false;
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
