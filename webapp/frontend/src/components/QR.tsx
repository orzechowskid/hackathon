import qrcode from 'qrcode';
import {
  type ChildComponent,
  useEffect,
  useRef
} from 'react';

interface QRProps {
  value: string;
}

const QR: ChildComponent<QRProps> = (props) => {
  const {
    value,
    ...otherProps
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    qrcode.toCanvas(canvasRef.current, props.value);
  }, [ props.value ]);

  return (
    <canvas
      ref={canvasRef}
      {...otherProps}
    />
  );
};

export default QR;
