import {
  type ChildComponent
} from 'react';
import QRCode from 'react-qr-code';
import styled from 'styled-components';

const Container = styled.span`
  display: inline-block;
  background: white;
  padding: 16px;
`;

const QR: ChildComponent<{ size: number; value: string }> = (props) => {
  const {
    size,
    value,
    ...otherProps
  } = props;
  return (
    <Container {...otherProps}>
      <QRCode
        size={size}
        value={value}
      />
    </Container>
  );
};

export default QR;
