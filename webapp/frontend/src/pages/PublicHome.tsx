import {
  type PageComponent
} from 'react';
import {
  Link
} from 'react-router-dom';

const PublicHome: PageComponent = () => (
  <div>
    <h1>{window.location.hostname}</h1>
    <div>
      <Link to="/login">Log in</Link>
    </div>
  </div>
);

export default PublicHome;
