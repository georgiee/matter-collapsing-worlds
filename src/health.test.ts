import { Sample } from './sample-class';
let sample: Sample;


beforeEach(() => {
  sample = new Sample();
})

test("the starter kit still works", () => {
  expect(sample.test).toBe('it works');
})