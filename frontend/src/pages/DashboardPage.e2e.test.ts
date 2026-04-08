import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { UniversityResourceLinks } from './DashboardPage';

describe('dashboard resources e2e-style flow', () => {
  it('shows links and preserves destination when user clicks', () => {
    const html = renderToStaticMarkup(React.createElement(UniversityResourceLinks));
    const anchorMatches = html.match(/<a\b[^>]*>.*?<\/a>/g) ?? [];

    expect(anchorMatches).toHaveLength(2);

    const myDundee = anchorMatches.find((anchor) => anchor.includes('>Mydundee<'));
    const studentLife = anchorMatches.find((anchor) => anchor.includes('>Student life<'));

    expect(myDundee).toContain('target="_blank"');
    expect(myDundee).toContain('href="https://my.dundee.ac.uk/"');

    expect(studentLife).toContain('target="_blank"');
    expect(studentLife).toContain('href="https://www.dundee.ac.uk/student-life"');
  });
});
