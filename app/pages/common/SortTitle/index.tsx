import KeyHint from '~/components/ui-kit/KeyHint';
import TextureTitleSort from '~/components/ui-kit/TextureTitleSort';

interface SortTitleProps {
  title: string;
  sort: { label: string; descending: boolean; next: () => void; flip: () => void };
}

const SortTitle = ({ title, sort }: SortTitleProps) => (
  <TextureTitleSort
    title={title}
    className="absolute left-[4px] top-[193px]"
    sortKey={
      <button
        type="button"
        className="contents cursor-pointer"
        onClick={sort.next}
        aria-label={`Sort by: ${sort.label}. Change sort`}
      >
        <KeyHint
          keyLabel="X"
          tone="x"
          className="[&_.KeyHint-key]:size-[40px] [&_.KeyHint-key]:text-[20px]"
        />
      </button>
    }
    sort={sort.label}
    aside={
      <button type="button" className="contents cursor-pointer" onClick={sort.flip}>
        <KeyHint
          keyLabel="R"
          label={sort.descending ? 'Descending' : 'Ascending'}
          className="[&_.KeyHint-label]:text-[30px]"
        />
      </button>
    }
  />
);

export default SortTitle;
