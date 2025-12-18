export interface ContactResponse {
  message: string;
  error: boolean;
  data: {
    contactTypes: ContactType[];
  };
}

export interface ContactType {
  mode: string;
  name: string;
  _id: string;
}
