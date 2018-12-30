import { DOMBodyQuery } from './dom-body-query';

let query: DOMBodyQuery;

beforeEach(() => {
  query = new DOMBodyQuery();
})

test('find returns a list of bodies', () => {
  const bodies = query.find();
  console.log(document.body)
  expect(bodies).toBeInstanceOf(Array);
});
