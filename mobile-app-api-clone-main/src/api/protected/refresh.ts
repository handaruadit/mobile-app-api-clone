import { OutputProtectedRefreshPost } from '@/interfaces/endpoints/protected/refresh';
import { generateJwtTokens } from '@/lib/jwt';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    /**
     * @openapi
     * /protected/refresh:
     *  post:
     *    description: /refresh
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedRefreshPost"
     */
    post: async ({ account }, res) => {
      const tokens = await generateJwtTokens({
        user: account,
        workspaceId: account.workspaceId
      });

      res.status(200).json({ tokens } satisfies OutputProtectedRefreshPost);
    }
  });
