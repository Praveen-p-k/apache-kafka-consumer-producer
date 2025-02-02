export enum EsbIntegratorEventTypes {
  RAG_AI_BACKEND_OPERATION = 'RAG_AI_BACKEND_OPERATION',
  RAG_AI_SPACETIME_DB_INTERACTION = 'RAG_AI_SpaceTimeDB_Interaction',

  BPMS_BACKEND_OPERATION = 'BPMS_BACKEND_OPERATION',
  BPMS_SPACETIME_DB_INTERACTION = 'BPMS_SpaceTimeDB_Interaction',
}

export const ESB_RAG_AI_BACKEND_URL =
  'https://rag-ai-backend.iryscloud-dev.com/api/v1/rag-ai/conversation/start';
