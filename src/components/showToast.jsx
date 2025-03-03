import { toast } from 'react-toastify';
import { Bounce } from 'react-toastify'; // Import Bounce transition

const showToast = ({ label, theme = 'light', type }) => { // Default theme is light
  const toastOptions = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: theme, // Use the provided theme or default
    transition: Bounce,
  };

  switch (type) {
    case 'success':
      toast.success(label, toastOptions);
      break;
    case 'error':
      toast.error(label, toastOptions);
      break;
    case 'warning':
      toast.warn(label, toastOptions);
      break;
    case 'info':
      toast.info(label, toastOptions);
      break;
    default:
      toast(label, toastOptions); // Default toast if type is not recognized
  }
};

export default showToast; // Export the function