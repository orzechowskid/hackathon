import {
  type ButtonHTMLAttributes,
  type ParentComponent
} from 'react';
import styled from 'styled-components';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
};

const StyledButton = styled.button`
  background-color: transparent;
  color: var(--color-body-text);

  &[disabled] {
    color: var(--color-button-disabled);
  }
`;

const Button: ParentComponent<ButtonProps> = (props) => {
  return (
    <StyledButton {...props} />
  );
};

export default styled(Button)``;
