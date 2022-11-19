import {
  type ChildComponent,
  type FormSubmitEvent,
  useCallback,
  useState
} from 'react';
import styled from 'styled-components';
import {
  useTimeline
} from '../hooks/useTimeline';

import Button from './Button';
import Input from './Input';

export interface NewPostPanelProps {
  onCreatePost?: () => void;
};

interface NewPostFormShape {
  text: HTMLTextAreaElement;
}

const NewPostFormContainer = styled.form`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin: 24px;
  border-radius: 2px;
  padding: 24px;
  background: var(--color-gray-800);
  border: 1px solid var(--color-gray-700);
  max-width: 640px;

  textarea {
    height: 240px;
  }
`;

const NewPostContainer = styled.div`
  position: relative;
`;

const NewPostPanel: ChildComponent<NewPostPanelProps> = (props) => {
  const {
    onCreatePost,
    ...otherProps
  } = props;
  const {
    create,
    error
  } = useTimeline();
  const [ showForm, setShowForm ] = useState<boolean>(false);
  const [ formError, setFormError ] = useState<string>();
  const onClick = useCallback(() => { setShowForm(true); }, []);
  const onCancel = useCallback(() => { setShowForm(false); }, []);
  const onSubmit = useCallback(async (e: FormSubmitEvent<NewPostFormShape>) => {
    e.preventDefault();
    setFormError(undefined);

    const {
      text
    } = e.currentTarget.elements;

    try {
      const result = await create({
        permissions: 'public',
        text: text.value
      });

      setShowForm(false);
      onCreatePost?.();
    }
    catch (ex: any) {
      console.error(ex);
      setFormError(ex.message);
    }
  }, []);

  return (
    <NewPostContainer {...otherProps}>
      <div>
        <Button onClick={onClick}>
          new post
        </Button>
      </div>
      {showForm && (
        <NewPostFormContainer onSubmit={onSubmit}>
          <Input
            id="text"
            label="Post text"
            type="textarea"
          />
          <div>
            {formError}&nbsp;
          </div>
          <Button type="submit">Let's go!</Button>
          <Button type="button" onClick={onCancel}>Cancel</Button>
        </NewPostFormContainer>
      )}
    </NewPostContainer>
  );
};

export default NewPostPanel;
