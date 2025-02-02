export interface InboundKafkaAccountingJournal {
  id: string | null;
  reference_id: string | null;
  transaction_type: string | null;
  transaction_line: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | null;
  created_at: string | null;
  created_by_id: string | null;
  last_modified_at: string | null;
  last_modified_by_id: string | null;
}
