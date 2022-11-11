import {
  useRemoteCollection
} from './useRemoteData/useRemoteCollection';

export interface PostDTO {
  author: string;
  created_at: string;
  permissions: 'public' | 'protected' | 'private';
  tags: string[];
  text: string;
  title: string;
  uuid: string;
}

const usePrivatePosts = () =>
  useRemoteCollection<PostDTO>('/api/1/my/posts');

const usePublicPosts = () =>
  useRemoteCollection<PostDTO>('/api/1/public/posts');

export {
  usePrivatePosts,
  usePublicPosts
};
