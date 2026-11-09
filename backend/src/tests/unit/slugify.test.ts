import { slugify } from '../../utils/slugify';

describe('slugify', () => {
  it('lowercases category names', () => {
    expect(slugify('Electronics')).toBe('electronics');
  });

  it('strips apostrophes without inserting a hyphen', () => {
    expect(slugify("men's clothing")).toBe('mens-clothing');
  });

  it('collapses runs of non-alphanumeric characters into a single hyphen', () => {
    expect(slugify("women's   clothing!!")).toBe('womens-clothing');
  });
});
