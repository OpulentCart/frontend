import { useSelector } from "react-redux";
import AccessDenied from "../components/accessDenied";

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const authToken = useSelector((state) => state.auth.access_token);
  const userRole = useSelector((state) => state.auth.user_role);

  if (!authToken) {
    return <AccessDenied />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <AccessDenied />;
  }

  return children;
};

export default RoleBasedRoute;
