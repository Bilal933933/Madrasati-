export interface Chunk {
  id: string;
  heading: string;
  text: string;
  startPage: number | null;
  endPage: number | null;
  wordCount: number;
}

export interface ChunkOptions {
  targetWords?: number;
  overlapWords?: number;
}

const HEADING_REGEX = /^(#{1,6})\s+(.+)$/;
const PAGE_REGEX = /صفحة\s*(\d+)/;

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

function lastWords(text: string, count: number): string {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  return words.slice(-count).join(' ');
}

interface Section {
  heading: string;
  page: number | null;
  paragraphs: string[];
}

function collectSections(body: string): Section[] {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  const sections: Section[] = [];
  let current: Section | null = null;
  let lastPage: number | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    const headingMatch = HEADING_REGEX.exec(line);
    if (headingMatch) {
      const heading = headingMatch[2].trim();
      const pageMatch = PAGE_REGEX.exec(heading);
      if (pageMatch) {
        lastPage = parseInt(pageMatch[1], 10);
      }
      sections.push((current = { heading, page: lastPage, paragraphs: [] }));
      continue;
    }
    if (current && line.length > 0) {
      current.paragraphs.push(line);
    } else if (!current && line.length > 0) {
      sections.push(
        (current = {
          heading: '(بدون عنوان)',
          page: lastPage,
          paragraphs: [line],
        }),
      );
    }
  }

  let knownPage: number | null = null;
  for (const section of sections) {
    if (section.page != null) {
      knownPage = section.page;
    } else {
      section.page = knownPage;
    }
  }

  return sections;
}

function mergeHeadingOnlySections(sections: Section[]): Section[] {
  const merged: Section[] = [];
  const pendingPrefixes: string[] = [];

  for (const section of sections) {
    if (section.paragraphs.length === 0 && section.page == null) {
      pendingPrefixes.push(section.heading);
      continue;
    }
    if (pendingPrefixes.length > 0) {
      section.heading = [...pendingPrefixes, section.heading]
        .filter(Boolean)
        .join(' / ');
      pendingPrefixes.length = 0;
    }
    merged.push(section);
  }

  if (pendingPrefixes.length > 0 && merged.length > 0) {
    merged[merged.length - 1].heading = [
      ...pendingPrefixes,
      merged[merged.length - 1].heading,
    ]
      .filter(Boolean)
      .join(' / ');
  }

  return merged;
}

function splitOverlongSection(
  section: Section,
  targetWords: number,
  overlapWords: number,
): string[] {
  const fullText = section.paragraphs.join('\n\n');
  if (countWords(fullText) <= targetWords) {
    return [fullText];
  }

  const pieces: string[] = [];
  let current: string[] = [];
  let currentWords = 0;
  let overlapPrefix = '';

  for (const paragraph of section.paragraphs) {
    const words = countWords(paragraph);
    if (current.length > 0 && currentWords + words > targetWords) {
      const piece =
        (overlapPrefix ? `${overlapPrefix}\n\n` : '') + current.join('\n\n');
      pieces.push(piece);
      overlapPrefix = lastWords(piece, overlapWords);
      current = [];
      currentWords = 0;
    }
    current.push(paragraph);
    currentWords += words;
  }

  if (current.length > 0) {
    pieces.push(
      (overlapPrefix ? `${overlapPrefix}\n\n` : '') + current.join('\n\n'),
    );
  } else if (overlapPrefix.length > 0) {
    pieces.push(overlapPrefix);
  }

  const result: string[] = [];
  for (const piece of pieces) {
    if (countWords(piece) <= targetWords) {
      result.push(piece);
      continue;
    }
    const words = piece.split(/\s+/).filter((w) => w.length > 0);
    let start = 0;
    while (start < words.length) {
      const end = Math.min(words.length, start + targetWords);
      result.push(words.slice(start, end).join(' '));
      start = Math.min(words.length, end - overlapWords);
    }
  }

  return result;
}

export function splitMarkdown(
  body: string,
  options: ChunkOptions = {},
): Chunk[] {
  const targetWords = options.targetWords ?? 800;
  const overlapWords = options.overlapWords ?? 100;

  const sections = mergeHeadingOnlySections(collectSections(body));
  const chunks: Chunk[] = [];
  let counter = 0;

  let buffer: string[] = [];
  let bufferWords = 0;
  let bufferHeading = '';
  let bufferStartPage: number | null = null;
  let bufferEndPage: number | null = null;

  const flush = (): void => {
    if (buffer.length === 0) {
      return;
    }
    counter += 1;
    const text = buffer.join('\n\n');
    chunks.push({
      id: `c-${String(counter).padStart(3, '0')}`,
      heading: bufferHeading,
      text,
      startPage: bufferStartPage,
      endPage: bufferEndPage,
      wordCount: countWords(text),
    });
    buffer = [];
    bufferWords = 0;
    bufferHeading = '';
    bufferStartPage = null;
    bufferEndPage = null;
  };

  for (const section of sections) {
    if (section.paragraphs.length === 0) {
      continue;
    }
    for (const atom of splitOverlongSection(
      section,
      targetWords,
      overlapWords,
    )) {
      const atomsWords = countWords(atom);
      if (buffer.length > 0 && bufferWords + atomsWords > targetWords) {
        flush();
      }
      if (buffer.length === 0) {
        bufferHeading = section.heading;
        bufferStartPage = section.page;
        bufferEndPage = section.page;
      } else if (section.page != null) {
        bufferEndPage = section.page;
      }
      buffer.push(atom);
      bufferWords += atomsWords;
      if (bufferWords >= targetWords) {
        flush();
      }
    }
  }

  flush();

  return chunks;
}
