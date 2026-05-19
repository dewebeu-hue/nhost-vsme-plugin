import {
  DOCUMENT_LINK_FRAGMENT,
  DOCUMENT_FRAGMENT,
  QUESTION_ANSWER_FRAGMENT,
  QUESTION_ITEM_FRAGMENT,
  QUESTION_SECTION_FRAGMENT,
  SHARE_LINK_FRAGMENT,
  SUPPLIER_PASSPORT_FRAGMENT,
} from "@/lib/graphql/fragments";

export const GET_QUESTION_SECTIONS = `
  ${QUESTION_SECTION_FRAGMENT}

  query GetQuestionSections {
    question_sections(order_by: { sort_order: asc }) {
      ...QuestionSectionFields
    }
  }
`;

export const GET_QUESTIONS_BY_SECTION = `
  ${QUESTION_ITEM_FRAGMENT}

  query GetQuestionsBySection($sectionCode: String!) {
    question_items(
      where: { question_section: { code: { _eq: $sectionCode } } }
      order_by: { sort_order: asc }
    ) {
      ...QuestionItemFields
    }
  }
`;

export const GET_QUESTION_ITEMS = `
  ${QUESTION_ITEM_FRAGMENT}

  query GetQuestionItems {
    question_items(order_by: { sort_order: asc }) {
      ...QuestionItemFields
    }
  }
`;

export const GET_ORGANIZATION_ANSWERS = `
  ${QUESTION_ANSWER_FRAGMENT}

  query GetOrganizationAnswers($organizationId: uuid!) {
    question_answers(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { updated_at: desc }
    ) {
      ...QuestionAnswerFields
    }
  }
`;

export const GET_ORGANIZATION_DOCUMENTS = `
  ${DOCUMENT_FRAGMENT}

  query GetOrganizationDocuments($organizationId: uuid!) {
    documents(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { created_at: desc }
    ) {
      ...DocumentFields
    }
  }
`;

export const GET_DOCUMENT_BY_ID = `
  ${DOCUMENT_FRAGMENT}

  query GetDocumentById($documentId: uuid!) {
    documents_by_pk(id: $documentId) {
      ...DocumentFields
    }
  }
`;

export const GET_DOCUMENT_LINKS = `
  ${DOCUMENT_LINK_FRAGMENT}

  query GetDocumentLinks($organizationId: uuid!) {
    document_links(
      where: { document: { organization_id: { _eq: $organizationId } } }
      order_by: { created_at: desc }
    ) {
      ...DocumentLinkFields
    }
  }
`;

export const GET_DOCUMENTS_FOR_ANSWER = `
  ${DOCUMENT_LINK_FRAGMENT}

  query GetDocumentsForAnswer($questionAnswerId: uuid!) {
    document_links(
      where: { question_answer_id: { _eq: $questionAnswerId } }
      order_by: { created_at: desc }
    ) {
      ...DocumentLinkFields
    }
  }
`;

export const GET_ANSWERS_FOR_DOCUMENT = `
  ${DOCUMENT_LINK_FRAGMENT}

  query GetAnswersForDocument($documentId: uuid!) {
    document_links(
      where: { document_id: { _eq: $documentId } }
      order_by: { created_at: desc }
    ) {
      ...DocumentLinkFields
    }
  }
`;

export const GET_LATEST_SUPPLIER_PASSPORT = `
  ${SUPPLIER_PASSPORT_FRAGMENT}

  query GetLatestSupplierPassport($organizationId: uuid!) {
    supplier_passports(
      where: { organization_id: { _eq: $organizationId } }
      order_by: [{ generated_at: desc_nulls_last }, { created_at: desc }]
      limit: 1
    ) {
      ...SupplierPassportFields
    }
  }
`;

export const GET_SHARE_LINK_BY_TOKEN = `
  ${SHARE_LINK_FRAGMENT}

  query GetShareLinkByToken($token: String!) {
    share_links(where: { token: { _eq: $token } }, limit: 1) {
      ...ShareLinkFields
    }
  }
`;

export const GET_PUBLIC_SHARE_ORGANIZATION = `
  query GetPublicShareOrganization($organizationId: uuid!) {
    organizations_by_pk(id: $organizationId) {
      id
      name
      slug
      industry
      employee_count_range
      headquarters_city
      headquarters_country
      countries_served
      is_verified
    }
    company_profiles(where: { organization_id: { _eq: $organizationId } }, limit: 1) {
      id
      legal_name
      trade_name
      industries
      certifications
      employee_count_range
      countries_served
    }
  }
`;

export const GET_PUBLIC_SHARE_PASSPORT = `
  ${SUPPLIER_PASSPORT_FRAGMENT}

  query GetPublicSharePassport($passportId: uuid!) {
    supplier_passports_by_pk(id: $passportId) {
      ...SupplierPassportFields
    }
  }
`;

export const GET_PUBLIC_SHARE_DOCUMENTS = `
  query GetPublicShareDocuments($organizationId: uuid!, $statuses: [String!]) {
    documents(
      where: {
        organization_id: { _eq: $organizationId }
        status: { _in: $statuses }
      }
      order_by: { created_at: desc }
    ) {
      id
      file_name
      mime_type
      document_type
      status
      expires_at
      created_at
    }
  }
`;

export const GET_PUBLIC_SHARE_DOCUMENT_LINKS = `
  query GetPublicShareDocumentLinks($documentIds: [uuid!], $questionAnswerIds: [uuid!]) {
    document_links(
      where: {
        document_id: { _in: $documentIds }
        question_answer_id: { _in: $questionAnswerIds }
      }
    ) {
      id
      document_id
      question_answer_id
    }
  }
`;

export const GET_PUBLIC_SHARE_QUESTIONNAIRE = `
  query GetPublicShareQuestionnaire($organizationId: uuid!) {
    question_sections(order_by: { sort_order: asc }) {
      id
      code
      title
    }
    question_items(order_by: { sort_order: asc }) {
      id
      section_id
      code
      title
      evidence_required
    }
    question_answers(
      where: { organization_id: { _eq: $organizationId } }
      order_by: { updated_at: desc }
    ) {
      id
      question_item_id
      status
    }
  }
`;

export const GET_PUBLIC_SHARE_DOCUMENT_ACCESS = `
  query GetPublicShareDocumentAccess($documentId: uuid!, $organizationId: uuid!) {
    documents_by_pk(id: $documentId) {
      id
      organization_id
      file_id
      file_name
      mime_type
      document_type
      status
      expires_at
      created_at
      document_links(
        where: { question_answer: { organization_id: { _eq: $organizationId } } }
        limit: 1
      ) {
        id
        question_answer_id
      }
    }
  }
`;
