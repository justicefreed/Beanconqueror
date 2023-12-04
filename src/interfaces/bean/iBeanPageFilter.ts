import { BEAN_ROASTING_TYPE_ENUM } from '../../enums/beans/beanRoastingType';

export interface IBeanPageFilter {
  // Properties
  favourite: boolean;
  include_frozen: boolean;
  rating: {
    upper: number;
    lower: number;
  };
  roast_range: {
    upper: number;
    lower: number;
  };
  bean_roasting_type: Array<BEAN_ROASTING_TYPE_ENUM>;
  roastingDateStart: string;
  roastingDateEnd: string;
  bean_roaster: Array<string>;
}
