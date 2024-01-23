import classes from './Modal.module.css';

export default function Modal({ isOpen, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className={classes.backdrop} />
      <dialog open className={classes.modal}>
        {children}
      </dialog>
    </>
  );
}
