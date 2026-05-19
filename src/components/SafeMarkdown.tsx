import { Fragment, ReactNode } from "react";

type SafeMarkdownProps = {
  text: string;
  className?: string;
};

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      nodes.push(<strong key={`strong-${match.index}`}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={`em-${match.index}`}>{match[3]}</em>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function SafeMarkdown({ text, className }: SafeMarkdownProps) {
  const lines = text.split(/\r?\n/);

  return (
    <div className={className}>
      {lines.map((line, index) => (
        <Fragment key={`${index}-${line.slice(0, 12)}`}>
          {renderInline(line)}
          {index < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </div>
  );
}
