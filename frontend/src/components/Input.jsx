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
      className='w-[500px] h-[40px] pl-2.5 border border-secondary-300 rounded-sm text-gray-500 text-md'
      placeholder={placeholder}
      disabled={isDisabled}
    />
  );
};

export default Input;
