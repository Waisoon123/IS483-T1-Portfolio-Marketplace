import styles from './Input.module.css';

const Input = ({
  register,
  type,
  name,
  placeholder,
  isDisabled = false,
  isRequired = false,
  requiredErrorMessage,
  validateInputFunction,
}) => {
  return (
    <input
      {...register(name, {
        required: isRequired ? requiredErrorMessage : false,
        validate: isRequired ? validateInputFunction : undefined,
      })}
      type={type}
      id={name}
      name={name}
      className={styles.input}
      placeholder={placeholder}
      disabled={isDisabled}
    />
  );
};

export default Input;
