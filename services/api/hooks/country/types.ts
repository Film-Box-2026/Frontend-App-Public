export interface CountryItem {
  _id: string;
  name: string;
  slug: string;
}

export interface GetCountriesResponse {
  data: CountryItem[];
}
