import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Warning = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect after 5 seconds
    const timeout = setTimeout(() => {
      navigate('/');
    }, 3000);

    // Cleanup the timeout if the component is unmounted or redirected before timeout
    return () => clearTimeout(timeout);
  }, [navigate]);

  const handleOkClick = () => {
    // Redirect immediately to the home page when "OK" is clicked
    navigate('/');
  };

  return (
    <div>
      <div
        id="popup-modal"
        tabIndex="-1"
        className="fixed inset-0 z-50 flex justify-center items-center bg-gray-800 bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-center text-lg font-semibold text-gray-700">
            Please log in to continue
          </h3>
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleOkClick}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Warning;
