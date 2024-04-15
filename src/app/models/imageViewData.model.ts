import { UserViewData } from './userViewData.model';

export interface ImageViewData {
  $key?: string;
  totalViews?: number;
  userViews?: UserViewData[];
}
