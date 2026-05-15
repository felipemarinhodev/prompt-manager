import { PromptList, type PromptListProps } from '@/components/prompts';
import { render, screen } from '@/lib/test-utils';

const makeSut = ({ prompts }: PromptListProps) => {
  return render(<PromptList prompts={prompts} />);
};
describe('PromptList', () => {
  it('should render the prompt list correctly', () => {
    const prompts = [
      { id: '1', title: 'Prompt 1', content: 'Description 1' },
      { id: '2', title: 'Prompt 2', content: 'Description 2' },
    ];
    makeSut({ prompts });
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(prompts.length);
    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
    expect(screen.getByText('Prompt 2')).toBeInTheDocument();
  });
  it('should not render any prompts when the list is empty', () => {
    const prompts = [] as PromptListProps['prompts'];
    makeSut({ prompts });
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(prompts.length);
  });
});
