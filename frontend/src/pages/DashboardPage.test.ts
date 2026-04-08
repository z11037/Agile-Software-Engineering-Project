import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { UNIVERSITY_RESOURCE_LINKS, UniversityResourceLinks } from './DashboardPage';

describe('dashboard university resource links', () => {
  it('keeps official labels and URLs', () => {
    expect(UNIVERSITY_RESOURCE_LINKS).toEqual([
      {
        label: 'Mydundee',
        href: 'https://my.dundee.ac.uk/',
        ariaLabel: 'Open Mydundee official portal in a new tab',
      },
      {
        label: 'Student life',
        href: 'https://www.dundee.ac.uk/student-life',
        ariaLabel: 'Open University of Dundee Student life page in a new tab',
      },
    ]);
  });

  it('renders both links as new-tab accessible anchors', () => {
    const html = renderToStaticMarkup(React.createElement(UniversityResourceLinks));

    expect(html).toContain('>Mydundee<');
    expect(html).toContain('>Student life<');
    expect(html).toContain('href="https://my.dundee.ac.uk/"');
    expect(html).toContain('href="https://www.dundee.ac.uk/student-life"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noreferrer noopener"');
    expect(html).toContain('aria-label="Open Mydundee official portal in a new tab"');
    expect(html).toContain('aria-label="Open University of Dundee Student life page in a new tab"');
  });
});
