import {
  Button as SpectrumButton,
  type SpectrumButtonProps
} from '@adobe/react-spectrum';
import {
  type ParentComponent,
  type RefObject
} from 'react';

export interface ButtonProps extends SpectrumButtonProps {
  buttonRef?: RefObject<HTMLButtonElement>;
};

const Button: ParentComponent<ButtonProps> = (props) => {
  return (
    <SpectrumButton {...props} />
  );
};

export default Button;
