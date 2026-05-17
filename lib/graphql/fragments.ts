export const QUESTION_SECTION_FRAGMENT = `
  fragment QuestionSectionFields on question_sections {
    id
    code
    title
    description
    sort_order
    question_items_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const QUESTION_ITEM_FRAGMENT = `
  fragment QuestionItemFields on question_items {
    id
    section_id
    code
    title
    help_text
    answer_type
    unit
    options
    evidence_required
    questionnaire_level
    sort_order
  }
`;

export const QUESTION_ANSWER_FRAGMENT = `
  fragment QuestionAnswerFields on question_answers {
    id
    organization_id
    question_item_id
    value
    status
    internal_note
    reviewed_by
    reviewed_at
    created_at
    updated_at
    question_item {
      id
      section_id
      code
      title
      evidence_required
      question_section {
        id
        code
        title
      }
    }
  }
`;

export const DOCUMENT_FRAGMENT = `
  fragment DocumentFields on documents {
    id
    organization_id
    uploaded_by
    file_id
    file_name
    file_size_bytes
    mime_type
    document_type
    status
    expires_at
    reviewed_by
    reviewed_at
    created_at
    updated_at
  }
`;

export const DOCUMENT_LINK_FRAGMENT = `
  fragment DocumentLinkFields on document_links {
    id
    document_id
    question_answer_id
    created_at
    document {
      id
      organization_id
      file_name
      file_size_bytes
      mime_type
      document_type
      status
      expires_at
      created_at
      updated_at
    }
    question_answer {
      id
      organization_id
      question_item_id
      status
      value
      updated_at
      question_item {
        id
        code
        title
        evidence_required
        section_id
        question_section {
          id
          code
          title
        }
      }
    }
  }
`;

export const SUPPLIER_PASSPORT_FRAGMENT = `
  fragment SupplierPassportFields on supplier_passports {
    id
    organization_id
    title
    status
    readiness_score
    generated_by
    generated_at
    created_at
    updated_at
  }
`;

export const SHARE_LINK_FRAGMENT = `
  fragment ShareLinkFields on share_links {
    id
    passport_id
    organization_id
    token
    buyer_name
    buyer_email
    password_hash
    expires_at
    is_active
    document_visibility
    created_by
    created_at
  }
`;
