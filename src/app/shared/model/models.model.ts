export class CustomTableColumnInputOption {
  type: "text" | "number" | "date" | "select" | "checkbox" | "datetime" | "link";
  required: boolean;
  min?: number;
  max?: number;
  step?: number;
  selectData?: any[];
  selectValue?: string;
  selectLibelle?: string;
}

export class CustomTableColumn {
  field: string;
  header: string;
  visible?: boolean;
  dataType: "string" | "number" | "date" | "datetime" | "bool" | "link";
  TextTrue?: string;
  TextFalse?: string;
  inputOptions?: CustomTableColumnInputOption;
}

export class CustomTable {
  title: string;
  type: string;
  noDataMessage: string;
  total?: number;
  columns?: CustomTableColumn[];
}

export class keycloakUser {
  id: string;
  attributes: any;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  username: string;
  userProfileMetadata: {
    attributes: any[],
  };
  FullName: string;
}