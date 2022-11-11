import {
  type ChildComponent,
  type InputHTMLAttributes
} from 'react';
import styled from 'styled-components';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  description?: string;
  label?: string;
  type: string;
}

const StyledLabel = styled.label`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: max-content;

  input,
  textarea {
    grid-row: 2;
    grid-column: 1;
    border: 1px solid var(--color-green-200);
    padding: 8px;
    border-radius: 2px;
    background-color: var(--color-gray-800);
  }
`;

function getInput(type: string, otherProps: object) {
  switch (type) {
    case 'textarea': {
      return <textarea {...otherProps} />
    }
    default: {
      return <input {...otherProps} type={type} />
    }
  }
}

const Input: ChildComponent<InputProps> = (props) => {
  const {
    className,
    description,
    label,
    style,
    ...otherProps
  } = props;
  const {
    id,
    type
  } = otherProps;

  return (
    <StyledLabel
      className={className}
      style={style}
    >
      <span>
        {label ?? id}
      </span>
      {getInput(type, otherProps)}
      {description ? (
        <span id={`${id}-desc`}>
          {description}
        </span>
      ) : (
        <span>&#8203;</span>
      )}
    </StyledLabel>
  );
};

export default Input;
