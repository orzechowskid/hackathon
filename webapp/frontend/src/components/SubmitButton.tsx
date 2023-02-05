import {
  type SpectrumButtonProps,
  Button
} from '@adobe/react-spectrum';
import {
  type ParentComponent,
  useCallback
} from 'react';

import {
  getMessageFromError
} from '../utils/error';

interface SubmitButtonProps extends Omit<SpectrumButtonProps, `variant`> {
  close: () => void;
  onSubmit: () => void|Promise<void>;
  variant?: SpectrumButtonProps[`variant`];
}

const SubmitButton: ParentComponent<SubmitButtonProps> = (props) => {
  const {
    close,
    onSubmit,
    variant = `cta`,
    ...otherProps
  } = props;
  const onSubmitHack = useCallback(async () => {
    try {
      await onSubmit();
      close();
    }
    catch (ex) {
      console.error(getMessageFromError(ex));
    }
  }, [ close, onSubmit ]);

  return (
    <Button
      {...otherProps}
      onPressEnd={onSubmitHack}
      variant={variant}
    />
  );
}

export default SubmitButton;
