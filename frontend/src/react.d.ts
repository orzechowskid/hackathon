import 'react';

declare module 'react' {
  export type ButtonClickEvent = React.MouseEvent<HTMLButtonElement>;
  export interface HTMLFormElementTyped<T extends object> extends HTMLFormElement {
    elements: HTMLFormControlsCollection & T;
  };
  export interface FormSubmitEvent<T extends object> extends React.FormEvent<HTMLFormElement> {
    currentTarget: HTMLFormElementTyped<T>;
  };
  export interface StyledComponentProps {
    className?: string;
  };
  export type ParentComponent<T = {}> = React.FunctionComponent<React.PropsWithChildren<T & StyledComponentProps>>;
  export type ChildComponent<T = {}> = React.FunctionComponent<StyledComponentProps & T>;
  export type PageComponent = React.FunctionComponent<{}>;
}
