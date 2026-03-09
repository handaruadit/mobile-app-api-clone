// import { v4 as UUIDV4 } from 'uuid';
import resource from '@/middleware/resource-router-middleware';
import { exportData } from '@/models';

export default () =>
  resource({
    /**
     * @openapi
     * /public/login:
     *  post:
     *    description: /login
     *    tags:
     *      - public
     *    requestBody:
     *      required: true
     *      content:
     *        application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/InputPublicLoginPostBody"
     *    responses:
     *      200:
     *        content:
     *         application/json:
     *          schema:
     *            "$ref": "./components.yaml#/components/schemas/OutputPublicLoginPost"
     */
    post: async ({ body }, res) => {
      const data = await exportData.create(body);
      res.status(200).json({ data });
    },
    list: async (req, res) => {
      const data = await exportData.find({});
      res.status(200).json({ data });
    }
  });
