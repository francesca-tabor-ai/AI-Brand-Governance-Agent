/** Row shape for the Airtable "Governance Reviews" table */
export interface AirtableGovernanceReview {
  id?: string;
  fields: {
    "Record ID": string;
    "Export Event ID": string;
    "Created At": string;
    "Brand": string;
    "Market": string;
    "Channel": string;
    "Document Name": string;
    "Exported By": string;
    "Application": string;
    "Format": string;
    "Compliance Score": number;
    "Decision": string;
    "Decision Reason": string;
    "Hard Violations": number;
    "Soft Violations": number;
    "Auto-Fixes Applied": number;
    "Phase": string;
    "Status":
      | "Pending"
      | "Approved"
      | "Rejected"
      | "Under Review"
      | "Fixed";
    "Reviewer": string;
    "Review Notes": string;
    "Violations Summary": string;
    "Fixes Summary": string;
  };
}

/** Row shape for the Airtable "Brand Rules" table */
export interface AirtableBrandRule {
  id?: string;
  fields: {
    "Rule ID": string;
    "Name": string;
    "Description": string;
    "Category": string;
    "Severity": string;
    "Action": string;
    "Enabled": boolean;
    "Brands": string[];
    "Markets": string[];
    "Channels": string[];
    /** JSON string of rule parameters */
    "Parameters": string;
    "Weight": number;
    "Last Updated": string;
  };
}

/** Row shape for the Airtable "Audit Log" table */
export interface AirtableAuditLog {
  id?: string;
  fields: {
    "Timestamp": string;
    "Event Type": string;
    "Record ID": string;
    "User": string;
    "Action": string;
    "Detail": string;
    "Before Value": string;
    "After Value": string;
  };
}
