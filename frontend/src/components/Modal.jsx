export default function Modal({ isOpen, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className='fixed inset-0 bg-black bg-opacity-60 z-30 w-full h-screen' />
      <dialog
        open
        className='fixed top-1/2 border-4 rounded shadow-md overflow-hidden z-40 bg-modalError border-modalErrorBorder'
      >
        {children}
      </dialog>
    </>
  );
}
