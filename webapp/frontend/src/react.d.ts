import 'react';

declare module 'react' {
  export type ClickEvent<T extends HTMLElement> = React.MouseEvent<T>;
  export type ButtonClickEvent = ClickEvent<HTMLButtonElement>;
  export interface HTMLFormElementTyped<T extends object> extends HTMLFormElement {
    elements: HTMLFormControlsCollection & T;
  };
  export interface FormSubmitEvent<T extends object> extends React.FormEvent<HTMLFormElement> {
    currentTarget: HTMLFormElementTyped<T>;
  };
  export interface StyledComponentProps {
    className?: string;
  };
  export type ParentComponent<T = {}> = React.FunctionComponent<React.PropsWithChildren<StyledComponentProps & T>>;
  export type ChildComponent<T = {}> = React.FunctionComponent<StyledComponentProps & T>;
  export type PageComponent = React.FunctionComponent<{}>;
}
