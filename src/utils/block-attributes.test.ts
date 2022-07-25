import { generateResponsiveAttributes } from './block-attributes';

test('it should generate correct responsive attributes', () => {
  let ob = generateResponsiveAttributes('width', {
    type: 'number'
  });
});
