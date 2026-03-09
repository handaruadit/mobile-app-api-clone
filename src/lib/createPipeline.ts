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
      const [operation, ...fieldParts] = key.split(/([A-Z]{1}\w*)/, 2);
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
      const comPart = fieldParts[0].split('');
      comPart[0] = comPart[0].toLowerCase();
      acc[key] = { [mongoOperator]: `$${comPart.join('')}` };

      return acc;
    }, {});
}
