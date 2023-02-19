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
  useEffect,
  useRef,
  useState,
  ChangeEvent
} from 'react';
import styled from 'styled-components';

import {
  useTimeline
} from '../hooks/useTimeline';
import {
  getMessageFromError
} from '../utils/error';

interface NewPostFormShape {
  newPostImage: HTMLInputElement;
  text: HTMLTextAreaElement;
}

const ErrorContainer = styled.div`
    min-height: 16px;
    margin: 18px 0;
`;

const FileUploadInput = styled.input`
    ::file-selector-button {
        background-color: tomato;
    }
`;

const NewPostDialog = (close: () => void) => {
  const {
    create,
    error
  } = useTimeline();
  const formRef = useRef<HTMLFormElement>(null);
  const [ formError, setFormError ] = useState<string>();
  const [ fileUploadSize, setFileUploadSize ] = useState<number>(0);
  const onFileSetChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFileUploadSize([ ...(e.target.files ?? []) ].reduce(
      (acc, el) => acc + el.size, 0
    ));
  }, []);
  const onSubmit = useCallback(async (e: FormSubmitEvent<NewPostFormShape>) => {
    e.preventDefault();
    setFormError(undefined);

    const formData = new FormData(e.currentTarget);

    formData.append(`permissions`, `public`);
    formData.append(`altText`, `no alt text provided`);

    try {
      await create(formData);
    }
    catch (ex) {
      setFormError(getMessageFromError(ex));
    }
  }, [ close, create ]);

  useEffect(() => {
    formRef.current?.querySelector(`textarea`)?.focus();
  }, []);

  return (
    <Dialog>
      <DialogTitle>
        Create post
      </DialogTitle>
      <Content>
        <form
          ref={formRef}
          aria-label="new-post form"
          encType="multipart/form-data"
          id="new-post-form"
          onSubmit={onSubmit}
        >
          <TextArea
            id="text"
            isRequired
            label="Post text"
            name="text"
            type="textarea"
            width="100%"
          />
          <FileUploadInput
            accept="image/*"
            id="newPostImage"
            name="newPostImage"
            onChange={onFileSetChange}
            type="file"
          />
          {fileUploadSize > 0 && (
            <div>
              (about {fileUploadSize} bytes)
            </div>
          )}
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
