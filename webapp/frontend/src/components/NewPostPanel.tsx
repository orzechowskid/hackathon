import {
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogTrigger,
  Heading as DialogTitle,
  TextArea
} from '@adobe/react-spectrum';
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
import {
  getMessageFromError
} from '../utils/error';

interface NewPostFormShape {
  text: HTMLTextAreaElement;
}

const ErrorContainer = styled.div`
    min-height: 16px;
    margin: 18px 0;
`;

const NewPostDialog = (close: () => void) => {
  const {
    create,
    error
  } = useTimeline();
  const [ formError, setFormError ] = useState<string>();
  const onSubmit = useCallback(async (e: FormSubmitEvent<NewPostFormShape>) => {
    e.preventDefault();
    setFormError(undefined);

    const {
      text
    } = e.currentTarget.elements;

    try {
      await create({
        permissions: `public`,
        text: text.value
      });
      close();
    }
    catch (ex) {
      setFormError(getMessageFromError(ex));
    }
  }, [ close, create ]);

  return (
    <Dialog>
      <DialogTitle>
        Create post
      </DialogTitle>
      <Content>
        <form
          aria-label="new-post form"
          id="new-post-form"
          onSubmit={onSubmit}
        >
          <TextArea
            id="text"
            isRequired
            label="Post text"
            type="textarea"
            width="100%"
          />
          <ErrorContainer>
            &#8203;
            {formError ?? ``}
          </ErrorContainer>
          <ButtonGroup orientation="horizontal">
            <Button
              type="submit"
              variant="cta"
            >
                submit
            </Button>
            <Button
              onPress={close}
              type="button"
              variant="secondary"
            >
                cancel
            </Button>
          </ButtonGroup>
        </form>
      </Content>
    </Dialog>
  );
};

const NewPostPanel: ChildComponent = () => {
  return (
    <DialogTrigger type="modal">
      <Button variant="cta">
        new post
      </Button>
      {NewPostDialog}
    </DialogTrigger>
  );
};

export default NewPostPanel;
