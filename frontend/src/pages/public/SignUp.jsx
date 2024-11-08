import React from 'react';
import UserSignupForm from '../../components/UserSignupForm';
import SellerSignupForm from '../../components/SellerSignupForm';

const SignUp = ({userType}) => {

  return (
    <div>
      {/* Conditionally render based on userType */}
      {userType === 'seller' ? <SellerSignupForm /> : <UserSignupForm />}
    </div>
  );
};

export default SignUp;
