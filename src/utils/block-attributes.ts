type ResponsiveDevice = 'Desktop' | 'Tablet' | 'Mobile';

type AttributesType = Record<string, Object>

export const generateResponsiveAttributes = (name: String, attributes: AttributesType): Record<string, Object> => {
  const suffixes = ['Desktop', 'Tablet', 'Mobile'];

  const newAttributes: Record<string, any> = {};

  for (let suffix of suffixes) {
    const responsiveName = `${name}${suffix}`;

    newAttributes[responsiveName] = { ...attributes };
  }

  return newAttributes;
};
