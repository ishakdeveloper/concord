import { createCachedProcedure } from '../../trpc';

export const me = createCachedProcedure({
  key: 'me',
  protected: true,
}).query(({ ctx }) => {
  return { user: ctx.user };
});
