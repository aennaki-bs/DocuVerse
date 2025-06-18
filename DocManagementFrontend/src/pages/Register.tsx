import React from "react";
import { MultiStepFormProvider } from "@/context/form";
import RegisterForm from "./register/RegisterForm";
import GlobalStyles from "./register/GlobalStyles";
import SplitScreenLayout from "./register/SplitScreenLayout";

const Register = () => {
  return (
    <MultiStepFormProvider>
      <GlobalStyles />
      <SplitScreenLayout />
    </MultiStepFormProvider>
  );
};

export default Register;
