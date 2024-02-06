import PropTypes from 'prop-types';

const Button = ({ onClick, children, type, className }) => {
  return (
    <button type={type} className={className} onClick={onClick}>
      {children}
    </button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
};

Button.defaultProps = {
  type: 'button',
  className: '',
};

export default Button;