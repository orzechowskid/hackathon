import {
  type ButtonHTMLAttributes,
  type ParentComponent
} from 'react';
import styled from 'styled-components';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
};

const StyledButton = styled.button`
  padding: 8px;
  border-radius: 2px;
  color: var(--color-gray-800);
  background-color: var(--color-green-400);

  &:hover {
    background-color: var(--color-green-500);
  }

  &:active {
    background-color: var(--color-green-300);
  }
`;

const Button: ParentComponent<ButtonProps> = (props) => {
  return (
    <StyledButton {...props} />
  );
};

export default Button;
