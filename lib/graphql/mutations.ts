import {
  DOCUMENT_FRAGMENT,
  DOCUMENT_LINK_FRAGMENT,
  QUESTION_ANSWER_FRAGMENT,
  SHARE_LINK_FRAGMENT,
  SUPPLIER_PASSPORT_FRAGMENT,
} from "@/lib/graphql/fragments";

export const UPSERT_QUESTION_ANSWER = `
  ${QUESTION_ANSWER_FRAGMENT}

  mutation UpsertQuestionAnswer($object: question_answers_insert_input!) {
    insert_question_answers_one(
      object: $object
      on_conflict: {
        constraint: question_answers_organization_id_question_item_id_key
        update_columns: [value, status, internal_note]
      }
    ) {
      ...QuestionAnswerFields
    }
  }
`;

export const INSERT_DOCUMENT = `
  ${DOCUMENT_FRAGMENT}

  mutation InsertDocument($object: documents_insert_input!) {
    insert_documents_one(object: $object) {
      ...DocumentFields
    }
  }
`;

export const UPDATE_DOCUMENT_STATUS = `
  ${DOCUMENT_FRAGMENT}

  mutation UpdateDocumentStatus($documentId: uuid!, $status: String!) {
    update_documents_by_pk(pk_columns: { id: $documentId }, _set: { status: $status }) {
      ...DocumentFields
    }
  }
`;

export const DELETE_DOCUMENT = `
  ${DOCUMENT_FRAGMENT}

  mutation DeleteDocument($documentId: uuid!) {
    delete_documents_by_pk(id: $documentId) {
      ...DocumentFields
    }
  }
`;

export const LINK_DOCUMENT_TO_ANSWER = `
  ${DOCUMENT_LINK_FRAGMENT}

  mutation LinkDocumentToAnswer($object: document_links_insert_input!) {
    insert_document_links_one(
      object: $object
      on_conflict: {
        constraint: document_links_document_id_question_answer_id_key
        update_columns: [created_at]
      }
    ) {
      ...DocumentLinkFields
    }
  }
`;

export const UNLINK_DOCUMENT_FROM_ANSWER = `
  ${DOCUMENT_LINK_FRAGMENT}

  mutation UnlinkDocumentFromAnswer($documentId: uuid!, $questionAnswerId: uuid!) {
    delete_document_links(
      where: {
        document_id: { _eq: $documentId }
        question_answer_id: { _eq: $questionAnswerId }
      }
    ) {
      returning {
        ...DocumentLinkFields
      }
    }
  }
`;

export const INSERT_SUPPLIER_PASSPORT = `
  ${SUPPLIER_PASSPORT_FRAGMENT}

  mutation InsertSupplierPassport($object: supplier_passports_insert_input!) {
    insert_supplier_passports_one(object: $object) {
      ...SupplierPassportFields
    }
  }
`;

export const UPDATE_SUPPLIER_PASSPORT = `
  ${SUPPLIER_PASSPORT_FRAGMENT}

  mutation UpdateSupplierPassport($passportId: uuid!, $set: supplier_passports_set_input!) {
    update_supplier_passports_by_pk(pk_columns: { id: $passportId }, _set: $set) {
      ...SupplierPassportFields
    }
  }
`;

export const INSERT_SHARE_LINK = `
  ${SHARE_LINK_FRAGMENT}

  mutation InsertShareLink($object: share_links_insert_input!) {
    insert_share_links_one(object: $object) {
      ...ShareLinkFields
    }
  }
`;

export const UPDATE_SHARE_LINK = `
  ${SHARE_LINK_FRAGMENT}

  mutation UpdateShareLink($shareLinkId: uuid!, $set: share_links_set_input!) {
    update_share_links_by_pk(pk_columns: { id: $shareLinkId }, _set: $set) {
      ...ShareLinkFields
    }
  }
`;

export const INSERT_SHARE_LINK_ACCESS = `
  mutation InsertShareLinkAccess($object: share_link_accesses_insert_input!) {
    insert_share_link_accesses_one(object: $object) {
      id
      share_link_id
      accessed_at
    }
  }
`;
