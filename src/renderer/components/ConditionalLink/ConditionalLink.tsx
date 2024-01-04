import { Link } from 'react-router-dom';

export const ConditionalLink = ({ children, to, disabled, ...props }) => ((!disabled && to)
  ? <Link to={to} {...props}>{children}</Link>
  : { children });
