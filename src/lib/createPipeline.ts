export function createPipelineBaseField(fields: Record<string, any>, exclude: string[] = []) {
  return Object.keys(fields)
    .filter(key => !exclude.includes(key))
    .reduce((acc: any, key: any) => {
      acc[key] = 1;
      return acc;
    }, {});
}

export function createPipelineCalculateField(fields: Record<string, any>, exclude: string[] = []) {
  return Object.keys(fields)
    .filter(key => !exclude.includes(key))
    .reduce((acc: any, key: any) => {
      const [operation, ...fieldParts] = key.split('_');
      let mongoOperator;

      switch (operation) {
        case 'max':
          mongoOperator = '$max';
          break;
        case 'min':
          mongoOperator = '$min';
          break;
        case 'avg':
          mongoOperator = '$avg';
          break;
        case 'total':
          mongoOperator = '$sum';
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      acc[key] = { [mongoOperator]: `$${fieldParts.join('_')}` };
      return acc;
    }, {});
}
