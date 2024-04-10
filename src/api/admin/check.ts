import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    /**
     * @openapi
     * /admin/check:
     *  get:
     *    description: /user
     *    tags:
     *      - protected
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputProtectedUserList"
     */
    list: ({ account }, res) => {
      try {
        if (!account.isAdmin) {
          Exception.forbidden(res);
          return;
        }
        res.json({ code: true } satisfies { code: boolean });
      } catch (error) {
        Exception.serverError(res);
      }
    },
  });
