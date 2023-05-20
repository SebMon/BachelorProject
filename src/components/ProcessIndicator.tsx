import React, { forwardRef } from 'react';
import type { LegacyRef } from 'react';
import { Dropdown } from 'react-bootstrap';
import type { Process } from '../App';

interface CustomToggleProps {
  onClick: () => void;
}
// eslint-disable-next-line react/display-name
const CustomToggle = forwardRef(
  ({ onClick }: CustomToggleProps, ref): JSX.Element => (
    <button ref={ref as LegacyRef<HTMLButtonElement>} className="btn btn-lg rounded-circle" onClick={onClick}>
      <div className="spinner-border text-light" role="status"></div>
    </button>
  )
);

interface ProcessIndicatorProps {
  items: Process[];
}

export default function ProcessIndicator(props: ProcessIndicatorProps): JSX.Element {
  return (
    <Dropdown drop="up" className="position-absolute top-0 start-00 pt-1 ps-1 rounded-circle">
      <Dropdown.Toggle as={CustomToggle}></Dropdown.Toggle>
      <Dropdown.Menu>
        <ul className="list-group">
          {props.items.map((item) => {
            return (
              <li key={item.UUID} className="list-group-item">
                {item.name}
              </li>
            );
          })}
        </ul>
      </Dropdown.Menu>
    </Dropdown>
  );
}
