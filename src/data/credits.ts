/**
 * Third-party assets and their licences.
 *
 * The CRT model is CC-BY 3.0, so crediting it is a licence condition, not a
 * courtesy. Keep this rendered somewhere user-visible.
 */

export type Credit = {
  title: string;
  author: string;
  licence: string;
  licenceUrl: string;
  sourceUrl: string;
};

export const credits: Credit[] = [
  {
    title: 'Computer 90s (Gateway 2000)',
    author: 'Charlie',
    licence: 'CC-BY 3.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://poly.pizza/m/Bw55oYsbp8'
  }
];
