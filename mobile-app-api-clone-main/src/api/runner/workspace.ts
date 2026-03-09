import { workspace as entity } from '@/models';

import { OutputRunnerWorkspaceGet } from '@/interfaces/endpoints/runner/workspace';
import Exception from '@/lib/exception';
import resource from '@/middleware/resource-router-middleware';

export default () =>
  resource({
    /**
     * @openapi
     * /runner/workspace/{id}:
     *  get:
     *    description: /workspace/{id}
     *    tags:
     *      - runner
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputRunnerWorkspaceGet"
     */
    read: async ({ params }, res) => {
      try {
        const [workspace] = await entity.findOrigin({
          _id: params.id
        });
        res.json({ workspace } satisfies OutputRunnerWorkspaceGet);
      } catch (error) {
        Exception.parseError(res, error);
      }
    }
  });
