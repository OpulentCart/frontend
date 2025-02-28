import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const authToken = useSelector((state) => state.auth.access_token);

  return authToken ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
